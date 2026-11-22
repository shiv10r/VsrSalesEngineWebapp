import { useEffect } from 'react';
import { ChevronsLeft, ChevronsRight, CircleHelp, X } from 'lucide-react';
import '../../styles/sidebar.css';
import { navGroups } from '../../data/navigation';
import { LogoMark } from '../ui/Primitives';
import { initialsFrom, navBadge, sessionLabel } from './sidebarModel';

interface SidebarProps {
  page: string;
  go: (page: string) => void;
  opportunityCount: number;
  userEmail: string;
  guest: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
}

export function Sidebar(p: SidebarProps) {
  // Escape closes the phone drawer.
  useEffect(() => {
    if (!p.mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') p.onCloseMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p.mobileOpen, p.onCloseMobile]);

  const choose = (label: string) => {
    p.go(label);
    p.onCloseMobile();
  };

  return (
    <aside className={`sb ${p.mobileOpen ? 'sb-open' : ''}`} aria-label="Sidebar">
      <div className="sb-head">
        <button type="button" className="sb-brand" onClick={() => choose('Dashboard')} aria-label="VSR Sales Engine, go to Dashboard">
          <LogoMark />
          <span className="sb-brand-text"><strong>VSR Sales Engine</strong><small>Sales workspace</small></span>
        </button>
        <button type="button" className="sb-close" onClick={p.onCloseMobile} aria-label="Close menu"><X size={18} /></button>
      </div>

      <nav className="sb-nav" aria-label="Main">
        {navGroups.map((group) => (
          <div className="sb-group" key={group.title}>
            <div className="sb-group-title">{group.title}</div>
            {group.items.map(([label, Icon]: any) => {
              const badge = navBadge(label, { opportunities: p.opportunityCount });
              const active = p.page === label;
              return (
                <button
                  key={label}
                  type="button"
                  className={`sb-item ${active ? 'sb-active' : ''}`}
                  onClick={() => choose(label)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={label}
                  data-label={label}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="sb-item-label">{label}</span>
                  {badge && <span className="sb-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <button type="button" className="sb-item" onClick={p.onOpenHelp} aria-label="Help and quick guide" data-label="Help">
          <CircleHelp size={18} aria-hidden="true" />
          <span className="sb-item-label">Help &amp; quick guide</span>
        </button>
        <button type="button" className="sb-item sb-collapse" onClick={p.onToggleCollapsed}
          aria-label={p.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} data-label={p.collapsed ? 'Expand' : 'Collapse'}>
          {p.collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
          <span className="sb-item-label">Collapse</span>
        </button>
        <button type="button" className="sb-user" onClick={() => choose('Settings')} aria-label="Account and settings" data-label="Account">
          <span className="sb-avatar" aria-hidden="true">{initialsFrom(p.userEmail)}</span>
          <span className="sb-user-text">
            <strong>{p.userEmail || 'VSR Sales Team'}</strong>
            <small className={p.guest ? 'sb-guest' : ''}>{sessionLabel(p.guest)}</small>
          </span>
        </button>
      </div>
    </aside>
  );
}
