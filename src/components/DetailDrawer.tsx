import { Building2, ExternalLink, Globe2, MapPin, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button, Pill } from './ui/Primitives';
import { Contact, Opportunity } from '../types';
import { statusTone } from '../utils/statusTone';
import { LinkedInSection } from './linkedin/LinkedInSection';

export function DetailDrawer({
  item,
  onClose,
  onNotify,
  onStatusChange,
  onArchive,
  contacts,
  guest,
  onMarkLinkedIn
}: {
  item: Opportunity;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onStatusChange: (item: Opportunity, newStatus: string, reason?: string) => void;
  onArchive: (item: Opportunity) => void;
  contacts: Contact[];
  guest: boolean;
  onMarkLinkedIn: (contact: Contact, requested: boolean) => Promise<void> | void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(item.status);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['New', 'Needs review', 'Qualified', 'Contacted', 'Interested', 'Archived'];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="detail-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="eyebrow" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>{item.id}</span>
              <Pill type={statusTone(item.status)} dot>{item.status}</Pill>
            </div>
            <h2>{item.company}</h2>
            <p>{item.title}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close drawer"><X size={18} /></button>
        </div>

        <div className="drawer-content">
          {/* Structured 2-Column Key Details Grid */}
          <div className="drawer-detail-grid">
            <div className="drawer-detail-card">
              <span className="drawer-detail-label">Source</span>
              <span className="drawer-detail-val">
                <Globe2 size={13} style={{ color: 'var(--muted)' }} />
                <span>{item.source}</span>
              </span>
            </div>
            <div className="drawer-detail-card">
              <span className="drawer-detail-label">Location</span>
              <span className="drawer-detail-val">
                <MapPin size={13} style={{ color: 'var(--muted)' }} />
                <span>{item.location}</span>
              </span>
            </div>
            <div className="drawer-detail-card">
              <span className="drawer-detail-label">Fit Rating</span>
              <span className="drawer-detail-val">
                <Pill type={item.fit === 'High' ? 'green' : item.fit === 'Medium' ? 'blue' : 'neutral'}>{item.fit}</Pill>
              </span>
            </div>
            <div className="drawer-detail-card">
              <span className="drawer-detail-label">Opportunity Type</span>
              <span className="drawer-detail-val">
                <Building2 size={13} style={{ color: 'var(--muted)' }} />
                <span>{item.type}</span>
              </span>
            </div>
            <div className="drawer-detail-card" style={{ gridColumn: 'span 2' }}>
              <span className="drawer-detail-label">Current Status</span>
              <span className="drawer-detail-val">
                <Pill type={statusTone(item.status)} dot>{item.status}</Pill>
              </span>
            </div>
          </div>

          {/* Pipeline Lifecycle & Status Transition Card */}
          <div className="drawer-pipeline-card">
            <div className="drawer-pipeline-header">
              <span className="drawer-pipeline-title">Pipeline Stage Transition</span>
              <Pill type={statusTone(item.status)} dot>{item.status}</Pill>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ flex: 1, height: '36px', fontSize: '12px' }}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button
                small
                variant="primary"
                disabled={selectedStatus === item.status || isUpdating}
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    await onStatusChange(item, selectedStatus, reason || undefined);
                  } finally {
                    setIsUpdating(false);
                  }
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Stage'}
              </Button>
            </div>
            {selectedStatus !== item.status && (
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Audit transition note / rationale (optional)..."
                className="form-input"
                style={{ marginTop: '8px', height: '34px', fontSize: '11px' }}
              />
            )}
          </div>

          {/* Sourcing Link Card */}
          {item.sourceUrl && (
            <div className="drawer-evidence-card" style={{ borderLeftColor: '#0ea5e9' }}>
              <strong>Verified Sourcing URL</strong>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '4px' }}
              >
                <Globe2 size={13} /> {item.sourceUrl} <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Captured Evidence Box */}
          {item.evidenceSnippet && (
            <div className="drawer-evidence-card">
              <strong>Captured Source Evidence</strong>
              <p>"{item.evidenceSnippet}"</p>
            </div>
          )}

          <LinkedInSection
            company={item.company}
            contacts={contacts}
            openingTitle={item.title}
            guest={guest}
            onNotify={onNotify}
            onMarkRequested={onMarkLinkedIn}
          />

          {/* Status Audit Trail */}
          {item.statusHistory && item.statusHistory.length > 0 && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '10px' }}>
                Status Audit Trail ({item.statusHistory.length})
              </strong>
              <div className="timeline-list">
                {item.statusHistory.map((h, i) => (
                  <div key={i} className="timeline-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '10px' }}>
                        <span><strong>{h.fromStatus}</strong> → <strong>{h.toStatus}</strong></span>
                        <span>{new Date(h.changedAtUtc).toLocaleString()}</span>
                      </div>
                      <div style={{ marginTop: '4px', color: 'var(--text)', fontSize: '11px' }}>
                        <span>By: <strong>{h.changedBy}</strong></span>
                        {h.reason && <span style={{ marginLeft: '8px', fontStyle: 'italic', color: 'var(--muted)' }}>"{h.reason}"</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <Button variant="danger" icon={Trash2} onClick={() => onArchive(item)}>Delete</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
