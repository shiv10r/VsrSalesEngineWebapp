import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { emptyPage, options, page, summary } from './fixtures/localLeads.mjs';
import { liveDetails, mapsState, placeResults } from './fixtures/mapsSearch.mjs';

stubBrowserGlobals();

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { MapsSearchPanel } from './src/components/localLeads/MapsSearchPanel.tsx';
  import { PlaceResultCard } from './src/components/localLeads/PlaceResultCard.tsx';
  import { MapsSetupCard } from './src/components/localLeads/MapsSetupCard.tsx';
  import { LiveDetails } from './src/components/localLeads/LiveDetails.tsx';
  import { LeadsTable } from './src/components/localLeads/LeadsTable.tsx';
  import { LocalLeadsEmpty, NO_MATCH_MESSAGE } from './src/components/localLeads/LocalLeadsStates.tsx';
  import { LocalLeadsScreen } from './src/components/screens/LocalLeadsScreen.tsx';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { h, MapsSearchPanel, PlaceResultCard, MapsSetupCard, LiveDetails, LeadsTable, LocalLeadsEmpty, NO_MATCH_MESSAGE, LocalLeadsScreen };
`);

const noop = () => {};
const card = (place, over = {}) => m.render(m.PlaceResultCard, { place, guest: false, onSave: noop, ...over });
const withGkp = { ...options, districts: [...options.districts, 'Gorakhpur'] };
const panel = (over = {}) => m.render(m.MapsSearchPanel, { options: withGkp, maps: mapsState(over) });

test('Find on Google Maps panel', async (t) => {
  await t.test('result card: tel link, No website badge, rating, category chip, safe Maps link', () => {
    const html = card(placeResults[0]);
    assert.match(html, /Kanha Interiors/);
    assert.match(html, /href="tel:05512345678"/);
    assert.match(html, /No website/);
    assert.match(html, /4\.6 \(88\)/);
    assert.match(html, /ll-chip">Professional Services/);
    assert.match(html, /href="https:\/\/maps\.google\.com\/\?cid=1"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
    assert.match(html, /Open in Google Maps/);
    assert.match(html, /Save as lead/);
  });

  await t.test('result card: website is a link, and an unsafe Maps link is never rendered', () => {
    const html = card(placeResults[1]);
    assert.match(html, /href="https:\/\/greenhotel\.example\/"[^>]*rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /No website/);
    assert.doesNotMatch(html, /javascript:/);
    assert.doesNotMatch(html, /Open in Google Maps/);
  });

  await t.test('result card: save button turns into Saved, and shows Saving while busy', () => {
    const saved = card(placeResults[0], { saveState: 'saved' });
    assert.match(saved, /<button[^>]*disabled=""[^>]*>[\s\S]*Saved/);
    assert.doesNotMatch(saved, /Save as lead/);
    assert.match(card(placeResults[0], { saveState: 'saving' }), /Saving/);
  });

  await t.test('guests: Save is disabled with the reason', () => {
    const html = card(placeResults[0], { guest: true });
    assert.match(html, /<button[^>]*disabled=""[^>]*title="Guests can&#x27;t search Google Maps or save leads\. Sign in to do that\."/);
  });

  await t.test('panel: form, note, remaining searches and live results', () => {
    const html = panel({ searchState: 'ready', results: placeResults });
    assert.match(html, /<label[^>]*for="ms-district"[^>]*>District/);
    assert.match(html, /<option value="Gorakhpur" selected=""/);
    assert.match(html, /97 of 100 searches left today/);
    assert.match(html, /Results come live from Google&#x27;s official Places API\. Only the name, district, category and Maps link are saved\./);
    assert.match(html, /2 results from Google Maps/);
    assert.match(html, /Green Hotel/);
  });

  await t.test('panel: Search is enabled when configured, a district is chosen and the user is signed in', () => {
    const html = panel();
    assert.match(html, /<button type="submit" class="btn primary ms-btn"><svg/);
  });

  await t.test('panel: guests see the panel but Search is disabled with the reason', () => {
    const html = panel({ guest: true });
    assert.match(html, /<button type="submit"[^>]*disabled=""[^>]*title="Guests can&#x27;t search Google Maps or save leads\. Sign in to do that\."/);
    assert.match(html, /<p class="ll-muted ms-reason">Guests can&#x27;t search/);
  });

  await t.test('panel: Search is disabled until a district is chosen', () => {
    const html = panel({ form: { district: '', category: '', query: '', maxResults: 10 } });
    assert.match(html, /<button type="submit"[^>]*disabled=""[^>]*title="Choose a district first\."/);
  });

  await t.test('panel: not configured shows the setup card with fallback links, and Search is disabled', () => {
    const html = panel({ status: { configured: false, dailyCap: 100, remainingToday: 100 } });
    assert.match(html, /Google Maps search needs an API key\. Add <code>GooglePlaces__ApiKey<\/code> on Render/);
    assert.match(html, /Open Google Maps search for interior designer in Gorakhpur/);
    assert.match(html, /href="https:\/\/www\.google\.com\/maps\/search\/interior%20designer%20Gorakhpur%20Uttar%20Pradesh"/);
    assert.match(html, /Justdial/);
    assert.match(html, /<button type="submit"[^>]*disabled=""/);
    assert.doesNotMatch(html, /searches left today/);
  });

  await t.test('setup card without a district asks for one instead of linking', () => {
    const html = m.render(m.MapsSetupCard, { district: '', query: '', category: '' });
    assert.match(html, /Choose a district to get manual search links/);
    assert.doesNotMatch(html, /href=/);
  });

  await t.test('panel: honest loading, error and unreachable states', () => {
    assert.match(panel({ searchState: 'loading' }), /aria-busy="true"/);
    assert.match(panel({ searchState: 'error', searchError: 'Daily Google Maps search limit (100) reached.' }), /role="alert"[^>]*>Daily Google Maps search limit/);
    const unreachable = panel({ status: null, statusState: 'error' });
    assert.match(unreachable, /Can&#x27;t reach the search service/);
    assert.match(unreachable, /Try again/);
    assert.match(panel({ searchState: 'ready', results: [] }), /Google found nothing for that search/);
  });

  await t.test('empty saved-leads state explains the page and offers the Maps panel', () => {
    const html = m.render(m.LocalLeadsEmpty, { filtered: true, canWrite: true, onImport: noop, onClear: noop, onFindOnMaps: noop });
    assert.strictEqual(m.NO_MATCH_MESSAGE,
      'No saved leads match. This page searches leads you saved. Use Find on Google Maps to search live, or import a CSV.');
    assert.ok(html.includes('No saved leads match. This page searches leads you saved. Use Find on Google Maps to search live, or import a CSV.'));
    assert.match(html, /<button[^>]*>Find on Google Maps<\/button>/);
    assert.match(html, /Clear filters/);
  });

  await t.test('screen: a search that finds nothing shows the new message and the tabs', () => {
    const noop2 = () => {};
    const ctx = {
      pageHeading: (title) => m.h('h1', null, title), notify: noop2,
      localLeads: {
        options, summary, list: emptyPage, filters: { district: '', category: '', status: '', noWebsite: false, q: 'interior' },
        searchInput: 'interior', setSearchInput: noop2, page: 1, setPage: noop2, loadState: 'ready', busyId: null, readOnly: false,
        setFilter: noop2, clearFilters: noop2, pickCell: noop2, retry: noop2, reload: noop2, update: async () => true,
        remove: async () => true, add: async () => ({ ok: true }), importRows: async () => ({ ok: true }),
      },
    };
    const html = m.render(m.LocalLeadsScreen, { ctx });
    assert.match(html, /role="tablist"/);
    assert.match(html, /No saved leads match\. This page searches leads you saved/);
    assert.match(html, /Find on Google Maps/);
  });

  await t.test('table: Show live details only on Google Maps leads, and the live block says it is not saved', () => {
    const lead = { ...page.items[0], id: 'LL-G', source: 'Google Maps', placeId: 'ChIJ1', mapsUrl: 'https://maps.google.com/?cid=1' };
    const base = {
      items: [lead, page.items[1]], statuses: options.statuses, readOnly: false, busyId: null,
      onStatus: noop, onNotes: async () => true, onDelete: noop, onShowLive: noop, onHideLive: noop,
    };
    const html = m.render(m.LeadsTable, { ...base, live: {} });
    assert.strictEqual((html.match(/Show live details/g) || []).length, 1);
    const open = m.render(m.LeadsTable, { ...base, live: { 'LL-G': { state: 'ready', details: liveDetails } } });
    assert.match(open, /Live from Google, not saved/);
    assert.match(open, /href="tel:05512345678"/);
    assert.doesNotMatch(open, /Show live details/);
    const failed = m.render(m.LiveDetails, { entry: { state: 'error', message: 'Google rejected the API key.' }, onHide: noop });
    assert.match(failed, /role="alert"[^>]*>Google rejected the API key\./);
  });
});
