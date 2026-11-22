export type AgentId =
  | 'scout' | 'filter' | 'dedupe' | 'scorer'
  | 'contact-finder' | 'reporter';

export type AgentStatus = 'working' | 'idle' | 'waiting' | 'error';
export type AgentEventKind = 'thought' | 'action' | 'result' | 'handoff' | 'warning';
export type AgentRunStatus = 'running' | 'completed' | 'failed' | 'skipped';

export interface AgentLifetime {
  itemsProcessed: number;
  eventsLogged: number;
}

export interface AgentCardData {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string | null;
  lastActiveAtUtc: string | null;
  lifetime: AgentLifetime;
}

export interface AgentRun {
  id: string;
  scheduleId: string;
  shiftName: string;
  trigger: string;
  startedAtUtc: string;
  finishedAtUtc: string | null;
  status: AgentRunStatus;
  summary: string | null;
  newLeads: number;
  duplicates: number;
  rejected: number;
}

export interface AgentLead {
  opportunityId: string | null;
  company: string;
  title: string;
  source: string;
  score: number | null;
  reasons: string[];
  url: string | null;
}

export interface AgentEvent {
  id: number;
  runId: string;
  atUtc: string;
  agentId: AgentId;
  kind: AgentEventKind;
  message: string;
  lead: AgentLead | null;
}

export interface AgentsOverview {
  agents: AgentCardData[];
  lastRun: AgentRun | null;
  nextRunAtUtc: string | null;
  runInProgress: boolean;
}

export interface AgentEventsQuery {
  afterId?: number;
  take?: number;
  runId?: string | null;
}

export type RunNowResult =
  | { ok: true; runId: string }
  | { ok: false; reason: 'running' | 'forbidden' | 'error'; message: string };

/** One non-zero (weekday, hour) bucket. dayOfWeek: 0 = Monday ... 6 = Sunday. hour is in `HeatmapData.timezone`. */
export interface HeatmapCell {
  dayOfWeek: number;
  hour: number;
  newLeads: number;
  runs: number;
}

/** Sparse: only non-zero cells are sent. */
export interface HeatmapData {
  days: number;
  timezone: string;
  cells: HeatmapCell[];
  totalNewLeads: number;
  totalRuns: number;
  firstRunAtUtc: string | null;
}

export type HeatmapWindow = 7 | 28 | 90;
