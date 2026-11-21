import { API_BASE_URL, ApiCore } from './http';
import type {
  AgentEvent, AgentEventsQuery, AgentRun, AgentsOverview, HeatmapData, RunNowResult,
} from '../types/agents';
import type {
  AgentSettings, FieldError, SaveSettingsResult, SettingsDraft,
} from '../types/agentSettings';

function isFieldError(v: unknown): v is FieldError {
  return !!v && typeof (v as FieldError).field === 'string' && typeof (v as FieldError).message === 'string';
}

async function saveSettings(core: ApiCore, body: SettingsDraft): Promise<SaveSettingsResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/agents/settings`, {
      method: 'PUT',
      headers: core.getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, settings: (await res.json()) as AgentSettings };
    if (res.status === 400) {
      const data = await res.json().catch(() => ({}));
      const errors: FieldError[] = Array.isArray(data?.errors) ? data.errors.filter(isFieldError) : [];
      return {
        ok: false,
        reason: 'validation',
        errors,
        message: errors.length > 0 ? 'Some settings need fixing.' : String(data?.message ?? 'The settings were rejected.'),
      };
    }
    if (res.status === 403) {
      return { ok: false, reason: 'forbidden', message: "Guests can't change settings. Sign in to edit." };
    }
    return { ok: false, reason: 'error', message: `Could not save settings (server responded ${res.status}).` };
  } catch {
    return { ok: false, reason: 'error', message: 'Could not reach the agents service.' };
  }
}

export function buildEventsPath(query: AgentEventsQuery = {}): string {
  const params = new URLSearchParams();
  params.set('afterId', String(query.afterId ?? 0));
  params.set('take', String(query.take ?? 100));
  if (query.runId) params.set('runId', query.runId);
  return `/agents/events?${params.toString()}`;
}

export function buildHeatmapPath(days = 28): string {
  return `/agents/heatmap?days=${encodeURIComponent(String(days))}`;
}

/** Read calls throw on failure so the UI can show an honest "unreachable" state instead of empty data. */
async function getJson<T>(core: ApiCore, path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: core.getHeaders() });
  if (!res.ok) throw new Error(`Agents service responded ${res.status}`);
  return (await res.json()) as T;
}

export function createAgentsApi(core: ApiCore) {
  return {
    getAgentsOverview: (): Promise<AgentsOverview> =>
      getJson<AgentsOverview>(core, '/agents/overview'),

    getAgentRuns: (take = 20): Promise<AgentRun[]> =>
      getJson<AgentRun[]>(core, `/agents/runs?take=${encodeURIComponent(String(take))}`),

    getHeatmap: (days = 28): Promise<HeatmapData> =>
      getJson<HeatmapData>(core, buildHeatmapPath(days)),

    getAgentEvents: (query: AgentEventsQuery = {}): Promise<AgentEvent[]> =>
      getJson<AgentEvent[]>(core, buildEventsPath(query)),

    getAgentSettings: (): Promise<AgentSettings> =>
      getJson<AgentSettings>(core, '/agents/settings'),

    saveAgentSettings: (body: SettingsDraft): Promise<SaveSettingsResult> => saveSettings(core, body),

    async runAgentsNow(): Promise<RunNowResult> {
      try {
        const res = await fetch(`${API_BASE_URL}/agents/run-now`, {
          method: 'POST',
          headers: core.getHeaders(),
        });
        if (res.status === 202) {
          const body = await res.json().catch(() => ({}));
          return { ok: true, runId: String(body.runId ?? '') };
        }
        if (res.status === 409) {
          return { ok: false, reason: 'running', message: 'A run is already in progress.' };
        }
        if (res.status === 403) {
          return { ok: false, reason: 'forbidden', message: 'Guest accounts are read-only. Sign in with a full account to run agents.' };
        }
        return { ok: false, reason: 'error', message: `Could not start a run (server responded ${res.status}).` };
      } catch {
        return { ok: false, reason: 'error', message: 'Could not reach the agents service.' };
      }
    },
  };
}
