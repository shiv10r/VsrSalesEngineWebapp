import { useEffect, useRef, useState } from 'react';
import type { AgentCardData, AgentEvent, AgentRun } from '../../types/agents';
import { absoluteTime, agentName, groupByRun } from '../../utils/agentFormat';
import { ActivityEvent } from './ActivityEvent';
import { AgentAvatar } from './AgentAvatar';

interface Props {
  events: AgentEvent[];
  agents: AgentCardData[];
  runs: AgentRun[];
  now: number;
  knownOpportunityIds: Set<string>;
  onOpenLead: (opportunityId: string) => void;
}

const NEAR_BOTTOM_PX = 48;

function dividerLabel(runId: string, runs: AgentRun[]): string {
  const run = runs.find(r => r.id === runId);
  return run ? `${run.shiftName} · ${absoluteTime(run.startedAtUtc)}` : `Run ${runId}`;
}

export function ActivityFeed({ events, agents, runs, now, knownOpportunityIds, onOpenLead }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const previousCount = useRef(events.length);
  const [unseen, setUnseen] = useState(0);

  const scrollToBottom = () => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    const added = events.length - previousCount.current;
    previousCount.current = events.length;
    if (added < 0 || pinned.current) {
      pinned.current = true;
      setUnseen(0);
      scrollToBottom();
    } else if (added > 0) {
      setUnseen(count => count + added);
    }
  }, [events.length]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (pinned.current) setUnseen(0);
  };

  const jumpToLatest = () => {
    pinned.current = true;
    setUnseen(0);
    scrollToBottom();
  };

  const working = agents.filter(a => a.status === 'working');

  return (
    <div className="ag-feed-wrap">
      <div ref={scroller} className="ag-feed" role="log" aria-live="polite" aria-label="Agent activity" onScroll={onScroll} tabIndex={0}>
        {groupByRun(events).map(group => (
          <div key={group.runId}>
            <div className="ag-divider">{dividerLabel(group.runId, runs)}</div>
            {group.events.map(event => (
              <ActivityEvent key={event.id} event={event} agents={agents} now={now}
                knownOpportunityIds={knownOpportunityIds} onOpenLead={onOpenLead} />
            ))}
          </div>
        ))}
        {working.map(agent => (
          <div key={agent.id} className="ag-typing">
            <AgentAvatar id={agent.id} name={agentName(agent.id, agents)} status="working" small />
            <span><b>{agent.name}</b> is working{agent.currentTask ? `: ${agent.currentTask}` : '…'}</span>
            <span aria-hidden="true"><i /><i /><i /></span>
          </div>
        ))}
      </div>
      {unseen > 0 && (
        <button type="button" className="ag-jump" onClick={jumpToLatest}>
          ↓ Jump to latest ({unseen} new)
        </button>
      )}
    </div>
  );
}
