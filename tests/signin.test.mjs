import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';

stubBrowserGlobals();

const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { SignIn } from './src/components/screens/SignIn.tsx';
  import { api } from './src/services/api.ts';
  export const renderSignIn = () => renderToStaticMarkup(h(SignIn, { onSuccess() {}, onNotify() {} }));
  export { api };
`);

test('sign-in screen', async (t) => {
  const html = m.renderSignIn();

  await t.test('never pre-fills or prints a password or default credentials', () => {
    assert.doesNotMatch(html, /Sales123|Admin123|Default:/);
    assert.doesNotMatch(html, /value="[^"]*@vsrsalesengine/);
  });

  await t.test('has labelled fields with the right autocomplete hints', () => {
    assert.match(html, /<label[^>]*for="si-email"[^>]*>Work email/);
    assert.match(html, /<label[^>]*for="si-password"[^>]*>Password/);
    assert.match(html, /autoComplete="username"|autocomplete="username"/i);
    assert.match(html, /autoComplete="current-password"|autocomplete="current-password"/i);
  });

  await t.test('password can be revealed with an accessible toggle', () => {
    assert.match(html, /aria-label="Show password"/);
    assert.match(html, /aria-pressed="false"/);
  });

  await t.test('guest option says plainly that it is read-only', () => {
    assert.match(html, /Explore as a guest/);
    assert.match(html, /Read-only\. Guests cannot run agents or change data\./);
  });

  await t.test('the local demo shortcut is not rendered outside development', () => {
    assert.doesNotMatch(html, /local demo account/);
  });
});

test('sign-in service messages', async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; });

  await t.test('a rate-limited login (429, empty body) gives a clear message', async () => {
    globalThis.fetch = async () => ({ status: 429, ok: false, json: async () => { throw new Error('Unexpected end of JSON input'); } });
    const result = await m.api.login('a@b.co', 'x');
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage, /Too many sign-in attempts/);
  });

  await t.test('an unreachable server gives a friendly message, not a raw error', async () => {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    const result = await m.api.login('a@b.co', 'x');
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage, /Can't reach the server/);
  });

  await t.test('outside development an unreachable server does not fake a guest session', async () => {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    const result = await m.api.createGuestSession();
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage, /Can't reach the server/);
  });
});
