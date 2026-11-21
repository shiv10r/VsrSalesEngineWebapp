import { useMemo } from 'react';
import type { HeatmapData } from '../../types/agents';
import {
  DAY_LABELS, HOURS, SHIFT_BANDS, buildMatrix, cellTitle, intensityStep, summaryLabel, tzAbbrev,
} from '../../utils/heatmapFormat';

/** 7 weekday rows x 24 hour columns. Pure CSS grid; the wrapper scrolls sideways on narrow screens. */
export function HeatmapGrid({ data }: { data: HeatmapData }) {
  const matrix = useMemo(() => buildMatrix(data.cells), [data.cells]);
  const tz = tzAbbrev(data.timezone);

  return (
    <div className="ag-hm-scroll">
      <div className="ag-hm-grid" role="img" aria-label={summaryLabel(data)}>
        <span className="ag-hm-corner" aria-hidden="true">{tz}</span>
        {SHIFT_BANDS.map(band => (
          <span
            key={`${band.label}-${band.start}`}
            className={`ag-hm-band ${band.label.split(' ')[0].toLowerCase()}`}
            style={{ gridColumn: `${band.start + 2} / ${band.end + 2}` }}
            aria-hidden="true"
          >
            {band.end - band.start >= 6 ? band.label : ''}
          </span>
        ))}
        <span className="ag-hm-corner" aria-hidden="true" />
        {HOURS.map(h => (
          <span key={h} className="ag-hm-hour" aria-hidden="true">{h % 3 === 0 ? String(h).padStart(2, '0') : ''}</span>
        ))}
        {DAY_LABELS.map((label, d) => (
          <div key={label} className="ag-hm-row" aria-hidden="true">
            <span className="ag-hm-day">{label}</span>
            {HOURS.map(h => (
              <i
                key={h}
                className={`ag-hm-cell s${intensityStep(matrix.leads[d][h], matrix.max)}`}
                title={cellTitle(d, h, matrix.leads[d][h], matrix.runs[d][h], data.timezone)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
