import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { settings, neverSaved } from './fixtures/agentSettings.mjs';

stubBrowserGlobals();

// One bundle so React and react-dom share a single copy.
const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { AgentRows } from './src/components/agents/settings/AgentRows.tsx';
  import { KeywordsSection } from './src/components/agents/settings/KeywordsSection.tsx';
  import { ShiftsSection } from './src/components/agents/settings/ShiftsSection.tsx';
  import { SettingsFooter } from './src/components/agents/settings/SettingsFooter.tsx';
  import { SettingsPanel } from './src/components/agents/settings/SettingsPanel.tsx';
  import { toDraft } from './src/utils/agentSettingsForm.ts';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { AgentRows, KeywordsSection, ShiftsSection, SettingsFooter, SettingsPanel, toDraft };
`);

const noop = () => {};
function state(over = {}, source = settings) {
  return {
    settings: source, draft: m.toDraft(source), loadState: 'ready', saving: false, errors: {}, saveMessage: '',
    dirty: false, canSave: false, readOnly: false,
    retry: noop, save: noop, discard: noop, setAgentName: noop, setAgentEnabled: noop,
    setKeywords: noop, setShift: noop, ...over,
  };
}
const tag = (html, re) => (html.match(re) ?? [''])[0];

test('agent rows', async (t) => {
  await t.test('show a labelled name box per agent, with the default name as placeholder', () => {
    const html = m.render(m.AgentRows, { settings, s: state() });
    assert.match(html, /<label[^>]*for="as-name-1"[^>]*>Name<\/label>/);
    assert.match(html, /placeholder="Priya"/);
    assert.match(html, /Filter - drops non-software postings/);
  });

  await t.test('a required agent has a disabled switch and says why', () => {
    const html = m.render(m.AgentRows, { settings, s: state() });
    const first = tag(html, /<button[^>]*aria-label="Aarav is on"[^>]*>/);
    assert.match(first, /role="switch"/);
    assert.match(first, /disabled=""/);
    assert.match(first, /aria-describedby="as-lock-0"/);
    assert.match(html, /id="as-lock-0"[^>]*>Required: the relay cannot run without this agent\./);
  });

  await t.test('reset-to-default only shows for a renamed agent', () => {
    const renamed = state();
    renamed.draft.agents[1].name = 'Riya';
    const html = m.render(m.AgentRows, { settings, s: renamed });
    assert.match(html, /Reset to default \(Priya\)/);
    assert.strictEqual((html.match(/Reset to default/g) ?? []).length, 1);
  });

  await t.test('a server or client error is shown on the right field and linked by aria-describedby', () => {
    const html = m.render(m.AgentRows, { settings, s: state({ errors: { 'agents[1].name': 'Another agent already uses this name.' } }) });
    const input = tag(html, /<input[^>]*id="as-name-1"[^>]*>/);
    assert.match(input, /aria-invalid="true"/);
    assert.match(input, /aria-describedby="as-name-1-err"/);
    assert.match(html, /id="as-name-1-err"[^>]*role="alert"[^>]*>Another agent already uses this name\./);
    assert.doesNotMatch(tag(html, /<input[^>]*id="as-name-0"[^>]*>/), /aria-invalid/);
  });

  await t.test('guests see disabled inputs and switches and no reset link', () => {
    const renamed = state({ readOnly: true });
    renamed.draft.agents[1].name = 'Riya';
    const html = m.render(m.AgentRows, { settings, s: renamed });
    assert.match(tag(html, /<input[^>]*id="as-name-1"[^>]*>/), /disabled=""/);
    assert.match(tag(html, /<button[^>]*aria-label="Riya is on"[^>]*>/), /disabled=""/);
    assert.doesNotMatch(html, /Reset to default/);
  });
});

test('keywords', async (t) => {
  await t.test('keywords render as removable tags with labelled inputs', () => {
    const html = m.render(m.KeywordsSection, { s: state() });
    assert.match(html, /<label[^>]*for="as-kw-target"[^>]*>Look for/);
    assert.match(html, /<label[^>]*for="as-kw-excluded"[^>]*>Skip/);
    assert.match(html, /aria-label="Remove React"/);
    assert.match(html, /aria-label="Remove copywriter"/);
  });

  await t.test('guests cannot add or remove keywords', () => {
    const html = m.render(m.KeywordsSection, { s: state({ readOnly: true }) });
    assert.match(html, /React/);
    assert.doesNotMatch(html, /aria-label="Remove /);
    assert.doesNotMatch(html, /<input/);
  });

  await t.test('tag text is escaped, not rendered as HTML', () => {
    const s = state();
    s.draft.keywords.target = ['<img src=x onerror=alert(1)>'];
    const html = m.render(m.KeywordsSection, { s });
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;img src=x/);
  });
});

test('shifts', async (t) => {
  await t.test('each shift shows interval, window, read-only time zone and sources from the list', () => {
    const html = m.render(m.ShiftsSection, { settings, s: state() });
    assert.match(html, /Morning shift/);
    assert.match(html, /<option value="2" selected="">2 hours<\/option>/);
    assert.match(html, /Time zone: Asia\/Kolkata \(set by the server\)/);
    assert.match(tag(html, /<input[^>]*id="as-activeFrom-0"[^>]*>/), /value="06:00"/);
    assert.strictEqual((html.match(/type="checkbox"/g) ?? []).length, 8); // 4 sources x 2 shifts
  });

  await t.test('an interval outside the usual choices is kept so nothing is silently changed', () => {
    const html = m.render(m.ShiftsSection, { settings, s: state() }); // second shift has 5 hours
    assert.match(html, /<option value="5" selected="">5 hours<\/option>/);
  });

  await t.test('errors land on the matching shift control', () => {
    const html = m.render(m.ShiftsSection, { settings, s: state({ errors: {
      'shifts[0].intervalHours': 'Choose 1 to 24 hours.',
      'shifts[1].sources': 'Pick at least one source for an enabled shift.',
    } }) });
    assert.match(tag(html, /<select[^>]*id="as-int-0"[^>]*>/), /aria-describedby="as-int-0-err"/);
    assert.match(html, /id="as-int-0-err"[^>]*>Choose 1 to 24 hours\./);
    assert.match(html, /id="as-src-1-err"[^>]*>Pick at least one source/);
  });

  await t.test('guests get a disabled fieldset', () => {
    const html = m.render(m.ShiftsSection, { settings, s: state({ readOnly: true }) });
    assert.strictEqual((html.match(/<fieldset class="as-shift" disabled=""/g) ?? []).length, 2);
  });
});

test('footer and panel', async (t) => {
  await t.test('footer shows who changed settings last, and Save is disabled until there is a change', () => {
    const html = m.render(m.SettingsFooter, { s: state(), onCancel: noop });
    assert.match(html, /Last changed by sales@vsrsalesengine\.com on /);
    assert.match(tag(html, /<button[^>]*class="btn primary"[^>]*>/), /disabled=""/);
    assert.match(html, />Cancel</);
  });

  await t.test('Save is enabled when the form can be saved', () => {
    const html = m.render(m.SettingsFooter, { s: state({ canSave: true, dirty: true }), onCancel: noop });
    assert.doesNotMatch(tag(html, /<button[^>]*class="btn primary"[^>]*>/), /disabled/);
  });

  await t.test('footer says defaults are in use when nothing was ever saved', () => {
    const html = m.render(m.SettingsFooter, { s: state({}, neverSaved), onCancel: noop });
    assert.match(html, /No changes saved yet\. Defaults are in use\./);
  });

  await t.test('guests have no Save button', () => {
    const html = m.render(m.SettingsFooter, { s: state({ readOnly: true }), onCancel: noop });
    assert.doesNotMatch(html, /Save changes/);
    assert.match(html, />Close</);
  });

  await t.test('the panel is an accessible modal dialog and tells guests they cannot edit', () => {
    const html = m.render(m.SettingsPanel, { guest: true, notify: noop, onSaved: noop, onClose: noop });
    assert.match(html, /role="dialog"/);
    assert.match(html, /aria-modal="true"/);
    assert.match(html, /aria-labelledby="as-title"/);
    assert.match(html, /aria-label="Close settings"/);
    assert.match(html, /Guests can(&#x27;|')t change settings\. Sign in to edit\./);
  });

  await t.test('signed-in users do not see the guest banner', () => {
    const html = m.render(m.SettingsPanel, { guest: false, notify: noop, onSaved: noop, onClose: noop });
    assert.doesNotMatch(html, /Guests can(&#x27;|')t change settings/);
  });
});
