import type { AgentCardData } from '../../types/agents';
import { relativeTime } from '../../utils/agentFormat';
import { AgentAvatar } from './AgentAvatar';

const STATUS_TEXT = { working: 'Working', idle: 'Idle', waiting: 'Waiting', error: 'Error' } as const;

function AgentCard({ agent, now }: { agent: AgentCardData; now: number }) {
  const idleText = agent.lastActiveAtUtc ? `Last active ${relativeTime(agent.lastActiveAtUtc, now)}` : 'Not run yet';
  return (
    <li className="ag-card">
      <AgentAvatar id={agent.id} name={agent.name} status={agent.status} />
      <div>
        <div className="ag-card-name">{agent.name} <span className="ag-sr">({STATUS_TEXT[agent.status]})</span></div>
        <div className="ag-card-role">{agent.role}</div>
        <div className={`ag-card-task${agent.currentTask ? '' : ' idle'}`}>{agent.currentTask ?? idleText}</div>
        <div className="ag-card-meta">
          {agent.lifetime.itemsProcessed} processed · {agent.lifetime.eventsLogged} events logged
        </div>
      </div>
    </li>
  );
}

export function AgentRoster({ agents, now }: { agents: AgentCardData[]; now: number }) {
  const working = agents.filter(a => a.status === 'working').length;
  return (
    <section className="ag-panel" aria-label="Agent team">
      <div className="ag-panel-h"><h2>Agent team</h2><span>{working} working</span></div>
      <ul className="ag-roster">
        {agents.map(a => <AgentCard key={a.id} agent={a} now={now} />)}
      </ul>
    </section>
  );
}
