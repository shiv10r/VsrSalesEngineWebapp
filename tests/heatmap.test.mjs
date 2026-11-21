import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { heatmap, emptyHeatmap } from './fixtures/heatmap.mjs';

stubBrowserGlobals();
const m = await loadModule(`
  export { createAgentsApi, buildHeatmapPath } from './src/services/agents.ts';
  export { ApiCore } from './src/services/http.ts';
  export * from './src/utils/heatmapFormat.ts';
`);

function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers ?? {} });
    return handler(url, init);
  };
  return calls;
}
const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('Heat map API request shape', async (t) => {
  const core = new m.ApiCore();
  core.setToken('test-token');
  const api = m.createAgentsApi(core);

  await t.test('path defaults to 28 days and encodes the window', () => {
    assert.strictEqual(m.buildHeatmapPath(), '/agents/heatmap?days=28');
    assert.strictEqual(m.buildHeatmapPath(7), '/agents/heatmap?days=7');
    assert.strictEqual(m.buildHeatmapPath(90), '/agents/heatmap?days=90');
  });

  await t.test('getHeatmap is a GET with the bearer token and returns the parsed body', async () => {
    const calls = mockFetch(() => json(200, heatmap));
    const result = await api.getHeatmap();
    assert.strictEqual(calls[0].url, '/api/agents/heatmap?days=28');
    assert.strictEqual(calls[0].method, 'GET');
    assert.strictEqual(calls[0].headers.Authorization, 'Bearer test-token');
    assert.strictEqual(result.totalNewLeads, 22);
    await api.getHeatmap(7);
    assert.strictEqual(calls[1].url, '/api/agents/heatmap?days=7');
  });

  await t.test('throws when the server fails so the UI shows an honest error state', async () => {
    mockFetch(() => json(500, {}));
    await assert.rejects(() => api.getHeatmap(), /500/);
    mockFetch(() => { throw new TypeError('network down'); });
    await assert.rejects(() => api.getHeatmap());
  });
});

test('Heat map helpers', async (t) => {
  await t.test('buildMatrix makes a dense 7x24 grid from sparse cells', () => {
    const x = m.buildMatrix(heatmap.cells);
    assert.strictEqual(x.leads.length, 7);
    assert.ok(x.leads.every(row => row.length === 24));
    assert.strictEqual(x.leads[1][14], 6);
    assert.strictEqual(x.runs[1][14], 2);
    assert.strictEqual(x.leads[2][5], 0);
    assert.strictEqual(x.max, 6);
  });

  await t.test('buildMatrix ignores out-of-range cells and sums duplicates', () => {
    const x = m.buildMatrix([
      { dayOfWeek: 7, hour: 3, newLeads: 9, runs: 1 },
      { dayOfWeek: 2, hour: 24, newLeads: 9, runs: 1 },
      { dayOfWeek: -1, hour: 3, newLeads: 9, runs: 1 },
      { dayOfWeek: 2, hour: 3, newLeads: 2, runs: 1 },
      { dayOfWeek: 2, hour: 3, newLeads: 3, runs: 2 },
    ]);
    assert.strictEqual(x.leads[2][3], 5);
    assert.strictEqual(x.runs[2][3], 3);
    assert.strictEqual(x.max, 5);
    assert.strictEqual(x.leads.flat().reduce((a, b) => a + b, 0), 5);
    assert.strictEqual(m.buildMatrix([]).max, 0);
  });

  await t.test('intensityStep: 0 is empty, any lead is at least step 1, the busiest cell is step 4', () => {
    assert.strictEqual(m.intensityStep(0, 6), 0);
    assert.strictEqual(m.intensityStep(5, 0), 0);
    assert.strictEqual(m.intensityStep(1, 100), 1);
    assert.strictEqual(m.intensityStep(6, 6), 4);
    assert.deepStrictEqual([1, 2, 3, 4].map(v => m.intensityStep(v, 4)), [1, 2, 3, 4]);
    assert.ok(m.intensityStep(3, 6) >= 2 && m.intensityStep(3, 6) <= 3);
  });

  await t.test('busiest slot and top slots rank by leads, ties by weekday then hour', () => {
    const best = m.busiestSlot(heatmap.cells);
    assert.deepStrictEqual(best, { dayOfWeek: 1, hour: 14, newLeads: 6, runs: 2 }, 'Tue 14 and Thu 09 tie at 6; earlier weekday wins');
    const top = m.topSlots(heatmap.cells, 5);
    assert.strictEqual(top.length, 5);
    assert.deepStrictEqual(top.map(s => s.newLeads), [6, 6, 4, 3, 2]);
    assert.strictEqual(m.topSlots(heatmap.cells, 2).length, 2);
    assert.strictEqual(m.busiestSlot([]), null);
    assert.deepStrictEqual(m.topSlots([]), []);
  });

  await t.test('cell tooltip wording, singular and plural, with IST label', () => {
    assert.strictEqual(m.cellTitle(1, 14, 6, 2, 'Asia/Kolkata'), 'Tue 14:00 IST - 6 new leads in 2 runs');
    assert.strictEqual(m.cellTitle(0, 6, 1, 1, 'Asia/Kolkata'), 'Mon 06:00 IST - 1 new lead in 1 run');
    assert.strictEqual(m.cellTitle(6, 0, 0, 0, 'Asia/Kolkata'), 'Sun 00:00 IST - no new leads');
    assert.strictEqual(m.cellTitle(2, 9, 2, 1, 'UTC'), 'Wed 09:00 UTC - 2 new leads in 1 run');
  });

  await t.test('caption and screen-reader summary state only what the data says', () => {
    assert.strictEqual(m.caption(22, 28), '22 new leads in the last 28 days');
    assert.strictEqual(m.caption(1, 7), '1 new lead in the last 7 days');
    const label = m.summaryLabel(heatmap);
    assert.match(label, /Heat map of new leads by weekday and hour \(IST\), last 28 days\./);
    assert.match(label, /Busiest slot: Tue 14:00 IST with 6 new leads\./);
    assert.match(m.summaryLabel(emptyHeatmap), /No leads recorded yet\./);
  });

  await t.test('shift bands cover the 24-hour axis exactly once, in order', () => {
    let at = 0;
    for (const band of m.SHIFT_BANDS) {
      assert.strictEqual(band.start, at);
      at = band.end;
    }
    assert.strictEqual(at, 24);
    assert.deepStrictEqual(m.WINDOWS, [7, 28, 90]);
  });
});
