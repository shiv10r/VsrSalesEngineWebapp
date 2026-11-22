import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { FactsUsedPanel } from './draftComposer/FactsUsedPanel';
import { DraftComposerModalProps, useDraftComposer } from './draftComposer/useDraftComposer';
import { ValidationPanel } from './draftComposer/ValidationPanel';

export function DraftComposerModal(props: DraftComposerModalProps) {
  const { isOpen, onClose, contacts, opportunities } = props;
  const state = useDraftComposer(props);
  const {
    templates, selectedTemplateId, selectedContactId, selectedOpportunityId, contactName,
    setContactName, companyName, setCompanyName, contactRole, setContactRole, opportunityTitle,
    setOpportunityTitle, sourceEvidenceSnippet, setSourceEvidenceSnippet, jurisdictionPolicy,
    setJurisdictionPolicy, serviceProposition, setServiceProposition, subject, setSubject, body,
    setBody, factsUsed, validation, isGenerating, isValidating, handleContactSelect,
    handleOpportunitySelect, handleTemplateSelect, handleGenerate, handleValidateContent,
    handleSave,
  } = state;

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Sparkles size={18} color="var(--primary, #2563eb)" />
              Personalized Outreach Draft & Truthfulness Guard
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
              Generate grounded first drafts based strictly on verified source facts. Enforces truthfulness, no false guarantees, and jurisdiction footers.
            </p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top selection controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label className="field-label">Select Reusable Template
              <select value={selectedTemplateId} onChange={e => handleTemplateSelect(e.target.value)}>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </label>
            <label className="field-label">Jurisdiction Policy
              <select value={jurisdictionPolicy} onChange={e => setJurisdictionPolicy(e.target.value)}>
                <option value="US-CANSPAM">US CAN-SPAM (Opt-out + physical address)</option>
                <option value="EU-GDPR">EU GDPR (B2B legitimate interest basis)</option>
                <option value="UK-PECR">UK PECR (Corporate subscriber opt-out)</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label className="field-label">Target Contact
              <select value={selectedContactId} onChange={e => handleContactSelect(e.target.value)}>
                <option value="">-- Choose verified contact or custom --</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role} at {c.company})</option>
                ))}
              </select>
            </label>
            <label className="field-label">Related Opportunity Context
              <select value={selectedOpportunityId} onChange={e => handleOpportunitySelect(e.target.value)}>
                <option value="">-- Choose opportunity or custom --</option>
                {opportunities.map(o => (
                  <option key={o.id} value={o.id}>{o.company} - {o.title}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <label className="field-label">Contact Name
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="e.g. Maya Patel" />
            </label>
            <label className="field-label">Company Name
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" />
            </label>
            <label className="field-label">Role
              <input value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Engineering Manager" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label className="field-label">Opportunity / Initiative Title
              <input value={opportunityTitle} onChange={e => setOpportunityTitle(e.target.value)} placeholder="e.g. Contract Senior .NET Engineer" />
            </label>
            <label className="field-label">Service Proposition
              <input value={serviceProposition} onChange={e => setServiceProposition(e.target.value)} placeholder="e.g. cloud migration and .NET architecture" />
            </label>
          </div>

          <label className="field-label">Verified Source Evidence Snippet
            <textarea
              rows={2}
              value={sourceEvidenceSnippet}
              onChange={e => setSourceEvidenceSnippet(e.target.value)}
              placeholder="Source posting facts used for personalization..."
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              className="btn btn-primary"
              disabled={isGenerating}
              onClick={handleGenerate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              {isGenerating ? 'Generating grounded draft...' : 'Generate Personalized Draft'}
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />

          {/* Facts used badges */}
          {factsUsed.length > 0 && <FactsUsedPanel state={state} />}

          {/* Truthfulness & Compliance Guard Report */}
          {validation && <ValidationPanel validation={validation} />}

          {/* Editable Draft Preview */}
          <label className="field-label">Subject Line
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line..." />
          </label>

          <label className="field-label">Message Body (Editable)
            <textarea
              rows={8}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Message body including commercial pitch and statutory footer..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px' }}>
            <button
              className="btn btn-outline"
              disabled={isValidating || !body.trim()}
              onClick={handleValidateContent}
              style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            >
              {isValidating ? 'Validating...' : 'Validate Content Checks'}
            </button>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--line)', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={validation?.prohibitedClaims && validation.prohibitedClaims.length > 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={15} />
            Approve & Save Draft to Queue
          </button>
        </div>
      </div>
    </div>
  );
}
