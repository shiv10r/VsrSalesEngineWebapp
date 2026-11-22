import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { liveDetails, placeResults } from './fixtures/mapsSearch.mjs';

stubBrowserGlobals();
const { createLocalLeadsApi, ApiCore, googleMapsSearchUrl, justdialSearchUrl } = await loadModule(`
  export { createLocalLeadsApi } from './src/services/localLeads.ts';
  export { ApiCore } from './src/services/http.ts';
  export { googleMapsSearchUrl, justdialSearchUrl } from './src/utils/mapsFallback.ts';
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
const makeApi = () => {
  const core = new ApiCore();
  core.setToken('test-token');
  return createLocalLeadsApi(core);
};

test('Google Maps search API request shapes', async (t) => {
  await t.test('status is a GET that throws when unreachable', async () => {
    const calls = mockFetch(() => json(200, { configured: true, dailyCap: 100, remainingToday: 97 }));
    assert.strictEqual((await makeApi().getDiscoverStatus()).remainingToday, 97);
    assert.strictEqual(calls[0].url, '/api/local-leads/discover/status');
    assert.strictEqual(calls[0].method, 'GET');
    mockFetch(() => json(500, {}));
    await assert.rejects(() => makeApi().getDiscoverStatus());
  });

  await t.test('discover posts district, category, query and maxResults with the bearer token', async () => {
    const calls = mockFetch(() => json(200, { configured: true, results: placeResults, remainingToday: 96 }));
    const res = await makeApi().discoverPlaces({ district: 'Gorakhpur', category: 'Professional Services', query: 'interior designer', maxResults: 5 });
    assert.strictEqual(calls[0].method, 'POST');
    assert.strictEqual(calls[0].url, '/api/local-leads/discover');
    assert.strictEqual(calls[0].headers.Authorization, 'Bearer test-token');
    assert.deepStrictEqual(JSON.parse(calls[0].body), {
      district: 'Gorakhpur', category: 'Professional Services', query: 'interior designer', maxResults: 5,
    });
    assert.ok(res.ok && res.value.results.length === 2 && res.value.remainingToday === 96);
  });

  await t.test('503 means no API key on the server', async () => {
    mockFetch(() => json(503, { configured: false, message: 'Google Maps search is not set up. Add GooglePlaces__ApiKey on the server.' }));
    const res = await makeApi().discoverPlaces({ district: 'Gorakhpur' });
    assert.ok(!res.ok && res.reason === 'notConfigured' && /GooglePlaces__ApiKey/.test(res.message));
  });

  await t.test('403 is the guest refusal, with a reason the user can read', async () => {
    mockFetch(() => json(403, {}));
    const res = await makeApi().savePlace({ placeId: 'p', name: 'n', district: 'Agra', category: 'Other', mapsUrl: '' });
    assert.ok(!res.ok && res.reason === 'forbidden' && /Guests can't/.test(res.message));
  });

  await t.test('429 carries the server message (daily cap or Google quota)', async () => {
    mockFetch(() => json(429, { message: 'Daily Google Maps search limit (100) reached. It resets at midnight UTC.' }));
    const res = await makeApi().discoverPlaces({ district: 'Agra' });
    assert.ok(!res.ok && res.reason === 'quota' && /Daily Google Maps search limit/.test(res.message));
  });

  await t.test('400, 502 and a dead network are typed, never thrown', async () => {
    mockFetch(() => json(400, { message: 'district must be one of the Uttar Pradesh districts' }));
    let res = await makeApi().discoverPlaces({ district: 'Mumbai' });
    assert.ok(!res.ok && res.reason === 'validation');
    mockFetch(() => json(502, { message: 'Google rejected the API key.' }));
    res = await makeApi().discoverPlaces({ district: 'Agra' });
    assert.ok(!res.ok && res.reason === 'error' && /rejected/.test(res.message));
    globalThis.fetch = async () => { throw new TypeError('network'); };
    res = await makeApi().discoverPlaces({ district: 'Agra' });
    assert.ok(!res.ok && res.reason === 'unreachable');
  });

  await t.test('save posts only placeId, name, district, category and mapsUrl', async () => {
    const calls = mockFetch(() => json(201, { lead: {}, alreadySaved: false }));
    const res = await makeApi().savePlace({
      placeId: 'ChIJ1', name: 'Kanha Interiors', district: 'Gorakhpur', category: 'Professional Services', mapsUrl: 'https://maps.google.com/?cid=1',
    });
    assert.strictEqual(calls[0].url, '/api/local-leads/from-place');
    assert.deepStrictEqual(Object.keys(JSON.parse(calls[0].body)).sort(), ['category', 'district', 'mapsUrl', 'name', 'placeId']);
    assert.ok(res.ok && res.value.alreadySaved === false);
  });

  await t.test('live details is a GET to the encoded lead id', async () => {
    const calls = mockFetch(() => json(200, liveDetails));
    const res = await makeApi().getLiveDetails('LL 9/x');
    assert.strictEqual(calls[0].url, '/api/local-leads/LL%209%2Fx/live-details');
    assert.strictEqual(calls[0].method, 'GET');
    assert.ok(res.ok && res.value.phone === '0551 234 5678');
    mockFetch(() => json(404, { message: 'This lead is not linked to a Google Maps place.' }));
    const missing = await makeApi().getLiveDetails('LL-1');
    assert.ok(!missing.ok && missing.reason === 'notFound');
  });

  await t.test('fallback links are plain encoded URLs', () => {
    assert.strictEqual(googleMapsSearchUrl('interior designer', 'Gorakhpur'),
      'https://www.google.com/maps/search/interior%20designer%20Gorakhpur%20Uttar%20Pradesh');
    const jd = justdialSearchUrl('interior designer', 'Gorakhpur');
    assert.ok(jd.startsWith('https://www.google.com/search?q=site%3Ajustdial.com'));
    assert.ok(jd.includes('Gorakhpur'));
  });
});
