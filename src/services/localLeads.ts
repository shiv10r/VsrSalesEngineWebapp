import { API_BASE_URL, ApiCore } from './http';
import type {
  ImportResult, ImportRow, LocalLead, LocalLeadOptions, LocalLeadPage, LocalLeadPatch,
  LocalLeadQuery, LocalLeadSummary, NewLocalLead, WriteResult,
} from '../types/localLeads';

export const DEFAULT_PAGE_SIZE = 25;

export function buildLocalLeadsPath(query: LocalLeadQuery = {}): string {
  const params = new URLSearchParams();
  if (query.district) params.set('district', query.district);
  if (query.category) params.set('category', query.category);
  if (query.status) params.set('status', query.status);
  if (typeof query.hasWebsite === 'boolean') params.set('hasWebsite', String(query.hasWebsite));
  if (query.q && query.q.trim()) params.set('q', query.q.trim());
  params.set('page', String(query.page ?? 1));
  params.set('pageSize', String(query.pageSize ?? DEFAULT_PAGE_SIZE));
  return `/local-leads?${params.toString()}`;
}

/** Read calls throw on failure so the page can show an honest "unreachable" state. */
async function getJson<T>(core: ApiCore, path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: core.getHeaders() });
  if (!res.ok) throw new Error(`Local leads service responded ${res.status}`);
  return (await res.json()) as T;
}

/** Write calls never throw: the caller gets a typed reason it can show next to the control. */
async function send<T>(core: ApiCore, method: string, path: string, body?: unknown): Promise<WriteResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: core.getHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.ok) {
      if (res.status === 204) return { ok: true, value: undefined as T };
      return { ok: true, value: (await res.json()) as T };
    }
    if (res.status === 403) return { ok: false, reason: 'forbidden', message: "Guests can't change leads. Sign in to edit." };
    if (res.status === 404) return { ok: false, reason: 'notFound', message: 'That lead no longer exists.' };
    if (res.status === 400) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        reason: 'validation',
        message: String(data?.message ?? 'The server rejected that.'),
        errors: Array.isArray(data?.errors) ? data.errors : undefined,
      };
    }
    return { ok: false, reason: 'error', message: `The server responded ${res.status}.` };
  } catch {
    return { ok: false, reason: 'error', message: 'Could not reach the server.' };
  }
}

export function createLocalLeadsApi(core: ApiCore) {
  return {
    getLocalLeadOptions: (): Promise<LocalLeadOptions> => getJson(core, '/local-leads/options'),
    getLocalLeadSummary: (): Promise<LocalLeadSummary> => getJson(core, '/local-leads/summary'),
    getLocalLeads: (query: LocalLeadQuery = {}): Promise<LocalLeadPage> =>
      getJson(core, buildLocalLeadsPath(query)),

    createLocalLead: (body: NewLocalLead): Promise<WriteResult<LocalLead>> =>
      send<LocalLead>(core, 'POST', '/local-leads', body),
    updateLocalLead: (id: string, patch: LocalLeadPatch): Promise<WriteResult<LocalLead>> =>
      send<LocalLead>(core, 'PUT', `/local-leads/${encodeURIComponent(id)}`, patch),
    deleteLocalLead: (id: string): Promise<WriteResult<undefined>> =>
      send<undefined>(core, 'DELETE', `/local-leads/${encodeURIComponent(id)}`),
    importLocalLeads: (sourceLabel: string, rows: ImportRow[]): Promise<WriteResult<ImportResult>> =>
      send<ImportResult>(core, 'POST', '/local-leads/import', { sourceLabel, rows }),
  };
}
