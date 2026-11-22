import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';

stubBrowserGlobals();

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { ApiCore, withUnauthorizedHandling, fetchList, ListLoadError, API_BASE_URL } from './src/services/http.ts';
  import { api } from './src/services/api.ts';
  export { safeHttpUrl, safeWebsiteUrl } from './src/utils/safeUrl.ts';
  export { safeUrl } from './src/utils/agentFormat.ts';
  export { safeWebsiteHref } from './src/utils/localLeadsFormat.ts';
  export { safeHttpUrl as linkedInSafeUrl } from './src/utils/linkedinHandoff.ts';
  export { ApiCore, withUnauthorizedHandling, fetchList, ListLoadError, API_BASE_URL, api };
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { ContactsScreen } from './src/components/screens/ContactsScreen.tsx';
`);

test('safeHttpUrl lets only absolute http(s) links through', async (t) => {
  await t.test('accepts http and https', () => {
    assert.strictEqual(m.safeHttpUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
    assert.strictEqual(m.safeHttpUrl('  http://example.com  '), 'http://example.com/');
  });
  await t.test('rejects script, data, file, relative and empty values', () => {
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>1</script>', 'file:///etc/passwd',
      'vbscript:x', '//evil.example', '/relative/path', 'example.com', 'not a url', '', '   ', null, undefined]) {
      assert.strictEqual(m.safeHttpUrl(bad), null, String(bad));
    }
  });
  await t.test('every existing link helper uses the same rule', () => {
    assert.strictEqual(m.safeUrl('javascript:alert(1)'), null);
    assert.strictEqual(m.linkedInSafeUrl('javascript:alert(1)'), null);
    assert.strictEqual(m.safeWebsiteHref('javascript:alert(1)'), null);
    assert.strictEqual(m.safeWebsiteHref('example.com'), 'https://example.com/');
    assert.strictEqual(m.safeWebsiteUrl('data:text/html,x'), null);
  });
  await t.test('a contact with a script source URL renders plain text, not a link', () => {
    const contact = { id: 'c1', name: 'A', company: 'Acme', role: 'x', email: 'a@acme.example', source: 'HN', status: 'Not contacted',
      qualificationStatus: 'Unverified', sourceUrl: 'javascript:alert(1)' };
    const html = m.render(m.ContactsScreen, { ctx: { pageHeading: (t) => `<h1>${t}</h1>`, setModal() {}, contacts: [contact],
      handleQualifyContact() {}, handleDeleteContact() {}, opportunities: [], guestMode: false, notify() {}, handleMarkLinkedInRequested() {}, contactsError: false } });
    assert.doesNotMatch(html, /href="javascript:/i);
    assert.doesNotMatch(html, /Source link/);
    const ok = m.render(m.ContactsScreen, { ctx: { pageHeading: (t) => `<h1>${t}</h1>`, setModal() {}, contacts: [{ ...contact, sourceUrl: 'https://example.com/p' }],
      handleQualifyContact() {}, handleDeleteContact() {}, opportunities: [], guestMode: false, notify() {}, handleMarkLinkedInRequested() {}, contactsError: false } });
    assert.match(ok, /href="https:\/\/example\.com\/p"[^>]*rel="noopener noreferrer"/);
  });
});

test('shared 401 handling', async (t) => {
  const res = (status) => ({ status, ok: status >= 200 && status < 300, json: async () => ({}) });

  await t.test('a 401 from the API clears the token and signals the sign-in screen', async () => {
    const core = new m.ApiCore();
    core.setToken('abc');
    let expired = 0;
    const f = m.withUnauthorizedHandling(async () => res(401), core, () => { expired++; });
    const r = await f(`${m.API_BASE_URL}/opportunities`);
    assert.strictEqual(r.status, 401);
    assert.strictEqual(core.getToken(), null);
    assert.strictEqual(expired, 1);
  });
  await t.test('a failed sign-in (401 on login) is not a session expiry', async () => {
    const core = new m.ApiCore();
    core.setToken('abc');
    let expired = 0;
    const f = m.withUnauthorizedHandling(async () => res(401), core, () => { expired++; });
    await f(`${m.API_BASE_URL}/auth/login`);
    assert.strictEqual(expired, 0);
    assert.strictEqual(core.getToken(), 'abc');
  });
  await t.test('other statuses and non-API URLs are left alone', async () => {
    const core = new m.ApiCore();
    core.setToken('abc');
    let expired = 0;
    const f = m.withUnauthorizedHandling(async (u) => res(String(u).includes('other') ? 401 : 500), core, () => { expired++; });
    await f(`${m.API_BASE_URL}/contacts`);
    await f('https://other.example/x');
    assert.strictEqual(expired, 0);
  });
  await t.test('without a token there is nothing to expire', async () => {
    const core = new m.ApiCore();
    core.setToken(null);
    let expired = 0;
    const f = m.withUnauthorizedHandling(async () => res(401), core, () => { expired++; });
    await f(`${m.API_BASE_URL}/contacts`);
    assert.strictEqual(expired, 0);
  });
});

test('list loaders report failures instead of an empty list', async (t) => {
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });

  await t.test('a server error throws ListLoadError', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
    await assert.rejects(m.api.getContacts(), m.ListLoadError);
    await assert.rejects(m.api.getOpportunities(), m.ListLoadError);
    await assert.rejects(m.api.getSchedules(), m.ListLoadError);
    await assert.rejects(m.api.getSources(), m.ListLoadError);
    await assert.rejects(m.api.getSearchProfiles(), m.ListLoadError);
  });
  await t.test('an unreachable server throws ListLoadError', async () => {
    globalThis.fetch = async () => { throw new TypeError('network'); };
    await assert.rejects(m.api.getOpportunities(), m.ListLoadError);
  });
  await t.test('a genuinely empty answer is an empty list, not an error', async () => {
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ items: [] }) });
    assert.deepStrictEqual(await m.api.getOpportunities(), []);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => [] });
    assert.deepStrictEqual(await m.api.getSchedules(), []);
  });
});
