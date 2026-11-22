import { Info, RefreshCw } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SourcesScreen({ ctx }: { ctx: AppCtx }) {
  const {
    sources, pageHeading, loadSourcesAndProfiles, notify, handleUpdateSourceStatus, sourcesError,
  } = ctx;

  const activeSources = sources;

  return (
    <>
      {pageHeading('Sources & integrations', 'Manage source connectors with explicit access methods and clear policy rules.', <Button icon={RefreshCw} onClick={() => { loadSourcesAndProfiles(); notify('Source registry reloaded.'); }}>Refresh registry</Button>, 'DATA SOURCES')}
      <div className="notice-inline">
        <Info size={15} />
        <span>Policy rule: LinkedIn handoff is restricted by design. Automated scraping and unsolicited platform DMs are prohibited.</span>
      </div>
      {sourcesError && <p className="muted-cell" role="alert">Could not load the sources from the server. Press Refresh registry to try again.</p>}
      {!sourcesError && activeSources.length === 0 && (
        <p className="muted-cell">No sources came back from the server. Press Refresh registry; if this stays empty the server cannot be reached.</p>
      )}
      <div className="sources-grid">
        {activeSources.map(s => (
          <section className="panel source-card" key={s.id || s.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3>{s.name}</h3>
              <Pill type={s.policyStatus === 'Active' ? 'green' : s.policyStatus === 'Restricted' ? 'amber' : 'neutral'} dot>
                {s.policyStatus}
              </Pill>
            </div>
            <p>{s.description}</p>
            <div className="source-method">
              <span>CATEGORY / HEALTH</span>
              <strong>{s.category} · {s.healthStatus}</strong>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', margin: '8px 0' }}>
              Requests today: <b>{s.currentDayRequests}</b> / {s.dailyRequestLimit > 0 ? s.dailyRequestLimit : 'Manual only'}
            </div>
            <div className="source-card-bottom" style={{ marginTop: '10px' }}>
              <select
                value={s.policyStatus}
                onChange={e => handleUpdateSourceStatus(s.id, e.target.value)}
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
              >
                <option value="Active">Active</option>
                <option value="Restricted">Restricted</option>
                <option value="UnderReview">UnderReview</option>
                <option value="Disabled">Disabled</option>
              </select>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {s.allowsDirectFetch ? 'Direct fetch' : 'Handoff only'}
              </span>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
