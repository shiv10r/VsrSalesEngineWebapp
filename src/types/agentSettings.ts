import type { AgentId } from './agents';

/** Shapes of GET/PUT /api/agents/settings (camelCase, exactly as the backend sends them). */

export interface AgentSetting {
  id: AgentId;
  name: string;
  defaultName: string;
  role: string;
  enabled: boolean;
  /** A required agent cannot be switched off. */
  required: boolean;
}

export interface KeywordSettings {
  target: string[];
  excluded: string[];
}

export interface ShiftSetting {
  scheduleId: string;
  name: string;
  enabled: boolean;
  intervalHours: number;
  sources: string[];
  activeFrom: string; // HH:mm
  activeTo: string; // HH:mm
  timezone: string;
}

export interface AgentSettings {
  agents: AgentSetting[];
  keywords: KeywordSettings;
  shifts: ShiftSetting[];
  availableSources: string[];
  updatedBy: string | null;
  updatedAtUtc: string | null;
}

/** The editable part, and the PUT body. */
export interface SettingsDraft {
  agents: { id: AgentId; name: string; enabled: boolean }[];
  keywords: KeywordSettings;
  shifts: {
    scheduleId: string;
    enabled: boolean;
    intervalHours: number;
    sources: string[];
    activeFrom: string;
    activeTo: string;
  }[];
}

export interface FieldError {
  field: string; // e.g. 'agents[2].name', 'shifts[0].intervalHours'
  message: string;
}

export type SaveSettingsResult =
  | { ok: true; settings: AgentSettings }
  | { ok: false; reason: 'validation'; errors: FieldError[]; message: string }
  | { ok: false; reason: 'forbidden' | 'error'; message: string };

export const INTERVAL_CHOICES = [1, 2, 3, 4, 6, 8, 12, 24] as const;
export const NAME_MAX = 24;
