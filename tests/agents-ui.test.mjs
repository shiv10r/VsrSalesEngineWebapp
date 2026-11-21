import test from 'node:test';
import assert from 'node:assert';
import { loadModule } from './_bundle.mjs';
import { NOW, agents, overview, runs, events } from './fixtures/agents.mjs';

// One bundle so React and react-dom share a single copy.
const m = await loadModule(`
  import { renderToStaticMarkup } from 'react-dom/server';
  import { createElement as h } from 'react';
  import { AgentRoster } from './src/components/agents/AgentRoster.tsx';
  import { RunHistory } from './src/components/agents/RunHistory.tsx';
  import { ActivityFeed } from './src/components/agents/ActivityFeed.tsx';
  import { AgentsHeader } from './src/components/agents/AgentsHeader.tsx';
  import { AgentsEmptyFeed, AgentsErrorState, AgentsSkeleton } from './src/components/agents/AgentStates.tsx';
  import { ScoreRing } from './src/components/agents/ScoreRing.tsx';
  export const render = (type, props) => renderToStaticMarkup(h(type, props));
  export { AgentRoster, RunHistory, ActivityFeed, AgentsHeader, AgentsEmptyFeed, AgentsErrorState, AgentsSkeleton, ScoreRing };
`);

const noop = () => {};

test('Agents workspace renders from API-shaped data', async (t) => {
  await t.test('roster shows personas, status and current task, and only API numbers', () => {
    const html = m.render(m.AgentRoster, { agents, now: NOW });
    assert.match(html, /Scout/);
    assert.match(html, /Reading Remotive contract feed/);
    assert.match(html, /ag-dot working/);
    assert.match(html, /212 processed · 640 events logged/);
    assert.match(html, /1 working/);
    assert.match(html, /Not run yet/, 'agent that never ran says so instead of showing a fake time');
  });

  await t.test('feed is an accessible live log with run dividers, kinds, lead cards and typing indicator', () => {
    const html = m.render(m.ActivityFeed, {
      events, agents, runs, now: NOW, knownOpportunityIds: new Set(['OPP-9']), onOpenLead: noop,
    });
    assert.match(html, /role="log"/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /Day shift agent/);
    assert.match(html, /Night shift agent/);
    assert.match(html, /ag-event thought/);
    assert.match(html, /ag-event warning/);
    assert.match(html, /ag-handoff/);
    assert.match(html, /Northwind Labs/);
    assert.match(html, /Open lead/, 'lead known to the app can be opened in the detail drawer');
    assert.match(html, /\+1 more/, '5 reasons -> 4 shown plus a counter');
    assert.match(html, /Scout<\/b> is working: Reading Remotive contract feed/);
  });

  await t.test('feed never renders an unsafe link and escapes message text', () => {
    const bad = [{ ...events[5], message: '<img src=x onerror=alert(1)>' }];
    const html = m.render(m.ActivityFeed, { events: bad, agents, runs, now: NOW, knownOpportunityIds: new Set(), onOpenLead: noop });
    assert.ok(!html.includes('javascript:'), 'javascript: URLs must not become hrefs');
    assert.ok(!html.includes('<img'), 'message text must be escaped');
    assert.match(html, /&lt;img/);
    assert.match(html, /Not scored yet/);
  });

  await t.test('run history lists every run with its API counts and marks the selected one', () => {
    const html = m.render(m.RunHistory, { runs, selectedRunId: 'RUN-213', now: NOW, onSelect: noop });
    assert.match(html, /Morning shift agent/);
    assert.match(html, /ag-status skipped/);
    assert.match(html, /aria-pressed="true"/);
    assert.match(html, /Show all runs/);
    assert.match(html, /9 new leads, best score 91/);
    const empty = m.render(m.RunHistory, { runs: [], selectedRunId: null, now: NOW, onSelect: noop });
    assert.match(empty, /No runs recorded yet/);
  });

  await t.test('header disables Run now with a clear reason for guests and during a run', () => {
    const base = { overview, now: NOW, starting: false, onRun: noop };
    const guest = m.render(m.AgentsHeader, { ...base, guest: true });
    assert.match(guest, /disabled/);
    assert.match(guest, /Guest accounts are read-only/);
    const running = m.render(m.AgentsHeader, { ...base, guest: false });
    assert.match(running, /already in progress/);
    assert.match(running, /Running now/);
    assert.match(running, /Night shift agent/);
    const idle = m.render(m.AgentsHeader, { ...base, guest: false, overview: { ...overview, runInProgress: false } });
    assert.ok(!/disabled/.test(idle), 'button is enabled when a full account is idle');
    assert.match(idle, /Last run running|Last run/);
  });

  await t.test('honest states: skeleton, unreachable backend, empty feed', () => {
    assert.match(m.render(m.AgentsSkeleton, {}), /aria-busy="true"/);
    const error = m.render(m.AgentsErrorState, { onRetry: noop });
    assert.match(error, /role="alert"/);
    assert.match(error, /Try again/);
    const empty = m.render(m.AgentsEmptyFeed, { nextRunAtUtc: '2026-11-21T20:27:00Z', now: NOW });
    assert.match(empty, /every 2 hours/);
    assert.match(empty, /in 2 h/);
    assert.match(m.render(m.AgentsEmptyFeed, { nextRunAtUtc: null, now: NOW }), /No run is scheduled/);
  });

  await t.test('score ring reflects the score or shows it is unscored', () => {
    assert.match(m.render(m.ScoreRing, { score: 92 }), /ag-ring high/);
    assert.match(m.render(m.ScoreRing, { score: 55 }), /ag-ring mid/);
    assert.match(m.render(m.ScoreRing, { score: 12 }), /ag-ring low/);
    assert.match(m.render(m.ScoreRing, { score: null }), /ag-ring none/);
  });
});
