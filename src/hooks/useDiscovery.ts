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
      if (srcData && srcData.length > 0) setSources(srcData);
      if (profData && profData.length > 0) setSearchProfiles(profData);
    } catch {
      // Fallback
    }
  };

  const handleUpdateSourceStatus = async (id: string, newStatus: string) => {
    const updated = await api.updateSourceStatus(id, newStatus);
    if (updated) {
      setSources(prev => prev.map(s => s.id === id ? updated : s));
      notify(`Source ${updated.name} updated to ${newStatus}`);
    } else {
      setSources(prev => prev.map(s => s.id === id ? { ...s, policyStatus: newStatus } : s));
      notify(`Source policy updated to ${newStatus} (local)`);
    }
  };

  const handleRunDiscovery = async () => {
    setIsRunningDiscovery(true);
    notify('Querying live external contract feeds (Hacker News, WWR, Remotive, Jobicy)...');
    try {
      const res = await api.runDiscovery({
        targetKeywords: query || 'Developer',
        location: 'Worldwide Remote',
        selectedSources: sourceFilters,
        maxResults: 30,
      });
      if (res) {
        setLastRunResult(res);
        notify(`Live Discovery complete: ${res.newMatchesCount} real contract opportunities ingested!`);
        await loadOpportunities();
        await loadContacts();
        go('Opportunities');
      } else {
        notify('Live Discovery finished.');
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
