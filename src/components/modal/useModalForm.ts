import { useState } from 'react';
import { api } from '../../services/api';

export function useModalForm(modal: any, onNotify: (message: string) => void) {
  const [name, setName] = useState('');
  const [secondary, setSecondary] = useState('');
  const [source, setSource] = useState('Manually added');
  const [location, setLocation] = useState('Uttar Pradesh, India');
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
        onNotify('AI form assistant filled opportunity fields');
      } else if (modal.type === 'contact' && result?.contact) {
        if (result.contact.name) setName(result.contact.name);
        if (result.contact.company) setSecondary(result.contact.company);
        if (result.contact.role) setContactRole(result.contact.role);
        if (result.contact.email) setContactEmail(result.contact.email);
        if (result.contact.source) setSource(result.contact.source);
        if (result.contact.channelBasis) setChannelBasis(result.contact.channelBasis);
        if (result.contact.sourceUrl) setSourceUrl(result.contact.sourceUrl);
        if (result.contact.notes) setContactNotes(result.contact.notes);
        onNotify('AI form assistant filled contact fields');
      } else if (modal.type === 'campaign' && result?.campaign) {
        if (result.campaign.name) setName(result.campaign.name);
        if (result.campaign.audience) setSecondary(result.campaign.audience);
        onNotify('AI form assistant filled campaign details');
      } else {
        onNotify('The AI form assistant is not available right now. Please fill the form by hand.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const samplePrompts = modal.type === 'opportunity' ? [
    'Senior .NET developer contract, high fit, vendor documents needed',
    'React frontend contractor, remote'
  ] : modal.type === 'campaign' ? [
    'Healthcare CTOs for .NET cloud migration'
  ] : [];

  return {
    name, setName, secondary, setSecondary, source, setSource, location, setLocation, fit,
    setFit, type, setType, docs, setDocs, vendorRequirementNotes, setVendorRequirementNotes,
    sourceUrl, setSourceUrl, evidenceSnippet, setEvidenceSnippet, contactRole, setContactRole,
    contactEmail, setContactEmail, channelBasis, setChannelBasis, contactNotes,
    setContactNotes, frequency, setFrequency, runCap, setRunCap, quietStart, setQuietStart,
    quietEnd, setQuietEnd, timezone, setTimezone, aiPrompt, setAiPrompt, isAiLoading,
    setIsAiLoading, handleAiAutoFill, samplePrompts,
  };
}

export type ModalForm = ReturnType<typeof useModalForm>;
