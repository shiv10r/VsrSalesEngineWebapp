// Fixture shaped exactly like GET /api/agents/settings (camelCase JSON).
export const settings = {
  agents: [
    { id: 'scout', name: 'Aarav', defaultName: 'Aarav', role: 'Scout - reads the live job feeds', enabled: true, required: true },
    { id: 'filter', name: 'Priya', defaultName: 'Priya', role: 'Filter - drops non-software postings', enabled: true, required: false },
    { id: 'drafter', name: 'Sophie', defaultName: 'Sophie', role: 'Drafter - writes outreach drafts', enabled: true, required: false },
    { id: 'compliance', name: 'Meera', defaultName: 'Meera', role: 'Compliance - checks every draft', enabled: true, required: false },
  ],
  draftThreshold: 50,
  keywords: { target: ['React', '.NET'], excluded: ['copywriter'] },
  shifts: [
    { scheduleId: 'SCHED-001', name: 'Morning shift', enabled: true, intervalHours: 2, sources: ['Hacker News', 'Remotive'], activeFrom: '06:00', activeTo: '14:00', timezone: 'Asia/Kolkata' },
    { scheduleId: 'SCHED-003', name: 'Day shift', enabled: false, intervalHours: 5, sources: ['Jobicy'], activeFrom: '14:00', activeTo: '22:00', timezone: 'Asia/Kolkata' },
  ],
  availableSources: ['Hacker News', 'We Work Remotely', 'Remotive', 'Jobicy'],
  updatedBy: 'sales@vsrsalesengine.com',
  updatedAtUtc: '2026-11-21T18:30:00Z',
};

export const neverSaved = { ...settings, updatedBy: null, updatedAtUtc: null };
