import { useEffect } from 'react';
import type { UiState } from './useUiState';
import type { OpportunitiesState } from './useOpportunities';
import type { ContactsState } from './useContacts';
import type { CampaignsState } from './useCampaigns';
import type { OutreachState } from './useOutreach';
import type { SchedulesState } from './useSchedules';
import type { ReliabilityState } from './useReliability';
import type { DiscoveryState } from './useDiscovery';

export function useAppEffects(ui: UiState, opps: OpportunitiesState, people: ContactsState, camp: CampaignsState, outreach: OutreachState, sched: SchedulesState, rel: ReliabilityState, disc: DiscoveryState) {
  const { page, statusFilter, sourceFilter } = ui;
  const { loadOpportunities } = opps;
  const { loadContacts } = people;
  const { loadCampaigns } = camp;
  const { loadKillSwitch, loadSinkMessages, loadSuppressions } = outreach;
  const { loadSchedules } = sched;
  const { loadReliabilityData } = rel;
  const { loadSourcesAndProfiles } = disc;

  useEffect(() => {
    loadSourcesAndProfiles();
    loadKillSwitch();
    if (page === 'Outreach') {
      loadSinkMessages();
      loadSuppressions();
    }
    if (page === 'Campaigns') {
      loadCampaigns();
    }
    if (page === 'Schedules') {
      loadSchedules();
    }
    if (page === 'Activity log') {
      loadReliabilityData();
    }
    if (page === 'Settings') {
      loadKillSwitch();
    }
  }, [page]);

  useEffect(() => {
    loadContacts();
  }, [page]);

  useEffect(() => {
    loadOpportunities();
  }, [page, statusFilter, sourceFilter]);
}
