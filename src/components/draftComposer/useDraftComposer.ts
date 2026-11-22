import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Contact, DraftGenerationRequest, DraftValidationResult, Opportunity, OutreachTemplate,
} from '../../types';

export interface DraftComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  opportunities: Opportunity[];
  prefillSubject?: string;
  initialCompany?: string;
  onSaveDraft: (draft: { company: string; contact: string; subject: string; body: string }) => void;
  notify: (msg: string) => void;
}

export function useDraftComposer({ contacts, opportunities, prefillSubject, initialCompany, onSaveDraft, notify }: DraftComposerModalProps) {
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
        notify('Could not generate a draft: the server did not answer. Nothing was invented.');
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

  return {
    templates, setTemplates, selectedTemplateId, setSelectedTemplateId, selectedContactId,
    setSelectedContactId, selectedOpportunityId, setSelectedOpportunityId, contactName,
    setContactName, companyName, setCompanyName, contactRole, setContactRole,
    opportunityTitle, setOpportunityTitle, sourceEvidenceSnippet, setSourceEvidenceSnippet,
    jurisdictionPolicy, setJurisdictionPolicy, serviceProposition, setServiceProposition,
    subject, setSubject, body, setBody, factsUsed, setFactsUsed, validation, setValidation,
    isGenerating, setIsGenerating, isValidating, setIsValidating, handleContactSelect,
    handleOpportunitySelect, handleTemplateSelect, handleGenerate, handleValidateContent,
    handleSave,
  };
}

export type DraftComposerState = ReturnType<typeof useDraftComposer>;
