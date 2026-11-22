import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services';
import type { AgentEvent, AgentRun, AgentsOverview } from '../types/agents';
import { filterByRun, lastEventId, mergeEvents, pollInterval } from '../utils/agentFormat';

const PAGE = 100;
const MAX_INITIAL_PAGES = 3;

export type AgentsLoadState = 'loading' | 'ready' | 'error';

interface UiLike {
  page: string;
  guestMode: boolean;
  notify: (msg: string) => void;
}

/**
 * Live agent data. Polls only while the Agents page or Dashboard is showing and the tab is visible:
 * every 2s during a run, every 10s otherwise. New events are fetched with afterId so nothing reloads.
 */
export function useAgents(ui: UiLike) {
  const enabled = ui.page === 'Agents' || ui.page === 'Dashboard' || ui.page === 'Activity log';
  const [overview, setOverview] = useState<AgentsOverview | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [loadState, setLoadState] = useState<AgentsLoadState>('loading');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const eventsRef = useRef<AgentEvent[]>([]);
  const selectedRef = useRef<string | null>(null);
  const runningRef = useRef(false);
  const lastRunIdRef = useRef<string | null>(null);
  const generation = useRef(0);

  eventsRef.current = events;
  selectedRef.current = selectedRunId;

  const fetchEventPages = useCallback(async (afterId: number, runId: string | null, maxPages: number) => {
    let cursor = afterId;
    let collected: AgentEvent[] = [];
    for (let i = 0; i < maxPages; i++) {
      const page = await api.getAgentEvents({ afterId: cursor, take: PAGE, runId });
      collected = collected.concat(page);
      if (page.length < PAGE) break;
      cursor = page[page.length - 1].id;
    }
    return collected;
  }, []);

  const refresh = useCallback(async (opts: { reset?: boolean } = {}) => {
    const gen = generation.current;
    try {
      const [ov, latestRuns] = await Promise.all([api.getAgentsOverview(), api.getAgentRuns(20)]);
      if (gen !== generation.current) return;
      const runId = selectedRef.current;
      const incoming = opts.reset
        ? await fetchEventPages(0, runId, MAX_INITIAL_PAGES)
        : await fetchEventPages(lastEventId(filterByRun(eventsRef.current, runId)), runId, 1);
      if (gen !== generation.current) return;
      setOverview(ov);
      setRuns(latestRuns);
      setEvents(prev => mergeEvents(opts.reset ? [] : prev, incoming));
      setLoadState('ready');
      runningRef.current = ov.runInProgress;
      lastRunIdRef.current = ov.lastRun?.id ?? null;
    } catch {
      if (gen === generation.current) setLoadState(prev => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, [fetchEventPages]);

  // Initial load, and reload whenever the user picks a different run.
  useEffect(() => {
    if (!enabled) return;
    generation.current += 1;
    if (eventsRef.current.length === 0) setLoadState('loading');
    void refresh({ reset: true });
  }, [enabled, selectedRunId, refresh]);

  // Polling loop.
  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    let stopped = false;

    const schedule = () => {
      const ms = pollInterval({ runInProgress: runningRef.current, hidden: document.hidden, enabled });
      if (ms == null || stopped) return;
      timer = window.setTimeout(async () => {
        await refresh();
        schedule();
      }, ms);
    };
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) void refresh().then(schedule);
    };

    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, refresh, loadState]);

  const runNow = useCallback(async () => {
    setStarting(true);
    const result = await api.runAgentsNow();
    setStarting(false);
    if (!result.ok) {
      ui.notify(result.message);
      if (result.reason === 'running') void refresh();
      return;
    }
    ui.notify('Agents started. Watch the activity feed.');
    runningRef.current = true;
    // Switching back to "all runs" reloads through the effect above; otherwise reload directly.
    if (selectedRef.current === null) void refresh({ reset: true });
    else setSelectedRunId(null);
  }, [refresh, ui]);

  const retry = useCallback(() => {
    generation.current += 1;
    setLoadState('loading');
    void refresh({ reset: true });
  }, [refresh]);

  return {
    agentsOverview: overview,
    agentRuns: runs,
    agentEvents: events,
    agentsLoadState: loadState,
    selectedRunId,
    selectAgentRun: setSelectedRunId,
    agentsStarting: starting,
    runAgentsNow: runNow,
    retryAgents: retry,
    reloadAgents: () => { void refresh({ reset: true }); },
    agentsGuest: ui.guestMode,
  };
}

export type AgentsState = ReturnType<typeof useAgents>;
