import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function ActivityLogScreen({ ctx }: { ctx: AppCtx }) {
  const {
    reliabilityMetrics, failedRuns, pageHeading, go, loadReliabilityData, notify, activityTab,
    setActivityTab, isRetryingId, handleRetryFailure,
  } = ctx;

  const metrics = reliabilityMetrics;
  const failuresList = failedRuns;

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
          <p className="muted-cell" style={{ margin: 0 }}>
            No audit entries are recorded here yet. Agent runs and their step-by-step log are on the Agents page.
            <button className="text-link" style={{ marginLeft: 8 }} onClick={() => go('Agents')}>Open Agents</button>
          </p>
        </section>
      )}

      {activityTab === 'metrics' && !metrics && (
        <section className="panel panel-pad"><p className="muted-cell" style={{ margin: 0 }}>No health metrics from the server yet. Press Refresh metrics; if this stays empty the server cannot be reached.</p></section>
      )}

      {activityTab === 'metrics' && metrics && (
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
                  {failuresList.length === 0 && (
                    <tr><td colSpan={7} className="muted-cell" style={{ textAlign: 'center', padding: '24px' }}>No failed runs recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
