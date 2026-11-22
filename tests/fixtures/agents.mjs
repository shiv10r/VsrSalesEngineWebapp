// Fixture data shaped exactly like the backend contract (camelCase JSON).
export const NOW = Date.parse('2026-11-21T18:30:00Z');

export const agents = [
  { id: 'scout', name: 'Scout', role: 'Fetches new postings from live sources', status: 'working', currentTask: 'Reading Remotive contract feed', lastActiveAtUtc: '2026-11-21T18:29:50Z', lifetime: { itemsProcessed: 212, eventsLogged: 640 } },
  { id: 'filter', name: 'Relevance Filter', role: 'Drops roles that are not software work', status: 'idle', currentTask: null, lastActiveAtUtc: '2026-11-21T16:27:00Z', lifetime: { itemsProcessed: 190, eventsLogged: 410 } },
  { id: 'reporter', name: 'Reporter', role: 'Summarises each run', status: 'waiting', currentTask: null, lastActiveAtUtc: null, lifetime: { itemsProcessed: 0, eventsLogged: 0 } },
];

export const lastRun = {
  id: 'RUN-214', scheduleId: 'SCHED-004', shiftName: 'Night shift agent', trigger: 'ExternalTimer',
  startedAtUtc: '2026-11-21T18:27:00Z', finishedAtUtc: null, status: 'running', summary: null,
  newLeads: 7, duplicates: 12, rejected: 5,
};

export const overview = { agents, lastRun, nextRunAtUtc: '2026-11-21T20:27:00Z', runInProgress: true };

export const runs = [
  lastRun,
  { ...lastRun, id: 'RUN-213', shiftName: 'Day shift agent', status: 'completed', finishedAtUtc: '2026-11-21T16:33:20Z', startedAtUtc: '2026-11-21T16:27:00Z', summary: '9 new leads, best score 91', trigger: 'AutonomousWorker' },
  { ...lastRun, id: 'RUN-212', shiftName: 'Morning shift agent', status: 'skipped', finishedAtUtc: '2026-11-21T14:27:01Z', startedAtUtc: '2026-11-21T14:27:00Z', summary: 'Outside shift window', newLeads: 0, duplicates: 0, rejected: 0 },
];

const lead = {
  opportunityId: 'OPP-9', company: 'Northwind Labs', title: '.NET API contractor', source: 'Hacker News',
  score: 92, reasons: ['Matches .NET', 'Contract role', 'Posted today', 'Remote OK', 'Budget stated'], url: 'https://example.com/job/9',
};

export const events = [
  { id: 1, runId: 'RUN-213', atUtc: '2026-11-21T16:27:05Z', agentId: 'scout', kind: 'action', message: 'Fetching Jobicy developer contracts', lead: null },
  { id: 2, runId: 'RUN-213', atUtc: '2026-11-21T16:27:30Z', agentId: 'filter', kind: 'warning', message: 'Rejected "Freelance Copywriter": not software work', lead: null },
  { id: 3, runId: 'RUN-214', atUtc: '2026-11-21T18:27:03Z', agentId: 'scout', kind: 'thought', message: 'Night shift: checking all four feeds', lead: null },
  { id: 4, runId: 'RUN-214', atUtc: '2026-11-21T18:27:40Z', agentId: 'scout', kind: 'handoff', message: 'handed 21 postings to Relevance Filter', lead: null },
  { id: 5, runId: 'RUN-214', atUtc: '2026-11-21T18:28:10Z', agentId: 'scout', kind: 'result', message: 'Found a strong match', lead },
  { id: 6, runId: 'RUN-214', atUtc: '2026-11-21T18:28:20Z', agentId: 'scout', kind: 'result', message: 'Unsafe link must not render', lead: { ...lead, opportunityId: null, url: 'javascript:alert(1)', score: null, reasons: [] } },
];
