import { useMemo } from 'react';
import type { LocalLeadSummary } from '../../types/localLeads';
import { buildGrid, cellKey, cellLabel, gridStep } from '../../utils/localLeadsFormat';

interface Props {
  summary: LocalLeadSummary;
  categories: string[];
  selected: { district: string; category: string };
  onPick: (district: string, category: string) => void;
}

/** District rows x category columns. Plain CSS grid; the wrapper scrolls sideways on narrow screens. */
export function DistrictCategoryGrid({ summary, categories, selected, onPick }: Props) {
  const grid = useMemo(() => buildGrid(summary, categories), [summary, categories]);

  return (
    <section className="ag-panel ll-grid-card" aria-label="Leads by district and category">
      <div className="ag-panel-h">
        <h2>Where the leads are</h2>
        <span>Click a cell to filter the list below</span>
      </div>
      {grid.districts.length === 0 ? (
        <p className="ll-muted ll-pad">No leads yet, so there is nothing to map. Import a CSV or add a lead.</p>
      ) : (
        <div className="ll-scroll">
          <div
            className="ll-grid"
            style={{ gridTemplateColumns: `minmax(110px,150px) repeat(${grid.categories.length}, minmax(64px,1fr))` }}
          >
            <span aria-hidden="true" />
            {grid.categories.map(c => <span key={c} className="ll-col-h" title={c}>{c}</span>)}
            {grid.districts.map(d => (
              <div key={d} className="ll-grid-row">
                <span className="ll-row-h" title={d}>{d}</span>
                {grid.categories.map(c => {
                  const count = grid.counts[cellKey(d, c)] ?? 0;
                  const isSelected = selected.district === d && selected.category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`ll-cell s${gridStep(count, grid.max)}${isSelected ? ' sel' : ''}`}
                      disabled={count === 0}
                      aria-pressed={isSelected}
                      aria-label={cellLabel(d, c, count)}
                      title={cellLabel(d, c, count)}
                      onClick={() => onPick(d, c)}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
