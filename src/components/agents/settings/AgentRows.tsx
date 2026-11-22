import { NAME_MAX } from '../../../types/agentSettings';
import type { AgentSettings } from '../../../types/agentSettings';
import type { AgentSettingsState } from '../../../hooks/useAgentSettings';
import { agentLockReason } from '../../../utils/agentSettingsForm';
import { AgentAvatar } from '../AgentAvatar';
import { Switch } from './Switch';

interface Props {
  settings: AgentSettings;
  s: AgentSettingsState;
}

export function AgentRows({ settings, s }: Props) {
  const draft = s.draft!;
  return (
    <section className="as-section" aria-labelledby="as-agents-h">
      <h3 id="as-agents-h">Agents</h3>
      <p className="as-help">Rename an agent or switch it off. The feed and roster use the names you set.</p>
      <ul className="as-list">
        {settings.agents.map((info, i) => {
          const row = draft.agents[i];
          const nameId = `as-name-${i}`;
          const errId = `${nameId}-err`;
          const lockId = `as-lock-${i}`;
          const error = s.errors[`agents[${i}].name`];
          const lock = agentLockReason(info);
          return (
            <li className="as-row" key={info.id}>
              <AgentAvatar id={info.id} name={row.name || info.defaultName} />
              <div className="as-row-main">
                <label className="as-label" htmlFor={nameId}>Name</label>
                <input
                  id={nameId}
                  className="as-input"
                  value={row.name}
                  maxLength={NAME_MAX}
                  placeholder={info.defaultName}
                  disabled={s.readOnly}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errId : undefined}
                  onChange={e => s.setAgentName(i, e.target.value)}
                />
                {!s.readOnly && row.name !== info.defaultName && (
                  <button type="button" className="as-link" onClick={() => s.setAgentName(i, info.defaultName)}>
                    Reset to default ({info.defaultName})
                  </button>
                )}
                <p className="as-role">{info.role}</p>
                {error && <p id={errId} className="as-error" role="alert">{error}</p>}
              </div>
              <div className="as-row-switch">
                <Switch
                  checked={row.enabled}
                  label={`${row.name || info.defaultName} is ${row.enabled ? 'on' : 'off'}`}
                  disabled={s.readOnly || lock !== null}
                  describedBy={lock ? lockId : undefined}
                  title={lock ?? undefined}
                  onChange={next => s.setAgentEnabled(i, next)}
                />
                {lock && <span id={lockId} className="as-lock">{lock}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
