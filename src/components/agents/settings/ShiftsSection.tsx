import { INTERVAL_CHOICES } from '../../../types/agentSettings';
import type { AgentSettings } from '../../../types/agentSettings';
import type { AgentSettingsState } from '../../../hooks/useAgentSettings';
import { Switch } from './Switch';

interface Props {
  settings: AgentSettings;
  s: AgentSettingsState;
}

export function ShiftsSection({ settings, s }: Props) {
  const draft = s.draft!;
  return (
    <section className="as-section" aria-labelledby="as-shifts-h">
      <h3 id="as-shifts-h">Shifts</h3>
      <p className="as-help">Each shift runs on its own schedule, inside its active window.</p>
      {settings.shifts.map((info, i) => {
        const x = draft.shifts[i];
        const err = (key: string) => s.errors[`shifts[${i}].${key}`];
        const intervals = (INTERVAL_CHOICES as readonly number[]).includes(x.intervalHours)
          ? [...INTERVAL_CHOICES]
          : [...INTERVAL_CHOICES, x.intervalHours].sort((a, b) => a - b);
        return (
          <fieldset className="as-shift" key={info.scheduleId} disabled={s.readOnly}>
            <legend>{info.name}</legend>
            <div className="as-shift-top">
              <span>{x.enabled ? 'On' : 'Off'}</span>
              <Switch checked={x.enabled} label={`${info.name} shift is ${x.enabled ? 'on' : 'off'}`}
                onChange={enabled => s.setShift(i, { enabled })} />
            </div>

            <div className="as-grid">
              <div>
                <label className="as-label" htmlFor={`as-int-${i}`}>Runs every</label>
                <select id={`as-int-${i}`} className="as-input" value={x.intervalHours}
                  aria-invalid={err('intervalHours') ? true : undefined}
                  aria-describedby={err('intervalHours') ? `as-int-${i}-err` : undefined}
                  onChange={e => s.setShift(i, { intervalHours: Number(e.target.value) })}>
                  {intervals.map(h => <option key={h} value={h}>{h === 1 ? '1 hour' : `${h} hours`}</option>)}
                </select>
                {err('intervalHours') && <p id={`as-int-${i}-err`} className="as-error" role="alert">{err('intervalHours')}</p>}
              </div>
              {(['activeFrom', 'activeTo'] as const).map(key => (
                <div key={key}>
                  <label className="as-label" htmlFor={`as-${key}-${i}`}>{key === 'activeFrom' ? 'Active from' : 'Active until'}</label>
                  <input id={`as-${key}-${i}`} className="as-input" type="time" value={x[key]}
                    aria-invalid={err(key) ? true : undefined}
                    aria-describedby={err(key) ? `as-${key}-${i}-err` : undefined}
                    onChange={e => s.setShift(i, { [key]: e.target.value })} />
                  {err(key) && <p id={`as-${key}-${i}-err`} className="as-error" role="alert">{err(key)}</p>}
                </div>
              ))}
            </div>
            <p className="as-help">Time zone: {info.timezone} (set by the server)</p>

            <fieldset className="as-sources" aria-describedby={err('sources') ? `as-src-${i}-err` : undefined}>
              <legend>Sources</legend>
              {settings.availableSources.map(src => (
                <label className="as-check" key={src}>
                  <input type="checkbox" checked={x.sources.includes(src)}
                    onChange={e => s.setShift(i, {
                      sources: e.target.checked ? [...x.sources, src] : x.sources.filter(v => v !== src),
                    })} />
                  <span>{src}</span>
                </label>
              ))}
            </fieldset>
            {err('sources') && <p id={`as-src-${i}-err`} className="as-error" role="alert">{err('sources')}</p>}
          </fieldset>
        );
      })}
    </section>
  );
}
