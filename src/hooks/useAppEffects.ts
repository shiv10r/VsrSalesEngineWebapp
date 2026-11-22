import { useEffect } from 'react';
import type { UiState } from './useUiState';
import type { OpportunitiesState } from './useOpportunities';
import type { ContactsState } from './useContacts';
import type { SchedulesState } from './useSchedules';
import type { DiscoveryState } from './useDiscovery';

export function useAppEffects(ui: UiState, opps: OpportunitiesState, people: ContactsState, sched: SchedulesState, disc: DiscoveryState) {
  const { page, statusFilter, sourceFilter } = ui;
  const { loadOpportunities } = opps;
  const { loadContacts } = people;
  const { loadSchedules } = sched;
  const { loadSourcesAndProfiles } = disc;

  useEffect(() => {
    loadSourcesAndProfiles();
    if (page === 'Schedules') {
      loadSchedules();
    }
  }, [page]);

  useEffect(() => {
    loadContacts();
  }, [page]);

  useEffect(() => {
    loadOpportunities();
  }, [page, statusFilter, sourceFilter]);
}
