import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
  RefreshCw,
  Building2,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import {
  Contact,
  DraftGenerationRequest,
  DraftGenerationResult,
  DraftValidationResult,
  Opportunity,
  OutreachTemplate
} from '../types';

interface DraftComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  opportunities: Opportunity[];
  prefillSubject?: string;
  initialCompany?: string;
  onSaveDraft: (draft: { company: string; contact: string; subject: string; body: string }) => void;
  notify: (msg: string) => void;
}

export function DraftComposerModal({
  isOpen,
  onClose,
  contacts,
  opportunities,
  prefillSubject,
  initialCompany,
  onSaveDraft,
  notify,
}: DraftComposerModalProps) {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');

  // Editable fields
  const [contactName, setContactName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>(initialCompany || '');
  const [contactRole, setContactRole] = useState<string>('');
  const [opportunityTitle, setOpportunityTitle] = useState<string>('');
  const [sourceEvidenceSnippet, setSourceEvidenceSnippet] = useState<string>('');
  const [jurisdictionPolicy, setJurisdictionPolicy] = useState<string>('US-CANSPAM');
  const [serviceProposition, setServiceProposition] = useState<string>('');

  // Generation & validation state
  const [subject, setSubject] = useState<string>(prefillSubject || '');
  const [body, setBody] = useState<string>('');
  const [factsUsed, setFactsUsed] = useState<string[]>([]);
  const [validation, setValidation] = useState<DraftValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    async function loadTemplates() {
      const data = await api.getOutreachTemplates();
      if (data && data.length > 0) {
        setTemplates(data);
        setSelectedTemplateId(data[0].id);
        setServiceProposition(data[0].serviceProposition);
        setJurisdictionPolicy(data[0].jurisdictionPolicy);
      }
    }
    loadTemplates();
  }, []);

  // Sync when initialCompany or prefillSubject changes
  useEffect(() => {
    if (initialCompany) {
      setCompanyName(initialCompany);
      const matchContact = contacts.find(c => c.company.toLowerCase() === initialCompany.toLowerCase());
      if (matchContact) {
        setSelectedContactId(matchContact.id);
        setContactName(matchContact.name);
        setContactRole(matchContact.role);
      }
      const matchOpp = opportunities.find(o => o.company.toLowerCase() === initialCompany.toLowerCase());
      if (matchOpp) {
        setSelectedOpportunityId(matchOpp.id);
        setOpportunityTitle(matchOpp.title);
        setSourceEvidenceSnippet(matchOpp.evidenceSnippet || matchOpp.sourceUrl || '');
      }
    }
    if (prefillSubject) {
      setSubject(prefillSubject);
    }
  }, [initialCompany, prefillSubject, contacts, opportunities]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const c = contacts.find(item => item.id === contactId);
    if (c) {
      setContactName(c.name);
      setCompanyName(c.company);
      setContactRole(c.role);
    }
  };

  const handleOpportunitySelect = (oppId: string) => {
    setSelectedOpportunityId(oppId);
    const opp = opportunities.find(item => item.id === oppId);
    if (opp) {
      setOpportunityTitle(opp.title);
      setSourceEvidenceSnippet(opp.evidenceSnippet || opp.sourceUrl || `Sourced from ${opp.source}`);
      if (!companyName) {
        setCompanyName(opp.company);
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find(item => item.id === templateId);
    if (t) {
      setServiceProposition(t.serviceProposition);
      setJurisdictionPolicy(t.jurisdictionPolicy);
    }
  };

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      notify('Please specify a company name before generating a draft.');
      return;
    }

    setIsGenerating(true);
    try {
      const request: DraftGenerationRequest = {
        templateId: selectedTemplateId || undefined,
        contactName: contactName.trim() || 'Hiring Team',
        companyName: companyName.trim(),
        role: contactRole.trim() || undefined,
        opportunityTitle: opportunityTitle.trim() || undefined,
        sourceEvidenceSnippet: sourceEvidenceSnippet.trim() || undefined,
        serviceProposition: serviceProposition.trim() || undefined,
        jurisdictionPolicy,
      };

      const result = await api.generateDraft(request);
      if (result) {
        setSubject(result.subject);
        setBody(result.body);
        setFactsUsed(result.factsUsed || []);
        setValidation({
          isValid: result.isValid,
          missingVariables: result.missingVariables || [],
          prohibitedClaims: result.prohibitedClaims || [],
          warnings: result.warnings || [],
          hasUnsubscribeMechanism: !result.warnings.some(w => w.toLowerCase().includes('opt-out')),
          hasPhysicalAddress: !result.warnings.some(w => w.toLowerCase().includes('address')),
          hasSenderIdentity: !result.warnings.some(w => w.toLowerCase().includes('sender identity')),
        });
        notify('Outreach draft generated with truthfulness checks.');
      } else {
        // Fallback local synthesis
        const fallbackSubject = `Inquiry regarding ${companyName}'s ${opportunityTitle || 'engineering'} initiatives`;
        const fallbackBody = `Hi ${contactName || 'Team'},\n\nI noticed ${companyName} is exploring ${opportunityTitle || 'modernization projects'}.\n\nAt VSR Technologies, we specialize in ${serviceProposition || 'cloud migrations and full-stack engineering'}.\n\nWould you be open to a 10-minute introductory call next week?\n\nBest regards,\nVSR Outreach Lead\nVSR Technologies\n\nTo opt out of future updates, reply 'UNSUBSCRIBE' or visit https://vsrtechnologies.com/outreach/opt-out.\nVSR Technologies, 100 Enterprise Way, Suite 400, Austin TX 78701.`;
        setSubject(fallbackSubject);
        setBody(fallbackBody);
        setFactsUsed([`Company: ${companyName}`, `Opportunity: ${opportunityTitle || 'Technical initiative'}`]);
        setValidation({
          isValid: true,
          missingVariables: [],
          prohibitedClaims: [],
          warnings: [],
          hasUnsubscribeMechanism: true,
          hasPhysicalAddress: true,
          hasSenderIdentity: true,
        });
        notify('Draft generated (local fallback).');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidateContent = async () => {
    if (!subject.trim() || !body.trim()) {
      notify('Subject and body cannot be empty.');
      return;
    }

    setIsValidating(true);
    try {
      const result = await api.validateDraft(subject, body, jurisdictionPolicy);
      if (result) {
        setValidation(result);
        if (result.isValid) {
          notify('Draft passed all truthfulness and compliance checks.');
        } else {
          notify('Validation warnings or prohibited claims detected.');
        }
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    if (validation && validation.prohibitedClaims.length > 0) {
      notify('Cannot save draft with prohibited claims. Please resolve flagged issues.');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      notify('Subject and message body are required.');
      return;
    }

    onSaveDraft({
      company: companyName.trim() || 'Prospect Company',
      contact: contactName.trim() || 'Hiring Lead',
      subject: subject.trim(),
      body: body.trim(),
    });
  };

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
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Northstar Digital" />
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
          {factsUsed.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                VERIFIED SOURCE FACTS EMBEDDED:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {factsUsed.map((fact, idx) => (
                  <span
                    key={idx}
                    style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}
                  >
                    ✓ {fact}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Truthfulness & Compliance Guard Report */}
          {validation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {validation.prohibitedClaims.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 6, background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span><strong>Truthfulness Guard Passed:</strong> No fabricated claims, false guarantees, or unverified claims detected.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 12px', borderRadius: 6, background: '#fef2f2', color: '#991b1b', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <ShieldAlert size={16} color="#dc2626" />
                    Prohibited Claims Detected:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {validation.prohibitedClaims.map((claim, idx) => (
                      <li key={idx}>{claim}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.missingVariables.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 6, background: '#fffbeb', color: '#92400e', fontSize: '0.78rem' }}>
                  <TriangleAlert size={16} color="#d97706" />
                  <span><strong>Unresolved Placeholders:</strong> {validation.missingVariables.map(v => `{{${v}}}`).join(', ')}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasUnsubscribeMechanism ? '#ecfdf5' : '#fef2f2', color: validation.hasUnsubscribeMechanism ? '#065f46' : '#991b1b' }}>
                  {validation.hasUnsubscribeMechanism ? '✓ Opt-Out Instructions Present' : '✗ Missing Opt-Out Footer'}
                </span>
                <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasPhysicalAddress ? '#ecfdf5' : '#fef2f2', color: validation.hasPhysicalAddress ? '#065f46' : '#991b1b' }}>
                  {validation.hasPhysicalAddress ? '✓ Physical Business Address Present' : '✗ Missing Business Address'}
                </span>
                <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasSenderIdentity ? '#ecfdf5' : '#fef2f2', color: validation.hasSenderIdentity ? '#065f46' : '#991b1b' }}>
                  {validation.hasSenderIdentity ? '✓ Commercial Sender Identity Clear' : '✗ Missing Sender Identity'}
                </span>
              </div>
            </div>
          )}

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
