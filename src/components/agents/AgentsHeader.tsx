import { Play } from 'lucide-react';
import type { AgentsOverview } from '../../types/agents';
import { absoluteTime, relativeTime, runNowDisabledReason } from '../../utils/agentFormat';
import { Button } from '../ui/Primitives';

interface Props {
  overview: AgentsOverview;
  now: number;
  guest: boolean;
  starting: boolean;
  onRun: () => void;
}

function TimeBlock({ label, iso, now }: { label: string; iso: string | null; now: number }) {
  return (
    <div>
      {label}
      <b>{iso ? `${relativeTime(iso, now)} · ${absoluteTime(iso)}` : 'Not scheduled'}</b>
    </div>
  );
}

export function AgentsHeader({ overview, now, guest, starting, onRun }: Props) {
  const { lastRun, nextRunAtUtc, runInProgress } = overview;
  const reason = runNowDisabledReason({ guest, runInProgress, starting });
  const stateText = runInProgress ? 'Running now' : lastRun ? `Last run ${lastRun.status}` : 'No run yet';

  return (
    <div className="ag-panel ag-top">
      <div className="ag-top-info">
        <div>
          Shift
          <b>{lastRun?.shiftName ?? '—'}</b>
        </div>
        <div>
          Status
          <b className="ag-run-state" aria-live="polite">
            {runInProgress && <i className="ag-dot working" style={{ position: 'static', border: 0 }} />}
            {stateText}
          </b>
        </div>
        <TimeBlock label="Last run" iso={lastRun?.startedAtUtc ?? null} now={now} />
        <TimeBlock label="Next run" iso={nextRunAtUtc} now={now} />
      </div>
      <div className="ag-top-actions">
        <Button variant="primary" icon={Play} disabled={reason !== null} onClick={onRun}>
          {starting ? 'Starting…' : 'Run agents now'}
        </Button>
        {reason && <span className="ag-reason">{reason}</span>}
      </div>
    </div>
  );
}
