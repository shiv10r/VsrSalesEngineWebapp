import { useState } from 'react';
import { api } from '../services/api';
import { DiscoveryRunResult, SearchProfile, SourceDefinition } from '../types';
import type { UiState } from './useUiState';
import type { OpportunitiesState } from './useOpportunities';
import type { ContactsState } from './useContacts';

export function useDiscovery(ui: UiState, opps: OpportunitiesState, people: ContactsState) {
  const { notify, query, sourceFilters, go } = ui;
  const { loadOpportunities } = opps;
  const { loadContacts } = people;

  const [sources, setSources] = useState<SourceDefinition[]>([]);
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([]);
  const [lastRunResult, setLastRunResult] = useState<DiscoveryRunResult | null>(null);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);

  const loadSourcesAndProfiles = async () => {
    try {
      const [srcData, profData] = await Promise.all([
        api.getSources(),
        api.getSearchProfiles(),
      ]);
      setSources(srcData ?? []);
      setSearchProfiles(profData ?? []);
    } catch {
      // The server banner already says when it cannot be reached; keep what is on screen.
    }
  };

  const handleUpdateSourceStatus = async (id: string, newStatus: string) => {
    const updated = await api.updateSourceStatus(id, newStatus);
    if (updated) {
      setSources(prev => prev.map(s => s.id === id ? updated : s));
      notify(`Source ${updated.name} updated to ${newStatus}`);
    } else {
      notify('Could not change the source: the server did not answer.');
    }
  };

  const handleRunDiscovery = async () => {
    setIsRunningDiscovery(true);
    notify('Running discovery on the sources you selected...');
    try {
      const res = await api.runDiscovery({
        targetKeywords: query || 'Developer',
        location: 'Uttar Pradesh, India',
        selectedSources: sourceFilters,
        maxResults: 30,
      });
      if (res) {
        setLastRunResult(res);
        notify(res.summary || `Discovery complete: ${res.newMatchesCount} new opportunities.`);
        await loadOpportunities();
        await loadContacts();
        go('Opportunities');
      } else {
        notify('The server did not return a result.');
        await loadOpportunities();
        go('Opportunities');
      }
    } catch {
      notify('Failed to run live discovery.');
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  return {
    sources, setSources, searchProfiles, setSearchProfiles, lastRunResult, setLastRunResult,
    isRunningDiscovery, setIsRunningDiscovery, loadSourcesAndProfiles,
    handleUpdateSourceStatus, handleRunDiscovery,
  };
}

export type DiscoveryState = ReturnType<typeof useDiscovery>;
