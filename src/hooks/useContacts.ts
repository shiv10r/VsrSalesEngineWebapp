import { useState } from 'react';
import { api } from '../services/api';
import { Contact } from '../types';
import { NOT_CONTACTED_STATUS, REQUESTED_STATUS } from '../utils/linkedinHandoff';
import type { UiState } from './useUiState';

export function useContacts(ui: UiState) {
  const { notify } = ui;

  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadContacts = async () => {
    try {
      const data = await api.getContacts();
      setContacts(data ?? []);
    } catch {
      // The server banner already says when it cannot be reached; keep what is on screen.
    }
  };

  const handleCreateContact = async (payload: any) => {
    const created = await api.createContact({
      name: payload.name,
      company: payload.company,
      role: payload.role,
      email: payload.email,
      source: payload.source || 'Manual entry',
      sourceUrl: payload.sourceUrl,
      channelBasis: payload.channelBasis || 'ExplicitBusinessContact',
      notes: payload.notes,
    });
    if (created) {
      setContacts(prev => [created, ...prev.filter(c => c.id !== created.id)]);
      notify(`Contact ${created.name} added`);
    } else {
      notify('Could not save the contact: the server did not answer. Nothing was added.');
    }
  };

  const handleQualifyContact = async (id: string, qualificationStatus: string, status?: string, notes?: string) => {
    const updated = await api.qualifyContact(id, qualificationStatus, status, notes);
    if (updated) {
      setContacts(prev => prev.map(c => c.id === id ? updated : c));
      notify(`Contact ${updated.name} updated to ${qualificationStatus}`);
    } else {
      notify('Could not update the contact: the server did not answer.');
    }
  };

  /** Record that the person sent a LinkedIn request themselves. Uses the existing contact update API. */
  const handleMarkLinkedInRequested = async (contact: Contact, requested: boolean) => {
    const status = requested ? REQUESTED_STATUS : NOT_CONTACTED_STATUS;
    const updated = await api.qualifyContact(contact.id, contact.qualificationStatus || 'Unverified', status);
    if (updated) {
      setContacts(prev => prev.map(c => c.id === contact.id ? updated : c));
      notify(requested ? `Marked ${updated.name} as LinkedIn requested` : `Cleared the LinkedIn mark for ${updated.name}`);
    } else {
      notify('Not saved: the server could not be reached');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete contact ${id}?`)) {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      notify(`Contact ${id} deleted`);
    }
  };

  return {
    contacts, setContacts, loadContacts, handleCreateContact, handleQualifyContact,
    handleDeleteContact, handleMarkLinkedInRequested,
  };
}

export type ContactsState = ReturnType<typeof useContacts>;
