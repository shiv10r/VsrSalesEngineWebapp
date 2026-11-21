import { Info, RefreshCw } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SourcesScreen({ ctx }: { ctx: AppCtx }) {
  const {
    sources, pageHeading, loadSourcesAndProfiles, notify, handleUpdateSourceStatus,
  } = ctx;

  const activeSources = sources.length > 0 ? sources : [
    { id: 'SRC-001', name: 'Company careers', description: 'Target corporate career pages and approved public job boards.', category: 'Careers', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Extracted from public career portal.', dailyRequestLimit: 500, currentDayRequests: 42, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
    { id: 'SRC-002', name: 'Public job board', description: 'Public indexing boards and technology work listings.', category: 'JobBoard', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Referenced from public job board listing.', dailyRequestLimit: 300, currentDayRequests: 18, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
    { id: 'SRC-003', name: 'Direct company research', description: 'Verified manual and automated deep research on target organizations.', category: 'Research', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Verified research entry by sales team member.', dailyRequestLimit: 200, currentDayRequests: 9, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
    { id: 'SRC-004', name: 'Public procurement', description: 'Government and public sector RFP / vendor registration portals.', category: 'Procurement', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Public procurement notice / tender reference.', dailyRequestLimit: 150, currentDayRequests: 3, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
    { id: 'SRC-005', name: 'Approved feed', description: 'Syndicated developer contract and technology requirement feeds.', category: 'Feed', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Syndicated feed item with canonical URL.', dailyRequestLimit: 400, currentDayRequests: 24, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
    { id: 'SRC-006', name: 'LinkedIn handoff', description: 'Manual browser handoff only. Automated scraping and automated DMs prohibited by policy.', category: 'Social', policyStatus: 'Restricted', allowsDirectFetch: false, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Manual external browser link only. No automated access.', dailyRequestLimit: 0, currentDayRequests: 0, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
  ];

  return (
    <>
      {pageHeading('Sources & integrations', 'Manage source connectors with explicit access methods and clear policy rules.', <Button icon={RefreshCw} onClick={() => { loadSourcesAndProfiles(); notify('Source registry reloaded.'); }}>Refresh registry</Button>, 'DATA SOURCES')}
      <div className="notice-inline">
        <Info size={15} />
        <span>Policy rule: LinkedIn handoff is restricted by design. Automated scraping and unsolicited platform DMs are prohibited.</span>
      </div>
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
              Daily requests: <b>{s.currentDayRequests}</b> / {s.dailyRequestLimit > 0 ? s.dailyRequestLimit : 'Manual only'}
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
