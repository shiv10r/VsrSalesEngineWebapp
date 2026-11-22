import type {
  AgentCardData, AgentEvent, AgentId, AgentRun,
} from '../types/agents';

const MAX_EVENTS = 500;

/** Static presentation only (colour per persona). Names and roles always come from the API. */
const AGENT_COLORS: Record<AgentId, string> = {
  scout: '#2768e9',
  filter: '#0e9aa7',
  dedupe: '#7959dc',
  scorer: '#d99126',
  'contact-finder': '#159e7e',
  reporter: '#5b6b86',
};

export function agentColor(id: string): string {
  return AGENT_COLORS[id as AgentId] ?? '#5b6b86';
}

export function titleCase(id: string): string {
  return id.split(/[-_\s]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export function agentName(id: string, agents: AgentCardData[]): string {
  return agents.find(a => a.id === id)?.name ?? titleCase(id);
}

export function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}

export function relativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'never';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 'unknown';
  const diffSec = Math.round((t - now) / 1000);
  const abs = Math.abs(diffSec);
  const unit = abs < 45 ? null
    : abs < 3600 ? [Math.round(abs / 60), 'min']
    : abs < 86400 ? [Math.round(abs / 3600), 'h']
    : [Math.round(abs / 86400), 'd'];
  if (!unit) return diffSec > 0 ? 'in a few seconds' : 'just now';
  return diffSec > 0 ? `in ${unit[0]} ${unit[1]}` : `${unit[0]} ${unit[1]} ago`;
}

export function absoluteTime(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone,
  });
}

export function runDuration(run: Pick<AgentRun, 'startedAtUtc' | 'finishedAtUtc'>, now: number = Date.now()): string {
  const start = Date.parse(run.startedAtUtc);
  if (Number.isNaN(start)) return '';
  const end = run.finishedAtUtc ? Date.parse(run.finishedAtUtc) : now;
  const sec = Math.max(0, Math.round((end - start) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m ${String(sec % 60).padStart(2, '0')}s`;
}

/** Merge newly polled events into the list: unique by id, ascending, capped to the newest MAX_EVENTS. */
export function mergeEvents(existing: AgentEvent[], incoming: AgentEvent[]): AgentEvent[] {
  if (incoming.length === 0) return existing;
  const byId = new Map<number, AgentEvent>();
  for (const e of existing) byId.set(e.id, e);
  for (const e of incoming) byId.set(e.id, e);
  const merged = Array.from(byId.values()).sort((a, b) => a.id - b.id);
  return merged.length > MAX_EVENTS ? merged.slice(merged.length - MAX_EVENTS) : merged;
}

export function lastEventId(events: AgentEvent[]): number {
  return events.length ? events[events.length - 1].id : 0;
}

export function filterByRun(events: AgentEvent[], runId: string | null): AgentEvent[] {
  return runId ? events.filter(e => e.runId === runId) : events;
}

export interface EventGroup {
  runId: string;
  events: AgentEvent[];
}

/** Group consecutive events by run so the feed can show a divider when a new run starts. */
export function groupByRun(events: AgentEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];
  for (const e of events) {
    const current = groups[groups.length - 1];
    if (current && current.runId === e.runId) current.events.push(e);
    else groups.push({ runId: e.runId, events: [e] });
  }
  return groups;
}

export type ScoreTone = 'high' | 'mid' | 'low' | 'none';

export function scoreTone(score: number | null | undefined): ScoreTone {
  if (score == null) return 'none';
  return score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';
}

/** Only http(s) links are ever rendered as hrefs. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export const FAST_POLL_MS = 2000;
export const SLOW_POLL_MS = 10000;

/** null means "do not poll" (tab hidden or page not showing agents). */
export function pollInterval(opts: { runInProgress: boolean; hidden: boolean; enabled: boolean }): number | null {
  if (!opts.enabled || opts.hidden) return null;
  return opts.runInProgress ? FAST_POLL_MS : SLOW_POLL_MS;
}

export function runNowDisabledReason(opts: { guest: boolean; runInProgress: boolean; starting: boolean }): string | null {
  if (opts.guest) return 'Guest accounts are read-only. Sign in with a full account to run agents.';
  if (opts.runInProgress) return 'A run is already in progress.';
  if (opts.starting) return 'Starting a run…';
  return null;
}

export function leadReasonsPreview(reasons: string[], max = 4): { shown: string[]; extra: number } {
  return { shown: reasons.slice(0, max), extra: Math.max(0, reasons.length - max) };
}
