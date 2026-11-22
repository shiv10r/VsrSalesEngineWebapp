import { RunHistory } from '../agents/RunHistory';
import { useNow } from '../../hooks/useNow';
import type { AppCtx } from '../../appContext';

export function ActivityLogScreen({ ctx }: { ctx: AppCtx }) {
  const { pageHeading, go, agents } = ctx;
  const now = useNow();

  return (
    <>
      {pageHeading('Activity log', 'Every agent run recorded by the server. The step-by-step log of a run is on the Agents page.', null, 'AUDIT TRAIL')}
      {agents.agentsLoadState === 'error' && (
        <section className="panel panel-pad"><p className="muted-cell" style={{ margin: 0 }}>Could not load the run history from the server.</p></section>
      )}
      <RunHistory runs={agents.agentRuns} selectedRunId={null} now={now} onSelect={() => go('Agents')} />
    </>
  );
}
