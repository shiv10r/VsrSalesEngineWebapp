import type { AgentSettingsState } from '../../../hooks/useAgentSettings';

export function ScoringSection({ s }: { s: AgentSettingsState }) {
  const value = s.draft!.draftThreshold;
  const error = s.errors['draftThreshold'];
  return (
    <section className="as-section" aria-labelledby="as-score-h">
      <h3 id="as-score-h">Scoring</h3>
      <label className="as-label" htmlFor="as-threshold">Draft threshold</label>
      <div className="as-threshold">
        <input
          type="range" min={0} max={100} step={1}
          aria-label="Draft threshold slider"
          value={Number.isFinite(value) ? value : 0}
          disabled={s.readOnly}
          onChange={e => s.setThreshold(Number(e.target.value))}
        />
        <input
          id="as-threshold"
          className="as-input as-num"
          type="number" min={0} max={100} step={1} inputMode="numeric"
          value={Number.isFinite(value) ? value : ''}
          disabled={s.readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'as-threshold-err' : 'as-threshold-help'}
          onChange={e => s.setThreshold(e.target.value === '' ? NaN : Number(e.target.value))}
        />
      </div>
      <p id="as-threshold-help" className="as-help">Leads scoring above this get a draft. Nothing is sent.</p>
      {error && <p id="as-threshold-err" className="as-error" role="alert">{error}</p>}
    </section>
  );
}
