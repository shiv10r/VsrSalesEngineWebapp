import type { AgentSettings, FieldError, SettingsDraft } from '../types/agentSettings';
import { NAME_MAX } from '../types/agentSettings';

const NAME_PATTERN = /^[\p{L}][\p{L} '’-]*$/u;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** The editable copy of the server settings; it is also the PUT body. */
export function toDraft(s: AgentSettings): SettingsDraft {
  return {
    agents: s.agents.map(a => ({ id: a.id, name: a.name, enabled: a.enabled })),
    draftThreshold: s.draftThreshold,
    keywords: { target: [...s.keywords.target], excluded: [...s.keywords.excluded] },
    shifts: s.shifts.map(x => ({
      scheduleId: x.scheduleId,
      enabled: x.enabled,
      intervalHours: x.intervalHours,
      sources: [...x.sources],
      activeFrom: x.activeFrom,
      activeTo: x.activeTo,
    })),
  };
}

const normalised = (d: SettingsDraft): string =>
  JSON.stringify({
    ...d,
    agents: d.agents.map(a => ({ ...a, name: a.name.trim() })),
    shifts: d.shifts.map(x => ({ ...x, sources: [...x.sources].sort() })),
  });

/** True when the draft differs from what the server last returned. */
export function isDirty(original: AgentSettings | null, draft: SettingsDraft | null): boolean {
  if (!original || !draft) return false;
  return normalised(toDraft(original)) !== normalised(draft);
}

/** Why an agent's switch cannot be changed, or null when it can. */
export function agentLockReason(
  agent: { id: string; required: boolean },
  draftAgents: SettingsDraft['agents'],
): string | null {
  if (agent.required) return 'Required: the relay cannot run without this agent.';
  if (agent.id === 'compliance' && draftAgents.some(a => a.id === 'drafter' && a.enabled)) {
    return 'Needed while the Drafter is on, so every draft is checked.';
  }
  return null;
}

export function validateDraft(draft: SettingsDraft): FieldError[] {
  const errors: FieldError[] = [];

  const seen = new Map<string, number>();
  draft.agents.forEach((a, i) => {
    const name = a.name.trim();
    const field = `agents[${i}].name`;
    if (name.length === 0) errors.push({ field, message: 'Enter a name.' });
    else if (name.length > NAME_MAX) errors.push({ field, message: `Use ${NAME_MAX} characters or fewer.` });
    else if (!NAME_PATTERN.test(name)) errors.push({ field, message: 'Use letters, spaces, apostrophes and hyphens only.' });
    else if (seen.has(name.toLowerCase())) errors.push({ field, message: 'Another agent already uses this name.' });
    seen.set(name.toLowerCase(), i);
  });

  if (!Number.isInteger(draft.draftThreshold) || draft.draftThreshold < 0 || draft.draftThreshold > 100) {
    errors.push({ field: 'draftThreshold', message: 'Enter a whole number from 0 to 100.' });
  }

  draft.shifts.forEach((x, i) => {
    if (!Number.isInteger(x.intervalHours) || x.intervalHours < 1 || x.intervalHours > 24) {
      errors.push({ field: `shifts[${i}].intervalHours`, message: 'Choose 1 to 24 hours.' });
    }
    if (x.enabled && x.sources.length === 0) {
      errors.push({ field: `shifts[${i}].sources`, message: 'Pick at least one source for an enabled shift.' });
    }
    if (!TIME_PATTERN.test(x.activeFrom)) errors.push({ field: `shifts[${i}].activeFrom`, message: 'Use a time like 06:00.' });
    if (!TIME_PATTERN.test(x.activeTo)) errors.push({ field: `shifts[${i}].activeTo`, message: 'Use a time like 14:00.' });
  });

  return errors;
}

export function errorsByField(errors: FieldError[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of errors) if (!(e.field in map)) map[e.field] = e.message;
  return map;
}

/** Split "a, b" into trimmed, non-empty, case-insensitively unique tags added after `existing`. */
export function addTags(existing: string[], raw: string): string[] {
  const out = [...existing];
  const have = new Set(out.map(t => t.toLowerCase()));
  for (const part of raw.split(',')) {
    const tag = part.trim();
    if (tag && !have.has(tag.toLowerCase())) {
      have.add(tag.toLowerCase());
      out.push(tag);
    }
  }
  return out;
}

export function removeTag(list: string[], tag: string): string[] {
  return list.filter(t => t !== tag);
}

export function lastChangedText(updatedBy: string | null, updatedAtUtc: string | null, format: (iso: string) => string): string | null {
  if (!updatedAtUtc) return null;
  return `Last changed${updatedBy ? ` by ${updatedBy}` : ''} on ${format(updatedAtUtc)}`;
}
