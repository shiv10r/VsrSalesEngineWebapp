import type { AgentCardData, AgentEvent } from '../../types/agents';
import { absoluteTime, agentName, relativeTime } from '../../utils/agentFormat';
import { AgentAvatar } from './AgentAvatar';
import { LeadCard } from './LeadCard';

interface Props {
  event: AgentEvent;
  agents: AgentCardData[];
  now: number;
  knownOpportunityIds: Set<string>;
  onOpenLead: (opportunityId: string) => void;
  /** Dashboard variant: one line per event, leads shown as a short chip instead of a card. */
  compact?: boolean;
}

const KIND_LABEL: Record<AgentEvent['kind'], string> = {
  thought: 'thinking', action: 'action', result: 'result', handoff: 'handoff', warning: 'heads up',
};

export function ActivityEvent({ event, agents, now, knownOpportunityIds, onOpenLead, compact }: Props) {
  const name = agentName(event.agentId, agents);

  if (event.kind === 'handoff') {
    return (
      <div className="ag-handoff">
        <span><b>{name}</b> {event.message}</span>
      </div>
    );
  }

  const canOpen = !!event.lead?.opportunityId && knownOpportunityIds.has(event.lead.opportunityId);
  return (
    <div className={`ag-event ${event.kind}`}>
      <AgentAvatar id={event.agentId} name={name} small />
      <div className="ag-event-body">
        <div className="ag-event-head">
          <b>{name}</b>
          <span className="ag-kind">{KIND_LABEL[event.kind]}</span>
          <time dateTime={event.atUtc} title={absoluteTime(event.atUtc)}>{relativeTime(event.atUtc, now)}</time>
        </div>
        <div className="ag-body-box">
          <p className="ag-msg">{event.message}</p>
          {event.lead && !compact && <LeadCard lead={event.lead} canOpen={canOpen} onOpen={onOpenLead} />}
          {event.lead && compact && (
            <div className="ag-chips">
              <span className="ag-chip src">{event.lead.company}</span>
              {event.lead.score != null && <span className="ag-chip">score {event.lead.score}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
