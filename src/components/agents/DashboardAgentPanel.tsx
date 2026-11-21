import '../../styles/agents.css';
import type { AppCtx } from '../../appContext';
import { useNow } from '../../hooks/useNow';
import { absoluteTime, relativeTime } from '../../utils/agentFormat';
import { ActivityEvent } from './ActivityEvent';

const LATEST = 6;
const NO_IDS = new Set<string>();

/** Compact "Live agent activity" panel for the dashboard: the latest events plus a link to the full page. */
export function DashboardAgentPanel({ ctx }: { ctx: AppCtx }) {
  const { agents, go } = ctx;
  const now = useNow();
  const overview = agents.agentsOverview;
  const latest = agents.agentEvents.slice(-LATEST);
  const running = overview?.runInProgress ?? false;

  return (
    <section className="ag-panel ag-dash" aria-label="Live agent activity">
      <div className="ag-panel-h">
        <h2>Live agent activity</h2>
        <button type="button" className="ag-link" onClick={() => go('Agents')}>Open Agents →</button>
      </div>
      <div className="ag-dash-body">
        {agents.agentsLoadState === 'loading' && !overview && (
          <div className="ag-skel" style={{ height: 120, marginTop: 10 }} aria-busy="true" />
        )}
        {agents.agentsLoadState === 'error' && !overview && (
          <div className="ag-state" role="alert">
            <p>Can't reach the agents service right now.</p>
            <button type="button" className="btn" onClick={agents.retryAgents}>Try again</button>
          </div>
        )}
        {overview && latest.length === 0 && (
          <div className="ag-state">
            <p>No agent activity yet. Agents run every 2 hours
              {overview.nextRunAtUtc ? `; next run ${relativeTime(overview.nextRunAtUtc, now)}.` : '.'}</p>
          </div>
        )}
        {overview && latest.map(event => (
          <ActivityEvent key={event.id} event={event} agents={overview.agents} now={now}
            knownOpportunityIds={NO_IDS} onOpenLead={() => undefined} compact />
        ))}
      </div>
      {overview && (
        <div className="ag-dash-foot">
          <span>{running ? 'A run is in progress' : overview.lastRun ? `Last run ${relativeTime(overview.lastRun.startedAtUtc, now)}` : 'No run yet'}</span>
          <span>{overview.nextRunAtUtc ? `Next: ${absoluteTime(overview.nextRunAtUtc)}` : 'No run scheduled'}</span>
        </div>
      )}
    </section>
  );
}
