import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services';
import type { HeatmapData, HeatmapWindow } from '../types/agents';

export type HeatmapLoadState = 'loading' | 'ready' | 'error';

const REFRESH_MS = 60_000; // the map changes slowly, so a calm refresh is enough

/**
 * Loads the lead heat map for the chosen window and refreshes it quietly while the tab is visible.
 * A failed background refresh keeps the last good data; only a failed first load shows the error state.
 */
export function useHeatmap(initialDays: HeatmapWindow = 28) {
  const [days, setDays] = useState<HeatmapWindow>(initialDays);
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loadState, setLoadState] = useState<HeatmapLoadState>('loading');
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const id = ++generation.current;
    const stale = () => id !== generation.current;
    setData(null);
    setLoadState('loading');

    const load = async (background: boolean) => {
      try {
        const next = await api.getHeatmap(days);
        if (stale()) return;
        setData(next);
        setLoadState('ready');
      } catch {
        if (stale() || background) return;
        setLoadState('error');
      }
    };

    void load(false);
    const timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void load(true);
    }, REFRESH_MS);
    return () => {
      generation.current++;
      clearInterval(timer);
    };
  }, [days, attempt]);

  const retry = useCallback(() => setAttempt(n => n + 1), []);
  return { days, setDays, data, loadState, retry };
}
