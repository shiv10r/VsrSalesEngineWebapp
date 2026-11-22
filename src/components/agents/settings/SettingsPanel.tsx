import { X } from 'lucide-react';
import { useRef } from 'react';
import '../../../styles/agent-settings.css';
import { useAgentSettings } from '../../../hooks/useAgentSettings';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { AgentRows } from './AgentRows';
import { KeywordsSection } from './KeywordsSection';
import { SettingsFooter } from './SettingsFooter';
import { ShiftsSection } from './ShiftsSection';

interface Props {
  guest: boolean;
  notify: (msg: string) => void;
  /** Reload the roster and feed after a save so new names show immediately. */
  onSaved: () => void;
  onClose: () => void;
}

export function SettingsPanel({ guest, notify, onSaved, onClose }: Props) {
  const s = useAgentSettings({ open: true, guest, notify, onSaved });
  const panel = useRef<HTMLElement>(null);

  const close = () => {
    if (s.dirty && !window.confirm('Discard your unsaved changes?')) return;
    onClose();
  };
  useFocusTrap(panel, true, close);

  const ready = s.loadState === 'ready' && s.settings !== null && s.draft !== null;

  return (
    <div className="drawer-backdrop as-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <aside ref={panel} className="detail-drawer as-panel" role="dialog" aria-modal="true" aria-labelledby="as-title" tabIndex={-1}>
        <div className="drawer-header">
          <div>
            <h2 id="as-title">Agent settings</h2>
            <p>Change how the agents work: names, which ones run, keywords and shifts.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close settings"><X size={18} /></button>
        </div>

        <div className="drawer-content as-body">
          {s.readOnly && <div className="as-banner" role="note">Guests can't change settings. Sign in to edit.</div>}

          {s.loadState === 'loading' && (
            <div className="as-skel" aria-busy="true" aria-label="Loading settings">
              {[0, 1, 2, 3, 4, 5].map(i => <span key={i} />)}
            </div>
          )}
          {s.loadState === 'error' && (
            <div className="as-state" role="alert">
              <p>Can't reach the agents service, so the settings could not be loaded.</p>
              <button type="button" className="btn secondary" onClick={() => void s.retry()}>Try again</button>
            </div>
          )}
          {ready && (
            <>
              <AgentRows settings={s.settings!} s={s} />
              <KeywordsSection s={s} />
              <ShiftsSection settings={s.settings!} s={s} />
            </>
          )}
          {s.saveMessage && <p className="as-error as-save-error" role="alert">{s.saveMessage}</p>}
        </div>

        {ready && <SettingsFooter s={s} onCancel={close} />}
      </aside>
    </div>
  );
}
