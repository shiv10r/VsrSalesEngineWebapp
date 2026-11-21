import { Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Primitives';
import { api } from '../services/api';

export function Modal({ modal, onClose, onNotify, onCreate }: any) {
  const [name, setName] = useState('');
  const [secondary, setSecondary] = useState('');
  const [source, setSource] = useState('Company careers');
  const [location, setLocation] = useState('Remote · India');
  const [fit, setFit] = useState('High');
  const [type, setType] = useState('Individual developer');
  const [docs, setDocs] = useState(false);
  const [vendorRequirementNotes, setVendorRequirementNotes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [evidenceSnippet, setEvidenceSnippet] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [channelBasis, setChannelBasis] = useState('ExplicitBusinessContact');
  const [contactNotes, setContactNotes] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [runCap, setRunCap] = useState(50);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('06:00');
  const [timezone, setTimezone] = useState('UTC');

  // AI Form Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAutoFill = async (overridePrompt?: string) => {
    const promptText = (overridePrompt || aiPrompt).trim();
    if (!promptText) return;
    setIsAiLoading(true);
    try {
      const result = await api.parseAiFormPrompt(modal.type, promptText);
      if (modal.type === 'opportunity' && result?.opportunity) {
        if (result.opportunity.company) setName(result.opportunity.company);
        if (result.opportunity.title) setSecondary(result.opportunity.title);
        if (result.opportunity.source) setSource(result.opportunity.source);
        if (result.opportunity.location) setLocation(result.opportunity.location);
        if (result.opportunity.fitRating) setFit(result.opportunity.fitRating);
        if (result.opportunity.opportunityType) setType(result.opportunity.opportunityType);
        if (result.opportunity.sourceUrl) setSourceUrl(result.opportunity.sourceUrl);
        if (result.opportunity.evidenceSnippet) setEvidenceSnippet(result.opportunity.evidenceSnippet);
        if (result.opportunity.requiresVendorDocs !== undefined) setDocs(result.opportunity.requiresVendorDocs);
        if (result.opportunity.vendorRequirementNotes) setVendorRequirementNotes(result.opportunity.vendorRequirementNotes);
        onNotify('✨ Gemini AI auto-filled opportunity fields');
      } else if (modal.type === 'contact' && result?.contact) {
        if (result.contact.name) setName(result.contact.name);
        if (result.contact.company) setSecondary(result.contact.company);
        if (result.contact.role) setContactRole(result.contact.role);
        if (result.contact.email) setContactEmail(result.contact.email);
        if (result.contact.source) setSource(result.contact.source);
        if (result.contact.channelBasis) setChannelBasis(result.contact.channelBasis);
        if (result.contact.sourceUrl) setSourceUrl(result.contact.sourceUrl);
        if (result.contact.notes) setContactNotes(result.contact.notes);
        onNotify('✨ Gemini AI auto-filled contact fields');
      } else if (modal.type === 'campaign' && result?.campaign) {
        if (result.campaign.name) setName(result.campaign.name);
        if (result.campaign.audience) setSecondary(result.campaign.audience);
        onNotify('✨ Gemini AI auto-filled campaign details');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const samplePrompts = modal.type === 'opportunity' ? [
    'Sr .NET Lead at Microsoft India, high fit, vendor docs needed',
    'Legacy modernization partner for CloudHarbor Labs Bengaluru',
    'React frontend contractor for Northstar Digital Remote'
  ] : modal.type === 'contact' ? [
    'Maya Patel, Engineering Manager at Northstar Digital, maya.patel@northstar.com',
    'Arjun Mehta, Talent Partner at BrightPath Health, arjun.mehta@brightpath.com'
  ] : modal.type === 'campaign' ? [
    'Healthcare CTOs for .NET Cloud Migration',
    'BFSI Engineering Partners in India and APAC'
  ] : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <div className="ai-assistant-badge" style={{ marginBottom: '4px' }}>
              <Sparkles size={11} /> Smart Form System
            </div>
            <h3>
              {modal.type === 'campaign' ? 'Create Sales Campaign' :
               modal.type === 'contact' ? 'Add Contact' :
               modal.type === 'opportunity' ? 'Add Opportunity' :
               modal.type === 'schedule' ? 'New Automation Schedule' : 'Information'}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={16} /></button>
        </div>
        <div className="modal-body">
          {modal.type !== 'help' && (
            <div className="ai-form-assistant">
              <div className="ai-assistant-header">
                <span className="ai-assistant-badge">
                  <Sparkles size={12} /> Gemini 2.5 Flash Form Assistant
                </span>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Auto-generates structured fields</span>
              </div>
              <div className="ai-assistant-row">
                <input
                  className="ai-assistant-input"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder={
                    modal.type === 'opportunity' ? 'Describe opportunity or paste job snippet...' :
                    modal.type === 'contact' ? 'Paste email signature, directory text or card info...' :
                    modal.type === 'campaign' ? 'Describe campaign target market or pitch goal...' :
                    'Describe your requirements...'
                  }
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiAutoFill(); } }}
                />
                <button
                  type="button"
                  className="ai-assistant-btn"
                  onClick={() => handleAiAutoFill()}
                  disabled={isAiLoading || !aiPrompt.trim()}
                >
                  <Sparkles size={13} /> {isAiLoading ? 'Synthesizing...' : 'AI Auto-Fill'}
                </button>
              </div>
              {samplePrompts.length > 0 && (
                <div className="ai-prompt-samples">
                  <span className="ai-sample-label">Try sample:</span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-sample-chip"
                      onClick={() => {
                        setAiPrompt(p);
                        handleAiAutoFill(p);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {modal.type === 'campaign' && (
            <>
              <div className="form-section-divider">Campaign Parameters</div>
              <div className="form-group">
                <label className="form-label"><span>Campaign Name <span className="form-label-required">*</span></span></label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. .NET API Modernization" />
              </div>
              <div className="form-group">
                <label className="form-label"><span>Target Audience <span className="form-label-required">*</span></span></label>
                <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Healthcare CTOs · India + Global" />
              </div>
            </>
          )}

          {modal.type === 'schedule' && (
            <>
              <div className="form-section-divider">Schedule Configuration</div>
              <div className="form-group">
                <label className="form-label"><span>Schedule Name <span className="form-label-required">*</span></span></label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Careers & Feeds Scan" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Automated recurring discovery for .NET positions" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Run Cap (Requests/Run)</label>
                  <input className="form-input" type="number" value={runCap} onChange={e => setRunCap(Number(e.target.value))} min={5} max={500} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Quiet Hours Start</label>
                  <input className="form-input" value={quietStart} onChange={e => setQuietStart(e.target.value)} placeholder="22:00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Quiet Hours End</label>
                  <input className="form-input" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} placeholder="06:00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input className="form-input" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="UTC" />
              </div>
            </>
          )}

          {modal.type === 'contact' && (
            <>
              <div className="form-section-divider">Contact Identity</div>
              <div className="form-group">
                <label className="form-label"><span>Full Name <span className="form-label-required">*</span></span></label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maya Patel" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label"><span>Company <span className="form-label-required">*</span></span></label>
                  <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Northstar Digital" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role / Job Title</label>
                  <input className="form-input" value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Engineering Manager" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><span>Email Address <span className="form-label-required">*</span></span></label>
                <input className="form-input" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="e.g. maya.patel@example.com" />
              </div>
              <div className="form-section-divider">Channel & Provenance</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                    <option value="Company careers">Company careers</option>
                    <option value="Public directory">Public directory</option>
                    <option value="Direct research">Direct research</option>
                    <option value="Public procurement">Public procurement</option>
                    <option value="Manual entry">Manual entry</option>
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
                <input className="form-input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://example.com/team" />
              </div>
              <div className="form-group">
                <label className="form-label">Verification / Provenance Notes</label>
                <input className="form-input" value={contactNotes} onChange={e => setContactNotes(e.target.value)} placeholder="Publicly listed on corporate team page." />
              </div>
            </>
          )}

          {modal.type === 'opportunity' && (
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
          )}

          {modal.type === 'help' && (
            <p style={{ lineHeight: 1.6, color: 'var(--text)' }}>
              Welcome to VSR Sales Engine. Use the left navigation to explore opportunities, build automated discovery runs, draft compliance-verified outreach, and verify vendor readiness documentation.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cancel</Button>
          {modal.type !== 'help' && (
            <Button variant="primary" onClick={() => onCreate({
              type: modal.type,
              name,
              company: modal.type === 'contact' ? secondary : name,
              role: contactRole,
              email: contactEmail,
              title: secondary,
              audience: secondary,
              source,
              location,
              fit,
              opportunityType: type,
              docs,
              vendorRequirementNotes,
              sourceUrl,
              channelBasis,
              notes: contactNotes,
              evidenceSnippet,
              frequency,
              runCap,
              quietHoursStart: quietStart,
              quietHoursEnd: quietEnd,
              timezone,
            })}>
              <Plus size={14} style={{ marginRight: '6px' }} /> Create {modal.type === 'opportunity' ? 'Opportunity' : modal.type === 'contact' ? 'Contact' : modal.type === 'campaign' ? 'Campaign' : 'Schedule'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
