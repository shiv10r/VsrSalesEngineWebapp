import test from 'node:test';
import assert from 'node:assert';
import { loadModule, stubBrowserGlobals } from './_bundle.mjs';
import { overview, runs, events } from './fixtures/agents.mjs';

stubBrowserGlobals();
const { createAgentsApi, buildEventsPath, ApiCore } = await loadModule(`
  export { createAgentsApi, buildEventsPath } from './src/services/agents.ts';
  export { ApiCore } from './src/services/http.ts';
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

function makeApi() {
  const core = new ApiCore();
  core.setToken('test-token');
  return createAgentsApi(core);
}

test('Agents API request shapes', async (t) => {
  await t.test('buildEventsPath applies defaults and optional runId', () => {
    assert.strictEqual(buildEventsPath(), '/agents/events?afterId=0&take=100');
    assert.strictEqual(buildEventsPath({ afterId: 42, take: 20, runId: 'RUN-1' }), '/agents/events?afterId=42&take=20&runId=RUN-1');
    assert.strictEqual(buildEventsPath({ runId: null }), '/agents/events?afterId=0&take=100');
    assert.ok(buildEventsPath({ runId: 'a b&c' }).includes('runId=a+b%26c'), 'runId must be URL encoded');
  });

  await t.test('overview is a GET with the bearer token and returns the parsed body', async () => {
    const calls = mockFetch(() => json(200, overview));
    const result = await makeApi().getAgentsOverview();
    assert.strictEqual(calls[0].url, '/api/agents/overview');
    assert.strictEqual(calls[0].method, 'GET');
    assert.strictEqual(calls[0].headers.Authorization, 'Bearer test-token');
    assert.strictEqual(result.agents.length, 3);
    assert.strictEqual(result.runInProgress, true);
  });

  await t.test('runs and events use the documented query strings', async () => {
    const calls = mockFetch((url) => json(200, url.includes('/runs') ? runs : events));
    assert.strictEqual((await makeApi().getAgentRuns()).length, 3);
    await makeApi().getAgentRuns(5);
    await makeApi().getAgentEvents({ afterId: 4, runId: 'RUN-214' });
    assert.strictEqual(calls[0].url, '/api/agents/runs?take=20');
    assert.strictEqual(calls[1].url, '/api/agents/runs?take=5');
    assert.strictEqual(calls[2].url, '/api/agents/events?afterId=4&take=100&runId=RUN-214');
  });

  await t.test('read calls throw when the server fails, so the UI can show an honest error state', async () => {
    mockFetch(() => json(500, {}));
    await assert.rejects(() => makeApi().getAgentsOverview(), /500/);
    mockFetch(() => { throw new TypeError('network down'); });
    await assert.rejects(() => makeApi().getAgentRuns());
  });

  await t.test('run-now maps 202, 409, 403, other errors and network failures', async () => {
    const calls = mockFetch(() => json(202, { runId: 'RUN-215' }));
    assert.deepStrictEqual(await makeApi().runAgentsNow(), { ok: true, runId: 'RUN-215' });
    assert.strictEqual(calls[0].method, 'POST');
    assert.strictEqual(calls[0].url, '/api/agents/run-now');

    mockFetch(() => json(409, {}));
    const running = await makeApi().runAgentsNow();
    assert.strictEqual(running.ok, false);
    assert.strictEqual(running.reason, 'running');

    mockFetch(() => json(403, {}));
    assert.strictEqual((await makeApi().runAgentsNow()).reason, 'forbidden');

    mockFetch(() => json(500, {}));
    assert.strictEqual((await makeApi().runAgentsNow()).reason, 'error');

    mockFetch(() => { throw new TypeError('offline'); });
    assert.strictEqual((await makeApi().runAgentsNow()).reason, 'error');
  });
});
