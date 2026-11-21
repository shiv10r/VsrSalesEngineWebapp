import type { AgentSettingsState } from '../../../hooks/useAgentSettings';
import { absoluteTime } from '../../../utils/agentFormat';
import { lastChangedText } from '../../../utils/agentSettingsForm';

interface Props {
  s: AgentSettingsState;
  onCancel: () => void;
}

export function SettingsFooter({ s, onCancel }: Props) {
  const changed = s.settings ? lastChangedText(s.settings.updatedBy, s.settings.updatedAtUtc, iso => absoluteTime(iso)) : null;
  return (
    <footer className="as-footer">
      <p className="as-changed">{changed ?? 'No changes saved yet. Defaults are in use.'}</p>
      <div className="as-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>{s.readOnly ? 'Close' : 'Cancel'}</button>
        {!s.readOnly && (
          <button type="button" className="btn primary" disabled={!s.canSave} onClick={() => void s.save()}>
            {s.saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </div>
    </footer>
  );
}
