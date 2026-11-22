import { Clock3, Moon, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { Button, Pill, Toggle } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SchedulesScreen({ ctx }: { ctx: AppCtx }) {
  const {
    schedules, pageHeading, setModal, isRunningSchedule, handleRunScheduleNow, handleToggleSchedule,
    handleDeleteSchedule, schedulesError,
  } = ctx;

  const activeSchedules = schedules;

  return (
    <>
      {pageHeading('Schedules & automation', 'Set recurring lead searches. Every run is visible, idempotent, and protected by distributed locks.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'schedule' })}>New schedule</Button>, 'AUTOMATION CONTROL')}
      <div className="notice-inline" style={{ marginBottom: '16px' }}>
        <ShieldCheck size={16} />
        <span>Worker safety: Scheduled executions acquire distributed transaction-safe run locks to prevent duplicate and overlapping runs.</span>
      </div>
      <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        {schedulesError && <p className="muted-cell" role="alert">Could not load the schedules from the server. Check the connection and reopen this page.</p>}
        {!schedulesError && activeSchedules.length === 0 && <p className="muted-cell">No schedules yet. Create one with New schedule.</p>}
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
