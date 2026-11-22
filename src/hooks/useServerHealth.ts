import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { browserPollerEnv, startHealthPolling } from '../utils/healthPoller';

export const HEALTH_POLL_MS = 60_000;

/** null while the first check is running, then true (server answered) or false (it did not). */
export type ServerHealth = boolean | null;

/** Asks GET /api/health now and every 60 seconds. Polling pauses while the tab is hidden. */
export function useServerHealth(pollMs: number = HEALTH_POLL_MS): ServerHealth {
  const [ok, setOk] = useState<ServerHealth>(null);

  useEffect(
    () => startHealthPolling(() => api.checkHealth(), setOk, pollMs, browserPollerEnv()),
    [pollMs],
  );

  return ok;
}
