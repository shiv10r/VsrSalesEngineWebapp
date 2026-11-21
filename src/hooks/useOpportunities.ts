import { useMemo, useState } from 'react';
import { seedOpportunities } from '../data/seeds';
import { api } from '../services/api';
import { Opportunity } from '../types';
import type { UiState } from './useUiState';

export function useOpportunities(ui: UiState) {
  const { query, statusFilter, sourceFilter, notify, userEmail } = ui;

  const [opportunities, setOpportunities] = useState<Opportunity[]>(seedOpportunities);

  const [detail, setDetail] = useState<Opportunity | null>(null);

  const loadOpportunities = async () => {
    try {
      const data = await api.getOpportunities({
        query,
        status: statusFilter,
        source: sourceFilter,
      });
      if (data && data.length > 0) {
        setOpportunities(data);
      }
    } catch {
      // Fallback
    }
  };

  const handleCreateOpportunity = async (payload: any) => {
    const created = await api.createOpportunity({
      company: payload.company || 'New company',
      title: payload.title || 'Opportunity to qualify',
      source: payload.source || 'Company careers',
      location: payload.location || 'Remote · India',
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
      const fallback: Opportunity = {
        id: `OP-${1050 + opportunities.length}`,
        company: payload.company || 'New company',
        title: payload.title || 'Opportunity to qualify',
        source: payload.source || 'Manually added',
        location: payload.location || 'Remote · India',
        found: 'Just now',
        status: 'New',
        fit: payload.fit || 'High',
        type: payload.type || 'Individual developer',
        docs: !!payload.docs,
        sourceUrl: payload.sourceUrl,
        evidenceSnippet: payload.evidenceSnippet,
      };
      setOpportunities(prev => [fallback, ...prev]);
      notify('Opportunity added to review queue');
    }
  };

  const handleStatusChange = async (item: Opportunity, newStatus: string, reason?: string) => {
    const updated = await api.updateOpportunityStatus(item.id, newStatus, reason);
    if (updated) {
      setOpportunities(prev => prev.map(o => o.id === item.id ? updated : o));
      setDetail(updated);
      notify(`Status transitioned to ${newStatus}`);
    } else {
      const fallback: Opportunity = {
        ...item,
        status: newStatus,
        statusHistory: [
          ...(item.statusHistory || []),
          {
            fromStatus: item.status,
            toStatus: newStatus,
            changedBy: userEmail || 'Sales Member',
            reason: reason || 'Status transition in UI',
            changedAtUtc: new Date().toISOString(),
          }
        ]
      };
      setOpportunities(prev => prev.map(o => o.id === item.id ? fallback : o));
      setDetail(fallback);
      notify(`Status transitioned to ${newStatus} (local)`);
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
