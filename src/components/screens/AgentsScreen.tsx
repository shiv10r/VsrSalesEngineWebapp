import { useMemo } from 'react';
import '../../styles/agents.css';
import type { AppCtx } from '../../appContext';
import { useNow } from '../../hooks/useNow';
import { filterByRun } from '../../utils/agentFormat';
import { ActivityFeed } from '../agents/ActivityFeed';
import { AgentRoster } from '../agents/AgentRoster';
import { AgentsHeader } from '../agents/AgentsHeader';
import { AgentsEmptyFeed, AgentsErrorState, AgentsSkeleton } from '../agents/AgentStates';
import { RunHistory } from '../agents/RunHistory';

export function AgentsScreen({ ctx }: { ctx: AppCtx }) {
  const { pageHeading, opportunities, setDetail, agents } = ctx;
  const now = useNow();
  const knownIds = useMemo(() => new Set(opportunities.map(o => String(o.id))), [opportunities]);
  const events = useMemo(() => filterByRun(agents.agentEvents, agents.selectedRunId), [agents.agentEvents, agents.selectedRunId]);
  const overview = agents.agentsOverview;

  const openLead = (id: string) => {
    const opportunity = opportunities.find(o => String(o.id) === id);
    if (opportunity) setDetail(opportunity);
  };

  const heading = pageHeading(
    'Agents',
    'A team of specialist agents hunts, filters, scores and drafts for you. Watch their reasoning live.',
    null,
    'AUTOMATION',
  );

  if (agents.agentsLoadState === 'loading' && !overview) return <>{heading}<AgentsSkeleton /></>;
  if (!overview) return <>{heading}<AgentsErrorState onRetry={agents.retryAgents} /></>;

  const selectedRun = agents.agentRuns.find(r => r.id === agents.selectedRunId);

  return (
    <>
      {heading}
      <AgentsHeader overview={overview} now={now} guest={agents.agentsGuest}
        starting={agents.agentsStarting} onRun={agents.runAgentsNow} />
      <div className="ag-layout">
        <div className="ag-col"><AgentRoster agents={overview.agents} now={now} /></div>
        <div className="ag-col">
          <section className="ag-panel" aria-label="Live agent activity">
            <div className="ag-panel-h">
              <h2>Live activity</h2>
              <span>{selectedRun ? `Showing ${selectedRun.shiftName}` : `${events.length} events`}</span>
            </div>
            {events.length === 0
              ? <AgentsEmptyFeed nextRunAtUtc={overview.nextRunAtUtc} now={now} />
              : <ActivityFeed events={events} agents={overview.agents} runs={agents.agentRuns} now={now}
                  knownOpportunityIds={knownIds} onOpenLead={openLead} />}
          </section>
        </div>
        <div className="ag-col">
          <RunHistory runs={agents.agentRuns} selectedRunId={agents.selectedRunId} now={now}
            onSelect={agents.selectAgentRun} />
        </div>
      </div>
    </>
  );
}
