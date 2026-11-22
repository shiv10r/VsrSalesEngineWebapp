import { useEffect } from 'react';
import { api } from '../services/api';
import { SESSION_EXPIRED_MESSAGE } from '../services/http';
import { useUiState } from './useUiState';
import { useOpportunities } from './useOpportunities';
import { useContacts } from './useContacts';
import { useSchedules } from './useSchedules';
import { useDiscovery } from './useDiscovery';
import { useAppEffects } from './useAppEffects';
import { useAgents } from './useAgents';
import { useLocalLeads } from './useLocalLeads';

export function useBaseController() {
  const ui = useUiState();
  const { setPage, setSignInNotice } = ui;
  useEffect(() => {
    api.onSessionExpired(() => {
      setSignInNotice(SESSION_EXPIRED_MESSAGE);
      setPage('Sign in');
    });
  }, []);
  const opps = useOpportunities(ui);
  const people = useContacts(ui);
  const sched = useSchedules(ui);
  const disc = useDiscovery(ui, opps, people);
  useAppEffects(ui, opps, people, sched, disc);
  const agents = useAgents(ui);
  const localLeads = useLocalLeads(ui);

  return { ...ui, ...opps, ...people, ...sched, ...disc, agents, localLeads };
}

export type BaseCtx = ReturnType<typeof useBaseController>;
