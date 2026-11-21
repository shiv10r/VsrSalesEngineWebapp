
import type { ModalForm } from './useModalForm';

export function OpportunityFields({ form }: { form: ModalForm }) {
  const {
    name, setName, secondary, setSecondary, source, setSource, location, setLocation, fit,
    setFit, type, setType, sourceUrl, setSourceUrl, evidenceSnippet, setEvidenceSnippet, docs,
    setDocs, vendorRequirementNotes, setVendorRequirementNotes,
  } = form;

  return (
    <>
      <div className="form-section-divider">Role & Opportunity Identity</div>
      <div className="form-group">
        <label className="form-label"><span>Company Name <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Microsoft / Northstar Digital" />
      </div>
      <div className="form-group">
        <label className="form-label"><span>Role / Requirement Title <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Contract Senior .NET Cloud Engineer" />
      </div>
      <div className="form-section-divider">Classification & Targeting</div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Source Channel</label>
          <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
            <option value="Company careers">Company careers</option>
            <option value="Public job board">Public job board</option>
            <option value="Direct research">Direct research</option>
            <option value="Public procurement">Public procurement</option>
            <option value="Approved feed">Approved feed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Bengaluru, India / Remote" />
        </div>
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Fit Rating</label>
          <select className="form-select" value={fit} onChange={e => setFit(e.target.value)}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Opportunity Type</label>
          <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="Individual developer">Individual developer</option>
            <option value="Company/vendor">Company/vendor</option>
            <option value="Direct project">Direct project</option>
          </select>
        </div>
      </div>
      <div className="form-section-divider">Verification & Sourcing</div>
      <div className="form-group">
        <label className="form-label">Source URL</label>
        <input className="form-input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://careers.example.com/job" />
      </div>
      <div className="form-group">
        <label className="form-label">Captured Evidence Snippet</label>
        <textarea className="form-textarea" rows={2} value={evidenceSnippet} onChange={e => setEvidenceSnippet(e.target.value)} placeholder="Raw text evidence from posting..." />
      </div>
      <div className="form-section-divider">Vendor Procurement Gate</div>
      <label className="form-checkbox-label">
        <input type="checkbox" checked={docs} onChange={e => setDocs(e.target.checked)} />
        <span>Requires Vendor Registration / Procurement Documentation</span>
      </label>
      {docs && (
        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label">Vendor Documentation Notes</label>
          <input className="form-input" value={vendorRequirementNotes} onChange={e => setVendorRequirementNotes(e.target.value)} placeholder="e.g. GST registration, ISO certification, vendor portal setup required" />
        </div>
      )}
    </>
  );
}
