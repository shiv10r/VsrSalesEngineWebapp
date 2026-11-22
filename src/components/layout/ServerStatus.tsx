import { ChevronRight, CloudOff, Wifi } from 'lucide-react';
import type { ServerHealth } from '../../hooks/useServerHealth';

export function serverStatusText(ok: ServerHealth): string {
  if (ok === null) return 'Checking the server...';
  return ok ? 'Connected to the server' : "Can't reach the server";
}

/** The real connection status, driven by GET /api/health. */
export function ServerStatus({ ok, onSettings }: { ok: ServerHealth; onSettings: () => void }) {
  const tone = ok === false ? 'down' : ok ? 'up' : 'checking';
  const Icon = ok === false ? CloudOff : Wifi;
  return (
    <div className={`dev-banner server-status ${tone}`} role="status" data-testid="server-status">
      <span><Icon size={14} /> <b>{serverStatusText(ok)}</b></span>
      <button onClick={onSettings}>Settings <ChevronRight size={14} /></button>
    </div>
  );
}

export function ServerFootDot({ ok }: { ok: ServerHealth }) {
  return <span><i className={`footer-dot ${ok ? 'up' : ok === false ? 'down' : ''}`} /> {serverStatusText(ok)}</span>;
}
