import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function CampaignsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, setModal, campaigns, setSelectedGateCampaign, handleToggleCampaignStatus,
    handleDeleteCampaign,
  } = ctx;

  return (
    <>
      {pageHeading('Campaigns & Sequence Controls', 'Organize outreach sequences with transparent limits, stop conditions, and compliance gate verification.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>Create campaign</Button>, 'OUTREACH MANAGEMENT')}
      <div className="campaign-cards">
        {campaigns.map(c => (
          <section className="panel campaign-card" key={c.id || c.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pill type={c.status === 'Active' ? 'green' : c.status === 'Paused' ? 'amber' : 'neutral'} dot>{c.status}</Pill>
              <span style={{ fontSize: '0.72rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, fontWeight: 500, color: 'var(--primary)' }}>
                {c.mode === 'AutoSendWithinRules' ? '⚡ Auto-send' : c.mode === 'ApprovalRequired' ? '👁 Approval required' : '✍ Draft only'}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0' }}>{c.name}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{c.audience}</p>
            <div className="campaign-stats">
              <div><small>Messages sent</small><strong>{c.sent}</strong></div>
              <div><small>Replies</small><strong>{c.replies}</strong></div>
              <div><small>Reply rate</small><strong>{c.sent ? Math.round(c.replies / c.sent * 100) + '%' : '—'}</strong></div>
            </div>

            <div style={{ background: 'var(--bg)', padding: '8px', borderRadius: 6, fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
              <span>Daily Cap: <b>{c.dailySendLimit || 25}</b></span>
              <span>Touches: <b>{c.maxTouches || 3} max</b></span>
              <span>Delay: <b>{c.delayDaysBetweenTouches || 3}d</b></span>
            </div>

            <div className="campaign-actions" style={{ marginTop: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button small icon={ShieldCheck} onClick={() => setSelectedGateCampaign(c)}>Check Gate</Button>
              <Button small onClick={() => setModal({ type: 'compose', prefill: `Campaign: ${c.name}` })}>Sequence</Button>
              <Button small variant={c.status === 'Active' ? 'secondary' : 'primary'} onClick={() => handleToggleCampaignStatus(c)}>
                {c.status === 'Active' ? 'Pause' : 'Activate'}
              </Button>
              <button
                className="row-delete"
                title="Delete campaign"
                onClick={() => handleDeleteCampaign(c.id || c.name)}
                style={{ marginLeft: 'auto' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
