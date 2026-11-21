import {
  CalendarClock, ChevronRight, FileText, Inbox, ListChecks, Mail, MessageSquareText, Plus,
  RefreshCw, ShieldCheck, Trash2,
} from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function OutreachScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, notify, setModal, outreachTab, setOutreachTab, outreachRows, loadSinkMessages,
    sinkMessages, loadSuppressions, suppressions, kpi, isSendingToSink, handleSendToSink,
    handleDeleteOutreachRow, newSuppressionTarget, setNewSuppressionTarget, newSuppressionReason,
    setNewSuppressionReason, handleAddSuppression, handleRemoveSuppression,
  } = ctx;

  return (
    <>
      {pageHeading('Outreach & Delivery Controls', 'Prepare evidence-based messages, inspect sandboxed test dispatches, and manage suppression rules.', (
        <>
          <Button icon={ListChecks} onClick={() => notify('Bulk review mode active.')}>Review queue</Button>
          <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'compose' })}>Draft outreach</Button>
        </>
      ), 'ENGAGEMENT')}
      <div className="notice-inline amber-notice">
        <ShieldCheck size={15} />
        <span>Sandbox sink mode active: Outbound messages route safely to internal test sinks (dev-sink@vsrsalesengine.local) and check suppression lists before dispatch.</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
        <button
          className={`btn btn-sm ${outreachTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setOutreachTab('queue')}
        >
          Outreach Queue ({outreachRows.length})
        </button>
        <button
          className={`btn btn-sm ${outreachTab === 'sink' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setOutreachTab('sink'); loadSinkMessages(); }}
        >
          Sandbox Sink Inbox ({sinkMessages.length})
        </button>
        <button
          className={`btn btn-sm ${outreachTab === 'suppression' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setOutreachTab('suppression'); loadSuppressions(); }}
        >
          Suppression & Opt-Outs ({suppressions.length})
        </button>
      </div>

      {outreachTab === 'queue' && (
        <>
          <div className="kpi-grid three">
            {kpi('Drafts ready', String(outreachRows.filter(r => r.status === 'Draft ready').length), 'awaiting review', FileText, 'blue', 'safe mode')}
            {kpi('Replies to review', String(outreachRows.filter(r => r.status === 'Replied').length), 'processed', MessageSquareText, 'green', 'real-time')}
            {kpi('Follow-ups due', String(outreachRows.filter(r => r.status === 'Follow-up due').length), 'scheduled', CalendarClock, 'amber', 'pipeline rules')}
          </div>
          <section className="panel table-panel">
            <div className="panel-heading"><div><h2>Outreach queue</h2><p>Track message status and run sandbox test dispatches.</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>COMPANY / CONTACT</th><th>MESSAGE</th><th>CHANNEL</th><th>STATUS</th><th>LAST UPDATED</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {outreachRows.map(r => (
                    <tr key={r.company + r.subject}>
                      <td><div className="company-cell"><div className="company-logo logo-2">{r.company.slice(0, 2)}</div><div><strong>{r.company}</strong><small>{r.contact}</small></div></div></td>
                      <td><div className="message-cell">{r.subject}</div></td>
                      <td><span className="source-cell"><Mail size={14} />{r.channel}</span></td>
                      <td><Pill type={r.status === 'Replied' ? 'green' : r.status === 'Follow-up due' ? 'amber' : 'blue'} dot>{r.status}</Pill></td>
                      <td className="muted-cell">{r.updated}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button className="row-action" onClick={() => setModal({ type: 'compose', prefill: r.subject, company: r.company })}>Open <ChevronRight size={14} /></button>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 4 }}
                            disabled={isSendingToSink === r.company}
                            onClick={() => handleSendToSink(r)}
                          >
                            {isSendingToSink === r.company ? 'Routing...' : 'Send to Test Sink'}
                          </button>
                          <button
                            className="row-delete"
                            title="Remove draft"
                            onClick={() => handleDeleteOutreachRow(r.company, r.subject)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {outreachTab === 'sink' && (
        <section className="panel table-panel">
          <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>Sandbox Test Sink Messages</h2>
              <p>Messages intercepted by the sandbox provider adapter. No external emails are dispatched.</p>
            </div>
            <Button small icon={RefreshCw} onClick={loadSinkMessages}>Refresh</Button>
          </div>
          <div className="table-wrap">
            {sinkMessages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <p>No test messages in sink inbox yet. Click <b>Send to Test Sink</b> on any outreach draft to test interception.</p>
              </div>
            ) : (
              <table>
                <thead><tr><th>SENT AT</th><th>ORIGINAL RECIPIENT</th><th>ROUTED SINK ADDRESS</th><th>SUBJECT</th><th>PROVIDER MSG ID</th><th>MODE</th></tr></thead>
                <tbody>
                  {sinkMessages.map(m => (
                    <tr key={m.id}>
                      <td className="muted-cell">{new Date(m.sentAtUtc).toLocaleTimeString()}</td>
                      <td><strong>{m.originalRecipient}</strong></td>
                      <td><span style={{ color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>{m.routedRecipient}</span></td>
                      <td>{m.subject}</td>
                      <td className="muted-cell" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{m.providerMessageId}</td>
                      <td><Pill type="green">{m.mode}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {outreachTab === 'suppression' && (
        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Durable Suppression & Opt-Out Registry</h2>
              <p>Pre-send safety gate. Any matching email or domain is strictly blocked from outreach dispatches.</p>
            </div>
          </div>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={newSuppressionTarget}
              onChange={e => setNewSuppressionTarget(e.target.value)}
              placeholder="e.g. user@domain.com or @competitor.com"
              style={{ flex: 1, minWidth: '220px', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
            />
            <select
              value={newSuppressionReason}
              onChange={e => setNewSuppressionReason(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
            >
              <option value="OptOut">OptOut (User unsubscribe)</option>
              <option value="Complaint">Complaint</option>
              <option value="ManualSuppression">Manual Suppression</option>
              <option value="BlockedByPolicy">BlockedByPolicy</option>
            </select>
            <Button variant="primary" small onClick={handleAddSuppression}>Add Target</Button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>TARGET (EMAIL / DOMAIN)</th><th>TYPE</th><th>REASON</th><th>SOURCE</th><th>CREATED BY</th><th>ACTION</th></tr></thead>
              <tbody>
                {suppressions.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.target}</strong></td>
                    <td><span style={{ fontSize: '0.75rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{s.type}</span></td>
                    <td><Pill type={s.reason === 'BlockedByPolicy' ? 'red' : 'amber'}>{s.reason}</Pill></td>
                    <td className="muted-cell">{s.source}</td>
                    <td className="muted-cell">{s.createdBy}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        style={{ color: '#dc2626', padding: '2px 8px', fontSize: '0.72rem', borderRadius: 4 }}
                        onClick={() => handleRemoveSuppression(s.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
