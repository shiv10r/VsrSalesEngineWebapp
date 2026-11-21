import { Clock3, Moon, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { Button, Pill, Toggle } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SchedulesScreen({ ctx }: { ctx: AppCtx }) {
  const {
    schedules, pageHeading, setModal, isRunningSchedule, handleRunScheduleNow, handleToggleSchedule,
    handleDeleteSchedule,
  } = ctx;

  const activeSchedules = schedules.length > 0 ? schedules : [
    {
      id: 'SCHED-001',
      name: 'Daily opportunity discovery',
      description: 'Company career pages and permitted public feeds',
      frequency: 'Weekdays',
      cronExpression: '0 8 * * 1-5',
      timezone: 'UTC',
      isEnabled: true,
      profileId: 'PROF-001',
      selectedSources: ['SRC-001', 'SRC-002', 'SRC-005'],
      runCap: 50,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
      lastRunAtUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
      nextRunAtUtc: new Date(Date.now() + 3600000 * 20).toISOString(),
      lastRunStatus: 'Completed',
      createdBy: 'system',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
    },
    {
      id: 'SCHED-002',
      name: 'Weekly procurement scan',
      description: 'Selected public procurement portals',
      frequency: 'Weekly',
      cronExpression: '0 9 * * 1',
      timezone: 'UTC',
      isEnabled: false,
      profileId: 'PROF-002',
      selectedSources: ['SRC-004'],
      runCap: 25,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
      lastRunAtUtc: new Date(Date.now() - 86400000 * 6).toISOString(),
      nextRunAtUtc: new Date(Date.now() + 86400000 * 1).toISOString(),
      lastRunStatus: 'Completed',
      createdBy: 'system',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
    }
  ];

  return (
    <>
      {pageHeading('Schedules & automation', 'Set recurring searches and follow-ups. Every run is visible, idempotent, and protected by distributed locks.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'schedule' })}>New schedule</Button>, 'AUTOMATION CONTROL')}
      <div className="notice-inline" style={{ marginBottom: '16px' }}>
        <ShieldCheck size={16} />
        <span>Worker safety: Scheduled executions acquire distributed transaction-safe run locks to prevent duplicate sends and conflicting scraper runs.</span>
      </div>
      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        {activeSchedules.map(s => (
          <div className="schedule-row" key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px' }}>
            <div className="schedule-info" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '15px' }}>{s.name}</strong>
                <Pill type={s.isEnabled ? 'green' : 'neutral'} dot>{s.isEnabled ? 'Active' : 'Paused'}</Pill>
                <Pill type="neutral">{s.frequency}</Pill>
              </div>
              <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--muted)' }}>{s.description}</p>
              <div className="schedule-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                <span><Clock3 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Next run: {new Date(s.nextRunAtUtc).toLocaleString()}</span>
                <span><Moon size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Quiet: {s.quietHoursStart}–{s.quietHoursEnd} ({s.timezone})</span>
                <span>Cap: {s.runCap} / run</span>
                {s.lastRunAtUtc && (
                  <span>Last run: {new Date(s.lastRunAtUtc).toLocaleTimeString()} ({s.lastRunStatus})</span>
                )}
              </div>
              {s.selectedSources && s.selectedSources.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Sources:</span>
                  {s.selectedSources.map(src => (
                    <span key={src} style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--line)', borderRadius: '4px' }}>{src}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="schedule-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                small
                variant="secondary"
                icon={Zap}
                disabled={isRunningSchedule === s.id}
                onClick={() => handleRunScheduleNow(s)}
              >
                {isRunningSchedule === s.id ? 'Running...' : 'Run now'}
              </Button>
              <Toggle
                checked={s.isEnabled}
                onChange={() => handleToggleSchedule(s)}
                label={`Toggle ${s.name}`}
              />
              <button
                className="row-delete"
                title="Delete schedule"
                onClick={() => handleDeleteSchedule(s.id)}
                style={{ marginLeft: '4px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
