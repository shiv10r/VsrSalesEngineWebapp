import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { emptyPage, emptySummary, options, page, summary } from './fixtures/localLeads.mjs';

stubBrowserGlobals();

// One bundle so React and react-dom share a single copy.
const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { LocalLeadsScreen } from './src/components/screens/LocalLeadsScreen.tsx';
  import { SummaryStrip } from './src/components/localLeads/SummaryStrip.tsx';
  import { DistrictCategoryGrid } from './src/components/localLeads/DistrictCategoryGrid.tsx';
  import { LeadsTable } from './src/components/localLeads/LeadsTable.tsx';
  import { AddLeadModal } from './src/components/localLeads/AddLeadModal.tsx';
  import { ImportCsvModal } from './src/components/localLeads/ImportCsvModal.tsx';
  import { ImportResultView } from './src/components/localLeads/ImportResultView.tsx';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { h };
  export { LocalLeadsScreen, SummaryStrip, DistrictCategoryGrid, LeadsTable, AddLeadModal, ImportCsvModal, ImportResultView };
`);

const noop = () => {};
const heading = (title, _sub, actions) => m.h('div', null, m.h('h1', null, title), actions);

function ctx(over = {}) {
  const localLeads = {
    options, summary, list: page, filters: { district: '', category: '', status: '', noWebsite: false, q: '' },
    searchInput: '', setSearchInput: noop, page: 1, setPage: noop, loadState: 'ready', busyId: null, readOnly: false,
    setFilter: noop, clearFilters: noop, pickCell: noop, retry: noop, update: async () => true, remove: async () => true,
    add: async () => ({ ok: true, value: {} }), importRows: async () => ({ ok: true, value: {} }), ...over,
  };
  return { pageHeading: heading, localLeads };
}

test('Local Leads page', async (t) => {
  await t.test('summary numbers come from the API data only', () => {
    const html = m.render(m.SummaryStrip, { summary });
    assert.match(html, /Local leads[\s\S]*>3</);
    assert.match(html, /Without a website[\s\S]*>1</);
    assert.match(html, /33% of leads/);
    assert.match(html, /Top district[\s\S]*Lucknow/);
    assert.match(html, /Top category[\s\S]*Healthcare/);
  });

  await t.test('summary shows dashes, not made-up numbers, when empty', () => {
    const html = m.render(m.SummaryStrip, { summary: emptySummary });
    assert.match(html, /Top district[\s\S]*—/);
    assert.match(html, /no leads yet/);
  });

  await t.test('grid renders count cells with labels and marks the selected cell', () => {
    const html = m.render(m.DistrictCategoryGrid, {
      summary, categories: options.categories, selected: { district: 'Lucknow', category: 'Healthcare' }, onPick: noop,
    });
    assert.match(html, /aria-label="Lucknow, Healthcare: 2 leads"[^>]*>2</);
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /aria-label="Gautam Buddh Nagar, Education &amp; coaching: 1 lead"/);
    assert.match(html, /disabled=""/, 'empty cells are not clickable');
  });

  await t.test('grid says so when there are no leads', () => {
    const html = m.render(m.DistrictCategoryGrid, { summary: emptySummary, categories: options.categories, selected: { district: '', category: '' }, onPick: noop });
    assert.match(html, /No leads yet, so there is nothing to map/);
  });

  await t.test('table: No website badge, tel link, category reason tooltip, safe website links only', () => {
    const html = m.render(m.LeadsTable, {
      items: page.items, statuses: options.statuses, readOnly: false, busyId: null, onStatus: noop, onNotes: async () => true, onDelete: noop,
    });
    assert.match(html, /No website/);
    assert.match(html, /href="tel:9876543210"/);
    assert.match(html, /title="Name contains &quot;dental&quot; and &quot;clinic&quot;"/);
    assert.match(html, /href="https:\/\/brightfuture\.example\/"[^>]*rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /javascript:/, 'a javascript: website must never become a link');
    assert.match(html, /4\.5 \(120\)/);
    assert.match(html, /aria-label="Delete Sharma Dental Clinic"/);
  });

  await t.test('table is read-only for guests: status disabled with the reason, no delete or edit buttons', () => {
    const html = m.render(m.LeadsTable, {
      items: page.items, statuses: options.statuses, readOnly: true, busyId: null, onStatus: noop, onNotes: async () => true, onDelete: noop,
    });
    assert.match(html, /<select[^>]*disabled=""[^>]*title="Guests can&#x27;t change leads\. Sign in to edit\."/);
    assert.doesNotMatch(html, /aria-label="Delete /);
    assert.doesNotMatch(html, /aria-label="Edit notes for/);
  });

  await t.test('screen: full page for a signed-in user', () => {
    const html = m.render(m.LocalLeadsScreen, { ctx: ctx() });
    assert.match(html, /<h1>Local Leads<\/h1>/);
    assert.match(html, /Import CSV/);
    assert.match(html, /Add lead/);
    assert.match(html, /Sources are CSV imports and manual entries\. Categories are assigned by simple keyword rules, not AI\./);
    assert.doesNotMatch(html, /Guests can view local leads/);
  });

  await t.test('screen: guest banner shown and write buttons disabled with the reason', () => {
    const html = m.render(m.LocalLeadsScreen, { ctx: ctx({ readOnly: true }) });
    assert.match(html, /Guests can view local leads but can&#x27;t import, add or edit them/);
    assert.match(html, /<button[^>]*disabled=""[^>]*title="Guests can&#x27;t change leads\. Sign in to edit\."[^>]*>[\s\S]*?Import CSV/);
  });

  await t.test('screen: empty state explains how to import', () => {
    const html = m.render(m.LocalLeadsScreen, { ctx: ctx({ summary: emptySummary, list: emptyPage }) });
    assert.match(html, /No local leads yet/);
    assert.match(html, /Import a CSV of businesses/);
  });

  await t.test('screen: filtered-empty state offers to clear filters', () => {
    const html = m.render(m.LocalLeadsScreen, {
      ctx: ctx({ list: emptyPage, filters: { district: 'Azamgarh', category: '', status: '', noWebsite: false, q: '' } }),
    });
    assert.match(html, /No leads match these filters/);
  });

  await t.test('screen: loading skeleton and unreachable state are honest', () => {
    const loading = m.render(m.LocalLeadsScreen, { ctx: ctx({ summary: null, list: null, options: null, loadState: 'loading' }) });
    assert.match(loading, /aria-busy="true"/);
    const failed = m.render(m.LocalLeadsScreen, { ctx: ctx({ summary: null, list: null, options: null, loadState: 'error' }) });
    assert.match(failed, /Can&#x27;t reach the local leads service/);
    assert.match(failed, /Try again/);
  });

  await t.test('add-lead form has labelled required fields', () => {
    const html = m.render(m.AddLeadModal, { options, onClose: noop, onSubmit: async () => ({ ok: true }) });
    assert.match(html, /<label[^>]*for="ll-add-businessName"[^>]*>Business name \*/);
    assert.match(html, /<label[^>]*for="ll-add-district"[^>]*>District \*/);
    assert.match(html, /Detect from the name/);
    assert.match(html, /role="dialog"[^>]*aria-modal="true"/);
  });

  await t.test('import dialog starts empty, with the privacy note and a disabled import button', () => {
    const html = m.render(m.ImportCsvModal, { options, onClose: noop, onImport: async () => ({ ok: true }) });
    assert.match(html, /The file stays in your browser until you confirm/);
    assert.match(html, /<button[^>]*disabled=""[^>]*>Import 0 leads/);
  });

  await t.test('import result lists server and browser-side problems with row numbers, in order', () => {
    const html = m.render(m.ImportResultView, {
      result: { imported: 2, duplicates: 1, skipped: 1, errors: [{ row: 7, message: 'District not recognised' }] },
      skipped: [{ row: 3, message: 'Missing business name' }],
    });
    assert.match(html, /Imported[\s\S]*>2</);
    assert.match(html, /Already in your list[\s\S]*>1</);
    assert.ok(html.indexOf('Row 3: Missing business name (not uploaded)') < html.indexOf('Row 7: District not recognised'));
  });
});
