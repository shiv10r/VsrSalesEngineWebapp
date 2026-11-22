import { useUiState } from './useUiState';
import { useOpportunities } from './useOpportunities';
import { useContacts } from './useContacts';
import { useCampaigns } from './useCampaigns';
import { useOutreach } from './useOutreach';
import { useSchedules } from './useSchedules';
import { useReliability } from './useReliability';
import { useDiscovery } from './useDiscovery';
import { useAppEffects } from './useAppEffects';
import { useAgents } from './useAgents';
import { useLocalLeads } from './useLocalLeads';

export function useBaseController() {
  const ui = useUiState();
  const opps = useOpportunities(ui);
  const people = useContacts(ui);
  const camp = useCampaigns(ui);
  const outreach = useOutreach(ui, people);
  const sched = useSchedules(ui);
  const rel = useReliability(ui);
  const disc = useDiscovery(ui, opps, people);
  useAppEffects(ui, opps, people, camp, outreach, sched, rel, disc);
  const agents = useAgents(ui);
  const localLeads = useLocalLeads(ui);

  return { ...ui, ...opps, ...people, ...camp, ...outreach, ...sched, ...rel, ...disc, agents, localLeads };
}

export type BaseCtx = ReturnType<typeof useBaseController>;
