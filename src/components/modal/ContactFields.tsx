
import type { ModalForm } from './useModalForm';

export function ContactFields({ form }: { form: ModalForm }) {
  const {
    name, setName, secondary, setSecondary, contactRole, setContactRole, contactEmail,
    setContactEmail, source, setSource, channelBasis, setChannelBasis, sourceUrl, setSourceUrl,
    contactNotes, setContactNotes,
  } = form;

  return (
    <>
      <div className="form-section-divider">Contact Identity</div>
      <div className="form-group">
        <label className="form-label"><span>Full Name <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maya Patel" />
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label"><span>Company <span className="form-label-required">*</span></span></label>
          <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Company name" />
        </div>
        <div className="form-group">
          <label className="form-label">Role / Job Title</label>
          <input className="form-input" value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Engineering Manager" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label"><span>Email Address <span className="form-label-required">*</span></span></label>
        <input className="form-input" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="name@company.com" />
      </div>
      <div className="form-section-divider">Channel & Provenance</div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Source</label>
          <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
            <option value="Manual entry">Manual entry</option>
            <option value="Company website">Company website</option>
            <option value="Referral">Referral</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Channel Basis</label>
          <select className="form-select" value={channelBasis} onChange={e => setChannelBasis(e.target.value)}>
            <option value="ExplicitBusinessContact">Explicit Business Contact</option>
            <option value="PublicDirectory">Public Directory</option>
            <option value="ManualHandoff">Manual Handoff</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Source URL</label>
        <input className="form-input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://" />
      </div>
      <div className="form-group">
        <label className="form-label">Verification / Provenance Notes</label>
        <input className="form-input" value={contactNotes} onChange={e => setContactNotes(e.target.value)} placeholder="Publicly listed on corporate team page." />
      </div>
    </>
  );
}
