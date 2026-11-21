import '../../styles/heatmap.css';
import type { HeatmapLoadState } from '../../hooks/useHeatmap';
import type { HeatmapData, HeatmapWindow } from '../../types/agents';
import { WINDOWS, caption, cellTitle, slotLabel, topSlots } from '../../utils/heatmapFormat';
import { HeatmapGrid } from './HeatmapGrid';

export interface LeadHeatmapViewProps {
  data: HeatmapData | null;
  loadState: HeatmapLoadState;
  days: HeatmapWindow;
  onDaysChange: (days: HeatmapWindow) => void;
  onRetry: () => void;
}

function Legend() {
  return (
    <div className="ag-hm-legend" aria-hidden="true">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map(s => <i key={s} className={`ag-hm-cell s${s}`} />)}
      <span>More</span>
    </div>
  );
}

/** Screen-reader alternative to the grid: the five busiest slots as a list. */
function TopSlotsList({ data }: { data: HeatmapData }) {
  const slots = topSlots(data.cells, 5);
  return (
    <ol className="ag-sr" aria-label="Busiest slots">
      {slots.map(s => (
        <li key={`${s.dayOfWeek}-${s.hour}`}>
          {cellTitle(s.dayOfWeek, s.hour, s.newLeads, s.runs, data.timezone)}
        </li>
      ))}
    </ol>
  );
}

export function LeadHeatmapView({ data, loadState, days, onDaysChange, onRetry }: LeadHeatmapViewProps) {
  const best = data ? topSlots(data.cells, 1)[0] : undefined;

  return (
    <section className="ag-panel ag-heat" aria-label="When leads arrive">
      <div className="ag-panel-h">
        <div>
          <h2>When leads arrive</h2>
          {data && data.cells.length > 0 && <p className="ag-hm-caption">{caption(data.totalNewLeads, data.days)}</p>}
        </div>
        <div className="ag-hm-window" role="group" aria-label="Time window">
          {WINDOWS.map(w => (
            <button key={w} type="button" className={w === days ? 'on' : ''} aria-pressed={w === days}
              onClick={() => onDaysChange(w)}>{w} days</button>
          ))}
        </div>
      </div>

      <div className="ag-hm-body">
        {loadState === 'loading' && <div className="ag-skel" style={{ height: 190 }} aria-busy="true" aria-label="Loading heat map" />}

        {loadState === 'error' && (
          <div className="ag-state" role="alert">
            <p>Can't reach the agents service, so the heat map can't be shown.</p>
            <button type="button" className="btn" onClick={onRetry}>Try again</button>
          </div>
        )}

        {loadState === 'ready' && data && data.cells.length === 0 && (
          <div className="ag-state">
            <p>No leads recorded yet. Agents run every 2 hours, so this fills in as they work.</p>
          </div>
        )}

        {loadState === 'ready' && data && data.cells.length > 0 && (
          <>
            <HeatmapGrid data={data} />
            <TopSlotsList data={data} />
            <div className="ag-hm-foot">
              <span>{best ? `Busiest: ${slotLabel(best.dayOfWeek, best.hour, data.timezone)} (${best.newLeads} new)` : ''}</span>
              <Legend />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
