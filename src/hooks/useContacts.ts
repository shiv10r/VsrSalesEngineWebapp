import { useState } from 'react';
import { seedContacts } from '../data/seeds';
import { api } from '../services/api';
import { Contact } from '../types';
import type { UiState } from './useUiState';

export function useContacts(ui: UiState) {
  const { notify } = ui;

  const [contacts, setContacts] = useState<Contact[]>(seedContacts);

  const loadContacts = async () => {
    try {
      const data = await api.getContacts();
      if (data && data.length > 0) {
        setContacts(data);
      }
    } catch {
      // Fallback
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
      const fallback: Contact = {
        id: `CNT-${1000 + contacts.length + 1}`,
        name: payload.name || 'New contact',
        company: payload.company || 'Unassigned',
        role: payload.role || 'Unspecified',
        email: payload.email || 'contact@example.com',
        source: payload.source || 'Manual entry',
        sourceUrl: payload.sourceUrl,
        channelBasis: payload.channelBasis || 'ExplicitBusinessContact',
        status: 'Not contacted',
        qualificationStatus: 'Unverified',
        isRoleAccount: false,
        notes: payload.notes,
      };
      setContacts(prev => [fallback, ...prev]);
      notify('Contact added (local)');
    }
  };

  const handleQualifyContact = async (id: string, qualificationStatus: string, status?: string, notes?: string) => {
    const updated = await api.qualifyContact(id, qualificationStatus, status, notes);
    if (updated) {
      setContacts(prev => prev.map(c => c.id === id ? updated : c));
      notify(`Contact ${updated.name} updated to ${qualificationStatus}`);
    } else {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, qualificationStatus, status: status || c.status } : c));
      notify(`Contact qualification updated (local)`);
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
    handleDeleteContact,
  };
}

export type ContactsState = ReturnType<typeof useContacts>;
