import test from 'node:test';
import assert from 'node:assert';
import { loadModule } from './_bundle.mjs';
import { NOW, agents, events } from './fixtures/agents.mjs';

const f = await loadModule(`export * from './src/utils/agentFormat.ts';`);

test('Agent formatting helpers', async (t) => {
  await t.test('relativeTime handles past, future, seconds and missing values', () => {
    assert.strictEqual(f.relativeTime('2026-11-21T18:29:50Z', NOW), 'just now');
    assert.strictEqual(f.relativeTime('2026-11-21T18:25:00Z', NOW), '5 min ago');
    assert.strictEqual(f.relativeTime('2026-11-21T16:30:00Z', NOW), '2 h ago');
    assert.strictEqual(f.relativeTime('2026-11-19T18:30:00Z', NOW), '2 d ago');
    assert.strictEqual(f.relativeTime('2026-11-21T20:27:00Z', NOW), 'in 2 h');
    assert.strictEqual(f.relativeTime('2026-11-21T18:30:20Z', NOW), 'in a few seconds');
    assert.strictEqual(f.relativeTime(null, NOW), 'never');
    assert.strictEqual(f.relativeTime('not-a-date', NOW), 'unknown');
  });

  await t.test('absoluteTime renders in the requested timezone', () => {
    assert.ok(f.absoluteTime('2026-11-21T18:27:00Z', 'Asia/Kolkata').includes('23:57'));
    assert.strictEqual(f.absoluteTime(null), '');
    assert.strictEqual(f.absoluteTime('garbage'), '');
  });

  await t.test('runDuration uses finish time, or now while running', () => {
    assert.strictEqual(f.runDuration({ startedAtUtc: '2026-11-21T16:27:00Z', finishedAtUtc: '2026-11-21T16:33:20Z' }), '6m 20s');
    assert.strictEqual(f.runDuration({ startedAtUtc: '2026-11-21T18:29:30Z', finishedAtUtc: null }, NOW), '30s');
  });

  await t.test('mergeEvents is unique by id, ascending, and capped to the newest 500', () => {
    const merged = f.mergeEvents([events[2], events[0]], [events[1], events[2]]);
    assert.deepStrictEqual(merged.map(e => e.id), [1, 2, 3]);
    assert.strictEqual(f.mergeEvents(events, []), events, 'no incoming events keeps the same array');
    const many = Array.from({ length: 700 }, (_, i) => ({ ...events[0], id: i + 1 }));
    const capped = f.mergeEvents([], many);
    assert.strictEqual(capped.length, 500);
    assert.strictEqual(capped[0].id, 201);
    assert.strictEqual(capped[499].id, 700);
  });

  await t.test('lastEventId, filterByRun and groupByRun', () => {
    assert.strictEqual(f.lastEventId([]), 0);
    assert.strictEqual(f.lastEventId(events), 6);
    assert.strictEqual(f.filterByRun(events, null).length, 6);
    assert.deepStrictEqual(f.filterByRun(events, 'RUN-213').map(e => e.id), [1, 2]);
    const groups = f.groupByRun(events);
    assert.deepStrictEqual(groups.map(g => [g.runId, g.events.length]), [['RUN-213', 2], ['RUN-214', 4]]);
  });

  await t.test('scoreTone thresholds', () => {
    assert.deepStrictEqual([92, 70, 69, 50, 49, 0, null].map(f.scoreTone), ['high', 'high', 'mid', 'mid', 'low', 'low', 'none']);
  });

  await t.test('safeUrl only allows http(s)', () => {
    assert.strictEqual(f.safeUrl('https://example.com/a'), 'https://example.com/a');
    assert.strictEqual(f.safeUrl('javascript:alert(1)'), null);
    assert.strictEqual(f.safeUrl('data:text/html,<script>1</script>'), null);
    assert.strictEqual(f.safeUrl('not a url'), null);
    assert.strictEqual(f.safeUrl(null), null);
  });

  await t.test('pollInterval: 2s while running, 10s idle, none when hidden or disabled', () => {
    assert.strictEqual(f.pollInterval({ runInProgress: true, hidden: false, enabled: true }), 2000);
    assert.strictEqual(f.pollInterval({ runInProgress: false, hidden: false, enabled: true }), 10000);
    assert.strictEqual(f.pollInterval({ runInProgress: true, hidden: true, enabled: true }), null);
    assert.strictEqual(f.pollInterval({ runInProgress: false, hidden: false, enabled: false }), null);
  });

  await t.test('runNowDisabledReason explains every disabled state', () => {
    assert.match(f.runNowDisabledReason({ guest: true, runInProgress: false, starting: false }), /Guest/);
    assert.match(f.runNowDisabledReason({ guest: false, runInProgress: true, starting: false }), /already in progress/);
    assert.match(f.runNowDisabledReason({ guest: false, runInProgress: false, starting: true }), /Starting/);
    assert.strictEqual(f.runNowDisabledReason({ guest: false, runInProgress: false, starting: false }), null);
  });

  await t.test('names, initials, colours and reason previews', () => {
    assert.strictEqual(f.agentName('scout', agents), 'Scout');
    assert.strictEqual(f.agentName('contact-finder', agents), 'Contact Finder', 'falls back to a title-cased id');
    assert.strictEqual(f.initialOf('  relevance filter'), 'R');
    assert.notStrictEqual(f.agentColor('scout'), f.agentColor('scorer'));
    assert.strictEqual(f.agentColor('unknown-agent'), '#5b6b86');
    assert.deepStrictEqual(f.leadReasonsPreview(['a', 'b', 'c', 'd', 'e', 'f']), { shown: ['a', 'b', 'c', 'd'], extra: 2 });
    assert.deepStrictEqual(f.leadReasonsPreview([]), { shown: [], extra: 0 });
  });
});
