import type { AgentRun } from '../../types/agents';
import { absoluteTime, relativeTime, runDuration } from '../../utils/agentFormat';

interface Props {
  runs: AgentRun[];
  selectedRunId: string | null;
  now: number;
  onSelect: (runId: string | null) => void;
}

export function RunHistory({ runs, selectedRunId, now, onSelect }: Props) {
  return (
    <section className="ag-panel" aria-label="Run history">
      <div className="ag-panel-h">
        <h2>Run history</h2>
        {selectedRunId && <button type="button" className="ag-link" onClick={() => onSelect(null)}>Show all runs</button>}
      </div>
      {runs.length === 0 ? (
        <div className="ag-state"><p>No runs recorded yet.</p></div>
      ) : (
        <ul className="ag-runs">
          {runs.map(run => (
            <li key={run.id}>
              <button type="button" className="ag-run" aria-pressed={selectedRunId === run.id}
                onClick={() => onSelect(selectedRunId === run.id ? null : run.id)}>
                <div className="ag-run-top">
                  <span>{run.shiftName}</span>
                  <span className={`ag-status ${run.status}`}>{run.status}</span>
                </div>
                <div className="ag-run-sub">
                  {relativeTime(run.startedAtUtc, now)} · {absoluteTime(run.startedAtUtc)} · {runDuration(run, now)} · {run.trigger}
                </div>
                {run.summary && <div className="ag-run-sub">{run.summary}</div>}
                <div className="ag-counts">
                  <div><b>{run.newLeads}</b>new</div>
                  <div><b>{run.duplicates}</b>dupes</div>
                  <div><b>{run.rejected}</b>rejected</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
