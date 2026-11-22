import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services';
import type { AgentSettings, SettingsDraft } from '../types/agentSettings';
import { errorsByField, isDirty, toDraft, validateDraft } from '../utils/agentSettingsForm';

export type SettingsLoadState = 'idle' | 'loading' | 'ready' | 'error';
type ShiftPatch = Partial<SettingsDraft['shifts'][number]>;

interface Options {
  open: boolean;
  guest: boolean;
  notify: (msg: string) => void;
  /** Called after a successful save so the roster and feed pick up new names straight away. */
  onSaved: () => void;
}

export function useAgentSettings({ open, guest, notify, onSaved }: Options) {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [loadState, setLoadState] = useState<SettingsLoadState>('idle');
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const s = await api.getAgentSettings();
      setSettings(s);
      setDraft(toDraft(s));
      setServerErrors({});
      setSaveMessage('');
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const edit = useCallback((change: (d: SettingsDraft) => SettingsDraft) => {
    setDraft(d => (d ? change(d) : d));
    setServerErrors({});
    setSaveMessage('');
  }, []);

  const setAgentName = (i: number, name: string) =>
    edit(d => ({ ...d, agents: d.agents.map((a, k) => (k === i ? { ...a, name } : a)) }));
  const setAgentEnabled = (i: number, enabled: boolean) =>
    edit(d => ({ ...d, agents: d.agents.map((a, k) => (k === i ? { ...a, enabled } : a)) }));
  const setKeywords = (kind: 'target' | 'excluded', list: string[]) =>
    edit(d => ({ ...d, keywords: { ...d.keywords, [kind]: list } }));
  const setShift = (i: number, patch: ShiftPatch) =>
    edit(d => ({ ...d, shifts: d.shifts.map((x, k) => (k === i ? { ...x, ...patch } : x)) }));

  const clientErrors = useMemo(() => (draft ? errorsByField(validateDraft(draft)) : {}), [draft]);
  const errors = useMemo(() => ({ ...clientErrors, ...serverErrors }), [clientErrors, serverErrors]);
  const dirty = isDirty(settings, draft);
  const canSave = !guest && dirty && !saving && Object.keys(clientErrors).length === 0;

  const save = useCallback(async () => {
    if (!draft || !canSave) return;
    setSaving(true);
    setSaveMessage('');
    const result = await api.saveAgentSettings(draft);
    setSaving(false);
    if (result.ok) {
      setSettings(result.settings);
      setDraft(toDraft(result.settings));
      setServerErrors({});
      notify('Agent settings saved.');
      onSaved();
      return;
    }
    // Keep the owner's edits so nothing has to be typed again.
    if (result.reason === 'validation') setServerErrors(errorsByField(result.errors));
    setSaveMessage(result.message);
    notify(result.message);
  }, [draft, canSave, notify, onSaved]);

  const discard = useCallback(() => {
    if (settings) setDraft(toDraft(settings));
    setServerErrors({});
    setSaveMessage('');
  }, [settings]);

  return {
    settings, draft, loadState, saving, errors, saveMessage, dirty, canSave, readOnly: guest,
    retry: load, save, discard, setAgentName, setAgentEnabled, setKeywords, setShift,
  };
}

export type AgentSettingsState = ReturnType<typeof useAgentSettings>;
