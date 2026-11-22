import { useState } from 'react';

export function useModalForm() {
  const [name, setName] = useState('');
  const [secondary, setSecondary] = useState('');
  const [source, setSource] = useState('Manually added');
  const [location, setLocation] = useState('Uttar Pradesh, India');
  const [fit, setFit] = useState('High');
  const [type, setType] = useState('Individual developer');
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

  return {
    name, setName, secondary, setSecondary, source, setSource, location, setLocation, fit,
    setFit, type, setType,
    sourceUrl, setSourceUrl, evidenceSnippet, setEvidenceSnippet, contactRole, setContactRole,
    contactEmail, setContactEmail, channelBasis, setChannelBasis, contactNotes,
    setContactNotes, frequency, setFrequency, runCap, setRunCap, quietStart, setQuietStart,
    quietEnd, setQuietEnd, timezone, setTimezone,
  };
}

export type ModalForm = ReturnType<typeof useModalForm>;
