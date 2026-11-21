import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { settings } from './fixtures/agentSettings.mjs';

stubBrowserGlobals();
const m = await loadModule(`
  export { createAgentsApi } from './src/services/agents.ts';
  export { ApiCore } from './src/services/http.ts';
  export * from './src/utils/agentSettingsForm.ts';
`);

function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body });
    return handler(url, init);
  };
  return calls;
}
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const makeApi = () => { const core = new m.ApiCore(); core.setToken('t'); return m.createAgentsApi(core); };
const clone = (v) => JSON.parse(JSON.stringify(v));

test('settings API', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; });

  await t.test('GET sends the bearer token and returns the settings', async () => {
    const calls = mockFetch(() => json(200, settings));
    const got = await makeApi().getAgentSettings();
    assert.strictEqual(calls[0].url.endsWith('/agents/settings'), true);
    assert.strictEqual(calls[0].method, 'GET');
    assert.strictEqual(calls[0].headers.Authorization, 'Bearer t');
    assert.deepStrictEqual(got, settings);
  });

  await t.test('GET throws on a failed response so the UI can say it is unreachable', async () => {
    mockFetch(() => json(500, {}));
    await assert.rejects(() => makeApi().getAgentSettings());
  });

  await t.test('PUT sends the draft as JSON and returns the saved settings', async () => {
    const draft = m.toDraft(settings);
    const calls = mockFetch(() => json(200, settings));
    const result = await makeApi().saveAgentSettings(draft);
    assert.strictEqual(calls[0].method, 'PUT');
    assert.strictEqual(calls[0].headers['Content-Type'], 'application/json');
    assert.deepStrictEqual(JSON.parse(calls[0].body), draft);
    assert.strictEqual(result.ok, true);
  });

  await t.test('PUT body has only the editable fields', () => {
    const draft = m.toDraft(settings);
    assert.deepStrictEqual(Object.keys(draft.agents[0]).sort(), ['enabled', 'id', 'name']);
    assert.deepStrictEqual(Object.keys(draft.shifts[0]).sort(),
      ['activeFrom', 'activeTo', 'enabled', 'intervalHours', 'scheduleId', 'sources']);
  });

  await t.test('400 returns the per-field errors', async () => {
    mockFetch(() => json(400, { errors: [{ field: 'agents[2].name', message: 'Taken.' }, { nope: 1 }] }));
    const result = await makeApi().saveAgentSettings(m.toDraft(settings));
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.reason, 'validation');
    assert.deepStrictEqual(result.errors, [{ field: 'agents[2].name', message: 'Taken.' }]);
  });

  await t.test('400 without field errors falls back to the server message', async () => {
    mockFetch(() => json(400, { message: 'Bad request.' }));
    const result = await makeApi().saveAgentSettings(m.toDraft(settings));
    assert.strictEqual(result.reason, 'validation');
    assert.strictEqual(result.message, 'Bad request.');
  });

  await t.test('403 says guests cannot change settings', async () => {
    mockFetch(() => json(403, {}));
    const result = await makeApi().saveAgentSettings(m.toDraft(settings));
    assert.strictEqual(result.reason, 'forbidden');
    assert.match(result.message, /Guests can't change settings/);
  });

  await t.test('server error and network failure give honest messages', async () => {
    mockFetch(() => json(500, {}));
    assert.match((await makeApi().saveAgentSettings(m.toDraft(settings))).message, /responded 500/);
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    assert.match((await makeApi().saveAgentSettings(m.toDraft(settings))).message, /Could not reach/);
  });
});

test('dirty check', async (t) => {
  await t.test('a fresh draft is not dirty', () => {
    assert.strictEqual(m.isDirty(settings, m.toDraft(settings)), false);
  });
  await t.test('renaming, threshold, keywords and shift changes make it dirty', () => {
    const a = m.toDraft(settings); a.agents[1].name = 'Riya';
    const b = m.toDraft(settings); b.draftThreshold = 60;
    const c = m.toDraft(settings); c.keywords.target.push('Node');
    const d = m.toDraft(settings); d.shifts[0].intervalHours = 3;
    for (const draft of [a, b, c, d]) assert.strictEqual(m.isDirty(settings, draft), true);
  });
  await t.test('trailing spaces and source order alone do not count as a change', () => {
    const draft = m.toDraft(settings);
    draft.agents[0].name = 'Aarav  ';
    draft.shifts[0].sources = [...draft.shifts[0].sources].reverse();
    assert.strictEqual(m.isDirty(settings, draft), false);
  });
  await t.test('null inputs are never dirty', () => {
    assert.strictEqual(m.isDirty(null, null), false);
  });
  await t.test('toDraft copies, so editing the draft never changes the server copy', () => {
    const draft = m.toDraft(settings);
    draft.keywords.target.push('x');
    draft.shifts[0].sources.push('y');
    assert.deepStrictEqual(settings.keywords.target, ['React', '.NET']);
    assert.deepStrictEqual(settings.shifts[0].sources, ['Hacker News', 'Remotive']);
  });
});

test('validation mirrors the server rules', async (t) => {
  const bad = (mutate) => { const d = m.toDraft(settings); mutate(d); return m.errorsByField(m.validateDraft(d)); };

  await t.test('the fixture is valid', () => {
    assert.deepStrictEqual(m.validateDraft(m.toDraft(settings)), []);
  });
  await t.test('names: empty, too long, bad characters, duplicates (any case)', () => {
    assert.match(bad(d => { d.agents[0].name = '  '; })['agents[0].name'], /Enter a name/);
    assert.match(bad(d => { d.agents[0].name = 'A'.repeat(25); })['agents[0].name'], /24 characters/);
    assert.match(bad(d => { d.agents[0].name = 'R2D2!'; })['agents[0].name'], /letters, spaces/);
    assert.match(bad(d => { d.agents[2].name = 'priya'; })['agents[2].name'], /already uses/);
  });
  await t.test('names: apostrophes, hyphens, spaces and accented letters are fine', () => {
    assert.deepStrictEqual(bad(d => { d.agents[0].name = "Anne-Marie O'Neil"; }), {});
    assert.deepStrictEqual(bad(d => { d.agents[0].name = 'Zoë'; }), {});
  });
  await t.test('threshold must be a whole number from 0 to 100', () => {
    for (const v of [-1, 101, 50.5, NaN]) assert.ok(bad(d => { d.draftThreshold = v; }).draftThreshold, `value ${v}`);
    for (const v of [0, 100]) assert.deepStrictEqual(bad(d => { d.draftThreshold = v; }), {});
  });
  await t.test('interval 1 to 24 only', () => {
    assert.ok(bad(d => { d.shifts[0].intervalHours = 0; })['shifts[0].intervalHours']);
    assert.ok(bad(d => { d.shifts[0].intervalHours = 25; })['shifts[0].intervalHours']);
    assert.deepStrictEqual(bad(d => { d.shifts[0].intervalHours = 24; }), {});
  });
  await t.test('an enabled shift needs a source; a disabled one does not', () => {
    assert.ok(bad(d => { d.shifts[0].sources = []; })['shifts[0].sources']);
    assert.deepStrictEqual(bad(d => { d.shifts[1].sources = []; }), {});
  });
  await t.test('times must look like HH:mm', () => {
    assert.ok(bad(d => { d.shifts[0].activeFrom = '6am'; })['shifts[0].activeFrom']);
    assert.ok(bad(d => { d.shifts[0].activeTo = '24:00'; })['shifts[0].activeTo']);
  });
  await t.test('errorsByField keeps the first message for a field', () => {
    assert.deepStrictEqual(m.errorsByField([{ field: 'a', message: '1' }, { field: 'a', message: '2' }]), { a: '1' });
  });
});

test('switch locks', async (t) => {
  const draft = m.toDraft(settings);
  await t.test('required agents cannot be switched off', () => {
    assert.match(m.agentLockReason(settings.agents[0], draft.agents), /Required/);
  });
  await t.test('compliance is locked while the drafter is on, free once it is off', () => {
    assert.match(m.agentLockReason(settings.agents[3], draft.agents), /Drafter is on/);
    const off = m.toDraft(settings); off.agents[2].enabled = false;
    assert.strictEqual(m.agentLockReason(settings.agents[3], off.agents), null);
  });
  await t.test('other agents are free', () => {
    assert.strictEqual(m.agentLockReason(settings.agents[1], draft.agents), null);
  });
});

test('keyword helpers and footer text', async (t) => {
  await t.test('addTags splits on commas, trims and ignores blanks and duplicates (any case)', () => {
    assert.deepStrictEqual(m.addTags(['React'], ' node , REACT,, go '), ['React', 'node', 'go']);
    assert.deepStrictEqual(m.addTags([], '   '), []);
  });
  await t.test('addTags does not change the original list', () => {
    const original = ['a']; m.addTags(original, 'b');
    assert.deepStrictEqual(original, ['a']);
  });
  await t.test('removeTag removes exactly that tag', () => {
    assert.deepStrictEqual(m.removeTag(['a', 'b'], 'a'), ['b']);
  });
  await t.test('lastChangedText names who and when, or nothing if never saved', () => {
    assert.strictEqual(m.lastChangedText('Asha', '2026-11-21T00:00:00Z', iso => `on ${iso}`), 'Last changed by Asha on on 2026-11-21T00:00:00Z');
    assert.strictEqual(m.lastChangedText(null, '2026-11-21T00:00:00Z', () => 'X'), 'Last changed on X');
    assert.strictEqual(m.lastChangedText('Asha', null, () => 'X'), null);
  });
  await t.test('clone helper sanity', () => assert.deepStrictEqual(clone(settings), settings));
});
