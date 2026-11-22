import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { leads, options, page, summary } from './fixtures/localLeads.mjs';

stubBrowserGlobals();
const { createLocalLeadsApi, buildLocalLeadsPath, ApiCore } = await loadModule(`
  export { createLocalLeadsApi, buildLocalLeadsPath } from './src/services/localLeads.ts';
  export { ApiCore } from './src/services/http.ts';
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
const empty = (status) => ({ ok: status >= 200 && status < 300, status, json: async () => { throw new Error('no body'); } });

function makeApi() {
  const core = new ApiCore();
  core.setToken('test-token');
  return createLocalLeadsApi(core);
}

test('Local leads API request shapes', async (t) => {
  await t.test('list path: defaults, filters, encoding, hasWebsite only when set', () => {
    assert.strictEqual(buildLocalLeadsPath(), '/local-leads?page=1&pageSize=25');
    const p = buildLocalLeadsPath({ district: 'Kanpur Nagar', category: 'Retail', status: 'New', hasWebsite: false, q: ' sharma & sons ', page: 2, pageSize: 10 });
    assert.strictEqual(p, '/local-leads?district=Kanpur+Nagar&category=Retail&status=New&hasWebsite=false&q=sharma+%26+sons&page=2&pageSize=10');
    assert.ok(!buildLocalLeadsPath({ hasWebsite: undefined }).includes('hasWebsite'));
    assert.ok(!buildLocalLeadsPath({ q: '   ' }).includes('q='));
  });

  await t.test('reads are GETs with the bearer token', async () => {
    const calls = mockFetch((url) => json(200, url.includes('options') ? options : url.includes('summary') ? summary : page));
    const api = makeApi();
    assert.deepStrictEqual(await api.getLocalLeadOptions(), options);
    assert.deepStrictEqual(await api.getLocalLeadSummary(), summary);
    assert.strictEqual((await api.getLocalLeads({ district: 'Lucknow' })).total, 3);
    assert.deepStrictEqual(calls.map(c => c.url), [
      '/api/local-leads/options', '/api/local-leads/summary', '/api/local-leads?district=Lucknow&page=1&pageSize=25',
    ]);
    assert.ok(calls.every(c => c.method === 'GET' && c.headers.Authorization === 'Bearer test-token'));
  });

  await t.test('a failed read throws so the page can show the unreachable state', async () => {
    mockFetch(() => json(500, {}));
    await assert.rejects(() => makeApi().getLocalLeadSummary());
  });

  await t.test('create posts the body and returns the lead on 201', async () => {
    const calls = mockFetch(() => json(201, leads[0]));
    const res = await makeApi().createLocalLead({ businessName: 'Sharma Dental Clinic', district: 'Lucknow' });
    assert.strictEqual(calls[0].method, 'POST');
    assert.strictEqual(calls[0].url, '/api/local-leads');
    assert.deepStrictEqual(JSON.parse(calls[0].body), { businessName: 'Sharma Dental Clinic', district: 'Lucknow' });
    assert.ok(res.ok && res.value.id === 'LL-1');
  });

  await t.test('update is a PUT to the encoded id', async () => {
    const calls = mockFetch(() => json(200, { ...leads[0], status: 'Won' }));
    const res = await makeApi().updateLocalLead('LL 1/x', { status: 'Won' });
    assert.strictEqual(calls[0].method, 'PUT');
    assert.strictEqual(calls[0].url, '/api/local-leads/LL%201%2Fx');
    assert.ok(res.ok && res.value.status === 'Won');
  });

  await t.test('delete accepts 204 with no body', async () => {
    mockFetch(() => empty(204));
    const res = await makeApi().deleteLocalLead('LL-1');
    assert.ok(res.ok);
  });

  await t.test('import posts the label and rows', async () => {
    const calls = mockFetch(() => json(200, { imported: 2, duplicates: 1, skipped: 0, errors: [] }));
    const res = await makeApi().importLocalLeads('Clinics', [{ businessName: 'A' }, { businessName: 'B' }]);
    assert.strictEqual(calls[0].url, '/api/local-leads/import');
    assert.deepStrictEqual(JSON.parse(calls[0].body), { sourceLabel: 'Clinics', rows: [{ businessName: 'A' }, { businessName: 'B' }] });
    assert.ok(res.ok && res.value.imported === 2 && res.value.duplicates === 1);
  });

  await t.test('writes return typed failures instead of throwing', async () => {
    const api = makeApi();
    mockFetch(() => empty(403));
    let res = await api.createLocalLead({ businessName: 'A', district: 'Lucknow' });
    assert.ok(!res.ok && res.reason === 'forbidden' && /Guests can't change leads/.test(res.message));

    mockFetch(() => empty(404));
    res = await api.updateLocalLead('x', { notes: 'n' });
    assert.ok(!res.ok && res.reason === 'notFound');

    mockFetch(() => json(400, { message: 'Too many rows', errors: [{ row: 3, message: 'bad' }] }));
    res = await api.importLocalLeads('x', []);
    assert.ok(!res.ok && res.reason === 'validation' && res.message === 'Too many rows' && res.errors[0].row === 3);

    mockFetch(() => empty(500));
    res = await api.deleteLocalLead('x');
    assert.ok(!res.ok && res.reason === 'error');

    mockFetch(() => { throw new TypeError('Failed to fetch'); });
    res = await api.deleteLocalLead('x');
    assert.ok(!res.ok && res.reason === 'error' && /Could not reach/.test(res.message));
  });
});
