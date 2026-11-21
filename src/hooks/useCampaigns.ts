import { useState } from 'react';
import { seedCampaigns } from '../data/seeds';
import { api } from '../services/api';
import { Campaign } from '../types';
import type { UiState } from './useUiState';

export function useCampaigns(ui: UiState) {
  const { notify } = ui;

  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);

  const [selectedGateCampaign, setSelectedGateCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      if (data && data.length > 0) {
        setCampaigns(data);
      }
    } catch {
      // Fallback
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
      setCampaigns(prev => prev.map(item => item.name === c.name ? { ...item, status: newStatus } : item));
      notify(`Campaign '${c.name}' is now ${newStatus} (local)`);
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
