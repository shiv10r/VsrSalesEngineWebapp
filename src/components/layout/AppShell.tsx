import {
  Bell, CheckCircle2, ChevronDown, ChevronRight, Menu, Moon, Search, Sun,
} from 'lucide-react';
import { DetailDrawer } from '../DetailDrawer';
import { Modal } from '../Modal';
import { PageRouter } from '../screens/PageRouter';
import { Sidebar } from './Sidebar';
import { ServerFootDot, ServerStatus } from './ServerStatus';
import { useServerHealth } from '../../hooks/useServerHealth';
import type { AppCtx } from '../../appContext';

export function AppShell({ ctx }: { ctx: AppCtx }) {
  const {
    dark, sidebarCollapsed, mobileNav, setSidebarCollapsed, go, setMobileNav, page, opportunities,
    guestMode, userEmail, setModal, globalSearch, setGlobalSearch, setQuery, setDark, modal,
    contacts, notify, handleCreateContact, handleCreateOpportunity,
    handleCreateSchedule, detail, setDetail, handleStatusChange, handleArchive,
    toast, handleMarkLinkedInRequested,
  } = ctx;

  const serverOk = useServerHealth();

  return (
    <div className={`app-shell ${dark ? 'dark' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        page={page}
        go={go}
        opportunityCount={opportunities.length}
        userEmail={userEmail}
        guest={guestMode}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
        onOpenHelp={() => setModal({ type: 'help' })}
      />
      {mobileNav && <div className="nav-scrim" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button
            className="hamburger-btn"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
            onClick={() => {
              if (window.innerWidth <= 1000) {
                setMobileNav(!mobileNav);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
          >
            <Menu size={18} />
          </button>
          <div className="breadcrumbs"><span>VSR Sales Engine</span><ChevronRight size={13} /><strong>{page}</strong></div>
          <div className="top-actions">
            <label className="global-search">
              <Search size={16} />
              <input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setQuery(globalSearch); go('Opportunities'); } }} placeholder="Search anything..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" title="Notifications" onClick={() => go('Activity log')}><Bell size={18} /><i className="notification-dot" /></button>
            <button className="icon-button" title="Toggle dark mode" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="top-divider" />
            <button className="profile-button" onClick={() => go('Settings')}>
              <div className="user-avatar">VS</div>
              <span><strong>{userEmail || 'VSR Sales Team'}</strong><small>{guestMode ? 'Guest Mode' : 'Sales Member'}</small></span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <ServerStatus ok={serverOk} onSettings={() => go('Settings')} />
        <div className="page-content"><PageRouter ctx={ctx} /></div>
        <footer className="footer">
          <span>© 2026 VSR Sales Engine</span>
          <ServerFootDot ok={serverOk} />
        </footer>
      </main>
      {modal && (
        <Modal modal={modal} onClose={() => setModal(null)} onCreate={(m: any) => {
          if (m.type === 'contact') {
            handleCreateContact(m);
          } else if (m.type === 'opportunity') {
            handleCreateOpportunity(m);
          } else if (m.type === 'schedule') {
            handleCreateSchedule(m);
          }
          setModal(null);
        }} />
      )}
      {detail && (
        <DetailDrawer
          item={detail}
          onClose={() => setDetail(null)}
          onNotify={notify}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
          contacts={contacts}
          guest={guestMode}
          onMarkLinkedIn={handleMarkLinkedInRequested}
        />
      )}
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}
