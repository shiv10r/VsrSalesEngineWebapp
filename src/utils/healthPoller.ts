export interface PollerEnv {
  isHidden: () => boolean;
  onVisibilityChange: (handler: () => void) => () => void;
  setInterval: (fn: () => void, ms: number) => unknown;
  clearInterval: (id: unknown) => void;
}

/**
 * Runs `check` now and then every `pollMs`, but not while the tab is hidden.
 * When the tab becomes visible again it checks immediately and resumes. Returns a stop function.
 */
export function startHealthPolling(
  check: () => Promise<boolean>,
  onResult: (ok: boolean) => void,
  pollMs: number,
  env: PollerEnv,
): () => void {
  let cancelled = false;
  let timer: unknown;
  let running = false;

  const run = async () => {
    const ok = await check();
    if (!cancelled) onResult(ok);
  };
  const stop = () => { if (running) { env.clearInterval(timer); running = false; } };
  const start = () => { stop(); timer = env.setInterval(run, pollMs); running = true; };

  const unsubscribe = env.onVisibilityChange(() => {
    if (env.isHidden()) stop();
    else { void run(); start(); }
  });

  void run();
  if (!env.isHidden()) start();

  return () => { cancelled = true; stop(); unsubscribe(); };
}

export function browserPollerEnv(): PollerEnv {
  return {
    isHidden: () => document.hidden,
    onVisibilityChange: handler => {
      document.addEventListener('visibilitychange', handler);
      return () => document.removeEventListener('visibilitychange', handler);
    },
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: id => window.clearInterval(id as number),
  };
}
