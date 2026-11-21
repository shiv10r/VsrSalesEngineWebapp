import { RefreshCw, TriangleAlert } from 'lucide-react';
import { ActivityList } from '../Helpers';
import { Button, Pill } from '../ui/Primitives';
import { seedActivities } from '../../data/seeds';
import type { AppCtx } from '../../appContext';

export function ActivityLogScreen({ ctx }: { ctx: AppCtx }) {
  const {
    reliabilityMetrics, failedRuns, pageHeading, loadReliabilityData, notify, activityTab,
    setActivityTab, handleSimulateFailure, isRetryingId, handleRetryFailure,
  } = ctx;

  const metrics = reliabilityMetrics || {
    repeatedSourceFailures: { 'Company careers': 1 },
    schedulerLagSeconds: 0,
    deadLetterCount: 1,
    failedSendCount: 1,
    averageRunDurationMs: 450,
    systemHealth: 'Healthy',
    activeAlerts: []
  };

  const failuresList = failedRuns.length > 0 ? failedRuns : [
    {
      id: 'EXEC-002',
      jobType: 'Discovery',
      referenceId: 'SRC-001',
      status: 'FailedTransient',
      failureClassification: 'Transient',
      attemptCount: 1,
      maxAttempts: 3,
      errorMessage: 'HTTP 429 Too Many Requests: Upstream rate limit reached on company careers portal',
      nextRetryAtUtc: new Date(Date.now() + 300000).toISOString(),
      timeBudgetSeconds: 60,
      durationMs: 650,
      canRetry: true,
      createdAtUtc: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'EXEC-003',
      jobType: 'OutreachSend',
      referenceId: 'CMP-001',
      status: 'DeadLetter',
      failureClassification: 'Permanent',
      attemptCount: 1,
      maxAttempts: 1,
      errorMessage: 'Suppression rule triggered: Domain @blocked-client.example is on the exclusion list',
      timeBudgetSeconds: 30,
      durationMs: 120,
      canRetry: false,
      createdAtUtc: new Date(Date.now() - 7200000).toISOString(),
    }
  ];

  return (
    <>
      {pageHeading('Activity log & reliability', 'An auditable timeline of searches, schedules, health metrics, and failure recovery.', (
        <Button icon={RefreshCw} onClick={() => { loadReliabilityData(); notify('Reliability metrics reloaded'); }}>
          Refresh metrics
        </Button>
      ), 'AUDIT TRAIL & SYSTEM HEALTH')}

      <div className="tab-group" style={{ marginBottom: '16px' }}>
        <button className={`tab-btn ${activityTab === 'audit' ? 'active' : ''}`} onClick={() => setActivityTab('audit')}>
          Audit timeline
        </button>
        <button className={`tab-btn ${activityTab === 'metrics' ? 'active' : ''}`} onClick={() => setActivityTab('metrics')}>
          Reliability & health metrics
        </button>
        <button className={`tab-btn ${activityTab === 'failures' ? 'active' : ''}`} onClick={() => setActivityTab('failures')}>
          Failures & dead-letter queue ({failuresList.length})
        </button>
      </div>

      {activityTab === 'audit' && (
        <section className="panel panel-pad activity-panel">
          <ActivityList items={seedActivities} />
        </section>
      )}

      {activityTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Health</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Pill type={metrics.systemHealth === 'Healthy' ? 'green' : metrics.systemHealth === 'Degraded' ? 'amber' : 'red'} dot>
                  {metrics.systemHealth}
                </Pill>
              </div>
            </div>
            <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduler Lag</span>
              <strong style={{ fontSize: '20px' }}>{metrics.schedulerLagSeconds}s</strong>
              <small style={{ color: 'var(--muted)' }}>Delay behind target next-run times</small>
            </div>
            <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dead-Letter Queue</span>
              <strong style={{ fontSize: '20px' }}>{metrics.deadLetterCount}</strong>
              <small style={{ color: 'var(--muted)' }}>Exhausted or permanent failures</small>
            </div>
            <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed Outreach Sends</span>
              <strong style={{ fontSize: '20px' }}>{metrics.failedSendCount}</strong>
              <small style={{ color: 'var(--muted)' }}>Pre-send suppression / provider blocks</small>
            </div>
            <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Run Duration</span>
              <strong style={{ fontSize: '20px' }}>{metrics.averageRunDurationMs} ms</strong>
              <small style={{ color: 'var(--muted)' }}>Time budget protected executions</small>
            </div>
          </div>

          {metrics.activeAlerts && metrics.activeAlerts.length > 0 && (
            <div className="panel panel-pad" style={{ borderLeft: '4px solid var(--amber)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontWeight: 600 }}>
                <TriangleAlert size={18} />
                <span>Active Operational Alerts ({metrics.activeAlerts.length})</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                {metrics.activeAlerts.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <section className="panel panel-pad">
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Repeated Source Connector Failures</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {Object.entries(metrics.repeatedSourceFailures).map(([src, count]) => (
                <div key={src} style={{ padding: '10px 14px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px' }}>{src}</span>
                  <Pill type={count >= 3 ? 'amber' : 'neutral'}>{count} failure{count === 1 ? '' : 's'}</Pill>
                </div>
              ))}
              {Object.keys(metrics.repeatedSourceFailures).length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No connector failures recorded.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {activityTab === 'failures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section className="panel panel-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '14px' }}>Failure Injection & Resiliency Verification</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Simulate transient and permanent errors to verify retry classification and dead-letter protection.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button small variant="secondary" onClick={() => handleSimulateFailure('Transient')}>
                  Simulate 503 (Transient)
                </Button>
                <Button small variant="secondary" onClick={() => handleSimulateFailure('RateLimitExceeded')}>
                  Simulate 429 (Rate Limit)
                </Button>
                <Button small variant="secondary" onClick={() => handleSimulateFailure('Timeout')}>
                  Simulate Timeout
                </Button>
                <Button small variant="secondary" onClick={() => handleSimulateFailure('Permanent')}>
                  Simulate Policy Block (Permanent)
                </Button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Type</th>
                    <th>Reference</th>
                    <th>Classification</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Error Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {failuresList.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.jobType}</strong></td>
                      <td><code>{r.referenceId}</code></td>
                      <td>
                        <Pill type={r.failureClassification === 'Transient' || r.failureClassification === 'RateLimitExceeded' || r.failureClassification === 'Timeout' ? 'amber' : 'red'}>
                          {r.failureClassification}
                        </Pill>
                      </td>
                      <td>
                        <Pill type={r.status === 'DeadLetter' ? 'red' : 'amber'} dot>
                          {r.status}
                        </Pill>
                      </td>
                      <td>{r.attemptCount} / {r.maxAttempts}</td>
                      <td style={{ maxWidth: '300px', fontSize: '12px' }}>
                        <div style={{ color: 'var(--text)' }}>{r.errorMessage || 'Execution aborted'}</div>
                        {r.nextRetryAtUtc && (
                          <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
                            Next retry: {new Date(r.nextRetryAtUtc).toLocaleTimeString()}
                          </div>
                        )}
                      </td>
                      <td>
                        <Button
                          small
                          variant="secondary"
                          disabled={!r.canRetry || isRetryingId === r.id}
                          onClick={() => handleRetryFailure(r)}
                        >
                          {isRetryingId === r.id ? 'Retrying...' : r.canRetry ? 'Retry run' : 'Dead letter'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
