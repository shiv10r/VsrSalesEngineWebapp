import { Trash2 } from 'lucide-react';
import type { LocalLead, LocalLeadStatus } from '../../types/localLeads';
import { formatRating, safeWebsiteHref, telHref, websiteLabel } from '../../utils/localLeadsFormat';
import type { LiveEntry } from '../../types/mapsSearch';
import { LiveDetails } from './LiveDetails';
import { NoteCell } from './NoteCell';

interface Props {
  items: LocalLead[];
  statuses: string[];
  readOnly: boolean;
  busyId: string | null;
  onStatus: (lead: LocalLead, status: LocalLeadStatus) => void;
  onNotes: (lead: LocalLead, notes: string) => Promise<boolean>;
  onDelete: (lead: LocalLead) => void;
  /** Live Google details per lead id (Google Maps leads only). Shown in place, never saved. */
  live?: Record<string, LiveEntry>;
  onShowLive?: (lead: LocalLead) => void;
  onHideLive?: (leadId: string) => void;
}

function WebsiteCell({ lead }: { lead: LocalLead }) {
  const href = lead.hasWebsite ? safeWebsiteHref(lead.website) : null;
  if (!href) return <span className="ll-badge warn">No website</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ll-link">{websiteLabel(lead.website)}</a>
  );
}

function PhoneCell({ phone }: { phone: string }) {
  const href = telHref(phone);
  if (!phone.trim()) return <span className="ll-muted">—</span>;
  return href ? <a href={href} className="ll-link">{phone}</a> : <span>{phone}</span>;
}

export function LeadsTable({ items, statuses, readOnly, busyId, onStatus, onNotes, onDelete, live, onShowLive, onHideLive }: Props) {
  return (
    <div className="ll-scroll">
      <table className="ll-table">
        <thead>
          <tr>
            <th scope="col">Business</th>
            <th scope="col">Category</th>
            <th scope="col">District</th>
            <th scope="col">Phone</th>
            <th scope="col">Website</th>
            <th scope="col">Rating</th>
            <th scope="col">Status</th>
            <th scope="col">Notes</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map(lead => {
            const busy = busyId === lead.id;
            return (
              <tr key={lead.id} aria-busy={busy || undefined}>
                <td>
                  <strong className="ll-name">{lead.businessName}</strong>
                  {lead.address && <span className="ll-sub">{lead.address}</span>}
                  <span className="ll-sub">{lead.sourceLabel || lead.source}</span>
                  {live?.[lead.id] && <LiveDetails entry={live[lead.id]} onHide={() => onHideLive?.(lead.id)} />}
                </td>
                <td><span className="ll-chip" title={lead.categoryReason || undefined}>{lead.category}</span></td>
                <td>{lead.district}</td>
                <td><PhoneCell phone={lead.phone} /></td>
                <td><WebsiteCell lead={lead} /></td>
                <td className="ll-num">{formatRating(lead.rating, lead.reviewCount)}</td>
                <td>
                  <select
                    className={`ll-status s-${lead.status.toLowerCase()}`}
                    aria-label={`Status for ${lead.businessName}`}
                    value={lead.status}
                    disabled={readOnly || busy}
                    title={readOnly ? "Guests can't change leads. Sign in to edit." : undefined}
                    onChange={e => onStatus(lead, e.target.value as LocalLeadStatus)}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="ll-notes-td">
                  <NoteCell name={lead.businessName} notes={lead.notes} readOnly={readOnly} busy={busy}
                    onSave={notes => onNotes(lead, notes)} />
                </td>
                <td>
                  {onShowLive && lead.source === 'Google Maps' && lead.placeId && !live?.[lead.id] && (
                    <button type="button" className="ms-live-btn" onClick={() => onShowLive(lead)}>Show live details</button>
                  )}
                  {!readOnly && (
                    <button type="button" className="ll-icon danger" disabled={busy}
                      aria-label={`Delete ${lead.businessName}`} title="Delete lead" onClick={() => onDelete(lead)}>
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
