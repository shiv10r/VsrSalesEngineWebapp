import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { Opportunity } from '../types';
import type { UiState } from './useUiState';

export function useOpportunities(ui: UiState) {
  const { query, statusFilter, sourceFilter, notify, userEmail } = ui;

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [detail, setDetail] = useState<Opportunity | null>(null);

  const loadOpportunities = async () => {
    try {
      const data = await api.getOpportunities({
        query,
        status: statusFilter,
        source: sourceFilter,
      });
      setOpportunities(data ?? []);
    } catch {
      // The server banner already says when it cannot be reached; keep what is on screen.
    }
  };

  const handleCreateOpportunity = async (payload: any) => {
    const created = await api.createOpportunity({
      company: payload.company || 'New company',
      title: payload.title || 'Opportunity to qualify',
      source: payload.source || 'Manually added',
      location: payload.location || 'Uttar Pradesh, India',
      fit: payload.fit || 'High',
      type: payload.type || 'Individual developer',
      hasVendorDocRequirements: !!payload.docs,
      vendorRequirementNotes: payload.vendorRequirementNotes,
      sourceUrl: payload.sourceUrl,
      evidenceSnippet: payload.evidenceSnippet,
    });
    if (created) {
      setOpportunities(prev => [created, ...prev.filter(x => x.id !== created.id)]);
      notify(`Opportunity ${created.id} saved to server`);
    } else {
      notify('Could not save the opportunity: the server did not answer. Nothing was added.');
    }
  };

  const handleStatusChange = async (item: Opportunity, newStatus: string, reason?: string) => {
    const updated = await api.updateOpportunityStatus(item.id, newStatus, reason);
    if (updated) {
      setOpportunities(prev => prev.map(o => o.id === item.id ? updated : o));
      setDetail(updated);
      notify(`Status transitioned to ${newStatus}`);
    } else {
      notify('Could not change the status: the server did not answer.');
    }
  };

  const handleArchive = async (item: Opportunity) => {
    await handleDeleteOpportunity(item.id);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete opportunity ${id}?`)) {
      await api.deleteOpportunity(id);
      setOpportunities(prev => prev.filter(o => o.id !== id));
      if (detail?.id === id) setDetail(null);
      notify(`Opportunity ${id} deleted`);
    }
  };

  const filteredOpportunities = useMemo(() => opportunities.filter(o => {
    const text = `${o.company} ${o.title} ${o.source} ${o.location} ${o.id}`.toLowerCase();
    const matchesSearch = !query || text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || o.status === statusFilter;
    const matchesSource = sourceFilter === 'All sources' || o.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  }), [opportunities, query, statusFilter, sourceFilter]);

  return {
    opportunities, setOpportunities, detail, setDetail, loadOpportunities,
    handleCreateOpportunity, handleStatusChange, handleArchive, handleDeleteOpportunity,
    filteredOpportunities,
  };
}

export type OpportunitiesState = ReturnType<typeof useOpportunities>;
