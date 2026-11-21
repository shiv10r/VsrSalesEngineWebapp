import test from 'node:test';
import assert from 'node:assert';
import { loadModule } from './_bundle.mjs';
import { heatmap, emptyHeatmap } from './fixtures/heatmap.mjs';

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { LeadHeatmapView } from './src/components/agents/LeadHeatmapView.tsx';
  import { HeatmapGrid } from './src/components/agents/HeatmapGrid.tsx';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { LeadHeatmapView, HeatmapGrid };
`);

const noop = () => {};
const view = (over) => m.render(m.LeadHeatmapView, {
  data: heatmap, loadState: 'ready', days: 28, onDaysChange: noop, onRetry: noop, ...over,
});

test('Lead heat map renders from API-shaped data', async (t) => {
  await t.test('ready state: 7 rows x 24 cells, aria summary, caption, legend and window selector', () => {
    const html = view();
    assert.match(html, /When leads arrive/);
    assert.match(html, /role="img"/);
    assert.match(html, /aria-label="Heat map of new leads by weekday and hour \(IST\), last 28 days\. Busiest slot: Tue 14:00 IST with 6 new leads\."/);
    assert.match(html, /22 new leads in the last 28 days/);
    assert.strictEqual((html.match(/class="ag-hm-day"/g) ?? []).length, 7);
    assert.strictEqual((html.match(/class="ag-hm-cell s\d" title=/g) ?? []).length, 7 * 24);
    assert.match(html, /Less/);
    assert.match(html, /More/);
    assert.match(html, /aria-label="Time window"/);
    assert.strictEqual((html.match(/aria-pressed="true"/g) ?? []).length, 1);
    assert.match(html, /aria-pressed="true">28 days</);
    assert.match(html, />7 days</);
    assert.match(html, />90 days</);
  });

  await t.test('cells carry tooltips and intensity steps from the data', () => {
    const html = view();
    assert.match(html, /class="ag-hm-cell s4" title="Tue 14:00 IST - 6 new leads in 2 runs"/);
    assert.match(html, /class="ag-hm-cell s0" title="Mon 00:00 IST - no new leads"/);
    assert.match(html, /class="ag-hm-cell s1" title="Mon 06:00 IST - 1 new lead in 1 run"/);
  });

  await t.test('shift bands are labelled above the grid', () => {
    const html = view();
    assert.match(html, /Morning shift/);
    assert.match(html, /Day shift/);
    assert.match(html, /Night shift/);
  });

  await t.test('screen readers get the top slots as a list', () => {
    const html = view();
    assert.match(html, /<ol class="ag-sr" aria-label="Busiest slots">/);
    assert.strictEqual((html.match(/<li>/g) ?? []).length, 5);
    assert.match(html, /<li>Tue 14:00 IST - 6 new leads in 2 runs<\/li>/);
  });

  await t.test('empty state is honest and shows no grid or invented numbers', () => {
    const html = view({ data: emptyHeatmap });
    assert.match(html, /No leads recorded yet\. Agents run every 2 hours, so this fills in as they work\./);
    assert.doesNotMatch(html, /role="img"/);
    assert.doesNotMatch(html, /ag-hm-cell/);
    assert.doesNotMatch(html, /new leads in the last/);
  });

  await t.test('loading shows a skeleton, error shows an alert with retry, neither shows numbers', () => {
    const loading = view({ data: null, loadState: 'loading' });
    assert.match(loading, /aria-busy="true"/);
    assert.doesNotMatch(loading, /ag-hm-cell/);
    const error = view({ data: null, loadState: 'error' });
    assert.match(error, /role="alert"/);
    assert.match(error, /Can(&#x27;|')t reach the agents service/);
    assert.match(error, /Try again/);
    assert.doesNotMatch(error, /ag-hm-cell/);
  });

  await t.test('grid has a scroll wrapper for narrow screens and no scripts', () => {
    const html = m.render(m.HeatmapGrid, { data: heatmap });
    assert.match(html, /class="ag-hm-scroll"/);
    assert.doesNotMatch(html, /<script/i);
  });
});
