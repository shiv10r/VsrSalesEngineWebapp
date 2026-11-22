import { useState } from 'react';
import { api } from '../services/api';
import { Campaign } from '../types';
import type { UiState } from './useUiState';

export function useCampaigns(ui: UiState) {
  const { notify } = ui;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [selectedGateCampaign, setSelectedGateCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data ?? []);
    } catch {
      // The server banner already says when it cannot be reached; keep what is on screen.
    }
  };

  const handleToggleCampaignStatus = async (c: Campaign) => {
    const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
    try {
      if (c.id) {
        const updated = await api.updateCampaignStatus(c.id, newStatus);
        if (updated) {
          setCampaigns(prev => prev.map(item => item.id === c.id ? { ...item, status: updated.status } : item));
          notify(`Campaign '${c.name}' is now ${newStatus}`);
          return;
        }
      }
      notify(`Could not change campaign '${c.name}': the server did not answer.`);
    } catch (ex: any) {
      notify(`Cannot activate campaign: ${ex.message}`);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete campaign ${id}?`)) {
      await api.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => (c.id || c.name) !== id));
      notify(`Campaign ${id} deleted`);
    }
  };

  return {
    campaigns, setCampaigns, selectedGateCampaign, setSelectedGateCampaign, loadCampaigns,
    handleToggleCampaignStatus, handleDeleteCampaign,
  };
}

export type CampaignsState = ReturnType<typeof useCampaigns>;
