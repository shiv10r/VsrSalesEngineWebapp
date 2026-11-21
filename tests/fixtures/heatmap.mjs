// Fixture shaped exactly like GET /api/agents/heatmap (camelCase, sparse cells, dayOfWeek 0 = Monday).
export const heatmap = {
  days: 28,
  timezone: 'Asia/Kolkata',
  cells: [
    { dayOfWeek: 1, hour: 14, newLeads: 6, runs: 2 },
    { dayOfWeek: 1, hour: 16, newLeads: 3, runs: 1 },
    { dayOfWeek: 0, hour: 6, newLeads: 1, runs: 1 },
    { dayOfWeek: 4, hour: 23, newLeads: 4, runs: 2 },
    { dayOfWeek: 6, hour: 2, newLeads: 2, runs: 1 },
    { dayOfWeek: 3, hour: 9, newLeads: 6, runs: 3 },
  ],
  totalNewLeads: 22,
  totalRuns: 10,
  firstRunAtUtc: '2026-11-02T00:27:00Z',
};

export const emptyHeatmap = {
  days: 28, timezone: 'Asia/Kolkata', cells: [], totalNewLeads: 0, totalRuns: 0, firstRunAtUtc: null,
};
