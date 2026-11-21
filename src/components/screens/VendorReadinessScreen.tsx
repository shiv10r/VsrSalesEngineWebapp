import { ChevronRight, ShieldAlert } from 'lucide-react';
import { Pill } from '../ui/Primitives';
import { statusTone } from '../../utils/statusTone';
import type { AppCtx } from '../../appContext';

export function VendorReadinessScreen({ ctx }: { ctx: AppCtx }) {
  const {
    opportunities, pageHeading, setDetail,
  } = ctx;

  const vendorRequirements = opportunities.filter(o => o.docs);

  return (
    <>
      {pageHeading('Vendor readiness', 'Track documentary requirements separately from sales fit. An opportunity can remain visible while readiness is incomplete.', null, 'ELIGIBILITY & COMPLIANCE')}
      <div className="notice-inline amber-notice">
        <ShieldAlert size={15} />
        <span>VSR has not asserted GST registration, office premises, certifications, or other verification documents. Mark requirements as pending until verified.</span>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Requirements requiring review ({vendorRequirements.length})</h2>
            <p>Active opportunities with mandatory supplier onboarding or tender documentation</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>OPPORTUNITY</th>
                <th>REQUIREMENT / NOTES</th>
                <th>SOURCE</th>
                <th>CURRENT STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {vendorRequirements.map(o => (
                <tr key={o.id}>
                  <td>
                    <div className="company-cell">
                      <div className="company-logo logo-1">{o.company.slice(0, 2)}</div>
                      <div><strong>{o.company}</strong><small>{o.title}</small></div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', maxWidth: '320px' }}>
                      {o.vendorRequirementNotes || 'Supplier registration and compliance pack required.'}
                    </div>
                  </td>
                  <td>
                    <span className="source-cell">{o.source}</span>
                  </td>
                  <td>
                    <Pill type={statusTone(o.status)} dot>{o.status}</Pill>
                  </td>
                  <td>
                    <button className="row-action" onClick={() => setDetail(o)}>
                      Inspect <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {vendorRequirements.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    No opportunities currently require vendor readiness documentation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
