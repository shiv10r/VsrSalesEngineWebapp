import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { loadModule, root, stubBrowserGlobals } from './_bundle.mjs';

stubBrowserGlobals();

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { ServerStatus } from './src/components/layout/ServerStatus.tsx';
  import { startHealthPolling } from './src/utils/healthPoller.ts';
  import { SourcesScreen } from './src/components/screens/SourcesScreen.tsx';
  import { ReportsScreen } from './src/components/screens/ReportsScreen.tsx';
  import { ActivityLogScreen } from './src/components/screens/ActivityLogScreen.tsx';
  import { useOpportunities } from './src/hooks/useOpportunities.ts';
  import { useContacts } from './src/hooks/useContacts.ts';
  import { useCampaigns } from './src/hooks/useCampaigns.ts';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { ServerStatus, startHealthPolling, SourcesScreen, ReportsScreen, ActivityLogScreen };
  const ui = { query: '', statusFilter: 'All statuses', sourceFilter: 'All sources', notify() {}, userEmail: '' };
  export function Probe() {
    return h('pre', null, JSON.stringify({
      o: useOpportunities(ui).opportunities, c: useContacts(ui).contacts, k: useCampaigns(ui).campaigns,
    }));
  }
`);

const heading = (t) => `<h1>${t}</h1>`;
const kpi = (title, value, _icon, _tone, foot) => `<div>${title}:${value}:${foot ?? ''}</div>`;
const tick = () => new Promise(r => setImmediate(r));

test('real server status banner', async (t) => {
  await t.test('green text when the server answers, amber text when it does not', () => {
    const up = m.render(m.ServerStatus, { ok: true, onSettings() {} });
    const down = m.render(m.ServerStatus, { ok: false, onSettings() {} });
    assert.match(up, /Connected to the server/);
    assert.match(up, /server-status up/);
    assert.match(down, /reach the server/);
    assert.match(down, /server-status down/);
    assert.match(m.render(m.ServerStatus, { ok: null, onSettings() {} }), /Checking the server/);
  });

  await t.test('polls every interval and pauses while the tab is hidden', async () => {
    let hidden = false;
    let handler = () => {};
    const timers = new Map();
    let nextId = 1;
    let calls = 0;
    const results = [];
    const env = {
      isHidden: () => hidden,
      onVisibilityChange: (h) => { handler = h; return () => {}; },
      setInterval: (fn) => { const id = nextId++; timers.set(id, fn); return id; },
      clearInterval: (id) => timers.delete(id),
    };
    const stop = m.startHealthPolling(async () => { calls++; return calls < 3; }, (ok) => results.push(ok), 60000, env);
    await tick();
    assert.strictEqual(calls, 1, 'checks immediately');
    assert.strictEqual(timers.size, 1);

    [...timers.values()][0]();
    await tick();
    assert.strictEqual(calls, 2);

    hidden = true; handler();
    assert.strictEqual(timers.size, 0, 'no polling while hidden');

    hidden = false; handler();
    await tick();
    assert.strictEqual(calls, 3, 'checks again when visible');
    assert.strictEqual(timers.size, 1);
    assert.deepStrictEqual(results, [true, true, false]);
    stop();
    assert.strictEqual(timers.size, 0);
  });
});

test('no invented data on screen', async (t) => {
  await t.test('hooks start empty, not with demo rows', () => {
    const html = m.render(m.Probe, {});
    assert.match(html, /\{&quot;o&quot;:\[\],&quot;c&quot;:\[\],&quot;k&quot;:\[\]\}/);
  });

  await t.test('sources screen shows an honest message instead of made-up sources', () => {
    const html = m.render(m.SourcesScreen, { ctx: { sources: [], pageHeading: heading, loadSourcesAndProfiles() {}, notify() {}, handleUpdateSourceStatus() {} } });
    assert.match(html, /No sources came back from the server/);
    assert.doesNotMatch(html, /Company careers|Public procurement|Approved feed/);
  });

  await t.test('reports show zeros, not 100% or 1 source, with no data', () => {
    const html = m.render(m.ReportsScreen, { ctx: { pageHeading: heading, kpi, opportunities: [], outreachRows: [] } });
    assert.match(html, /Opportunities found:0/);
    assert.match(html, /Replies:0/);
    assert.match(html, /Sources with results:0/);
    assert.doesNotMatch(html, /100%/);
  });

  await t.test('activity log shows empty states, not fake failures or metrics', () => {
    const ctx = {
      reliabilityMetrics: null, failedRuns: [], pageHeading: heading, go() {}, loadReliabilityData() {}, notify() {},
      activityTab: 'failures', setActivityTab() {}, isRetryingId: null, handleRetryFailure() {},
    };
    const failures = m.render(m.ActivityLogScreen, { ctx });
    assert.match(failures, /No failed runs recorded/);
    assert.doesNotMatch(failures, /EXEC-00|Simulate|blocked-client/);
    const metrics = m.render(m.ActivityLogScreen, { ctx: { ...ctx, activityTab: 'metrics' } });
    assert.match(metrics, /No health metrics from the server yet/);
    assert.doesNotMatch(metrics, /Company careers/);
  });
});

test('false claims and fake fixtures are gone from the source', () => {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(e.name)) files.push(p);
  });
  walk(path.join(root, 'src'));
  const banned = [/Gemini 2\.5/, /LIVE ENGINE CONNECTED/, /API v0\.1\.0/, /seedOpportunities|seedContacts|seedCampaigns|seedActivities/, /Northstar Digital/, /Illustrative source mix/, /\(local\)/];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const re of banned) assert.doesNotMatch(text, re, `${path.relative(root, f)} contains ${re}`);
  }
  assert.ok(!fs.existsSync(path.join(root, 'src/data/seeds.ts')));
});
