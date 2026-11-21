import { useUiState } from './useUiState';
import { useOpportunities } from './useOpportunities';
import { useContacts } from './useContacts';
import { useCampaigns } from './useCampaigns';
import { useOutreach } from './useOutreach';
import { useSchedules } from './useSchedules';
import { useReliability } from './useReliability';
import { useDiscovery } from './useDiscovery';
import { useAppEffects } from './useAppEffects';

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

  return { ...ui, ...opps, ...people, ...camp, ...outreach, ...sched, ...rel, ...disc };
}

export type BaseCtx = ReturnType<typeof useBaseController>;
