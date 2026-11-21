import { absoluteTime, relativeTime } from '../../utils/agentFormat';

export function AgentsSkeleton() {
  return (
    <div className="ag-layout" aria-busy="true" aria-label="Loading agents">
      <div className="ag-col">
        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="ag-skel" style={{ height: 62 }} />)}
      </div>
      <div className="ag-col">
        {[0, 1, 2, 3].map(i => <div key={i} className="ag-skel" style={{ height: i === 1 ? 110 : 52 }} />)}
      </div>
      <div className="ag-col">
        {[0, 1, 2].map(i => <div key={i} className="ag-skel" style={{ height: 96 }} />)}
      </div>
    </div>
  );
}

export function AgentsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="ag-panel ag-state" role="alert">
      <h3>Can't reach the agents service</h3>
      <p>The backend didn't respond. Nothing is shown here until it does, so no numbers on this page are guesses.</p>
      <button type="button" className="btn primary" onClick={onRetry}>Try again</button>
    </div>
  );
}

export function AgentsEmptyFeed({ nextRunAtUtc, now }: { nextRunAtUtc: string | null; now: number }) {
  return (
    <div className="ag-state">
      <h3>No agent activity yet</h3>
      <p>
        Agents run every 2 hours and log what they find here.
        {nextRunAtUtc
          ? ` The next run is ${relativeTime(nextRunAtUtc, now)} (${absoluteTime(nextRunAtUtc)}).`
          : ' No run is scheduled right now.'}
      </p>
    </div>
  );
}
