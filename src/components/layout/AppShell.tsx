import {
  Activity, Bell, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Code2, Menu, Moon,
  MoreHorizontal, Search, Sun, X,
} from 'lucide-react';
import { ComplianceGateModal } from '../ComplianceGateModal';
import { DetailDrawer } from '../DetailDrawer';
import { DraftComposerModal } from '../DraftComposerModal';
import { Modal } from '../Modal';
import { PageRouter } from '../screens/PageRouter';
import { LogoMark, Pill } from '../ui/Primitives';
import { navGroups } from '../../data/navigation';
import { api } from '../../services/api';
import type { AppCtx } from '../../appContext';

export function AppShell({ ctx }: { ctx: AppCtx }) {
  const {
    dark, sidebarCollapsed, mobileNav, setSidebarCollapsed, go, setMobileNav, page, opportunities,
    guestMode, userEmail, setModal, globalSearch, setGlobalSearch, setQuery, setDark, modal,
    contacts, setOutreachRows, notify, setCampaigns, handleCreateContact, handleCreateOpportunity,
    handleCreateSchedule, detail, setDetail, handleStatusChange, handleArchive,
    selectedGateCampaign, setSelectedGateCampaign, toast, handleMarkLinkedInRequested,
  } = ctx;

  return (
    <div className={`app-shell ${dark ? 'dark' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand-row">
          <button
            className="hamburger-btn sidebar-hamburger"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle navigation sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="brand-mark-group" onClick={() => go('Dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <LogoMark />
            <div className="brand-name">VSR <b>Sales Engine</b><small>SALES WORKSPACE</small></div>
          </div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>
        <div className="workspace-select">
          <div className="workspace-avatar">VS</div>
          <div><strong>VSR Systems</strong><small>Sales team workspace</small></div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-list">
          {navGroups.map(group => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>
              {group.items.map(([label, Icon]: any) => (
                <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => go(label)}>
                  <Icon size={17} />
                  <span>{label}</span>
                  {label === 'Opportunities' && <span className="nav-count">{opportunities.length}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="guest-card">
            <div className="guest-top">
              <span><Code2 size={14} /> {guestMode ? 'Development guest' : 'Authenticated session'}</span>
              <Pill type="blue">{guestMode ? 'LOCAL GUEST' : 'JWT'}</Pill>
            </div>
            <p>{guestMode ? 'Login bypass is for development only. Production requires JWT authentication.' : `Active session: ${userEmail}`}</p>
            <button onClick={() => go('Settings')}>Guest-mode controls <ChevronRight size={14} /></button>
          </div>
          <button className="sidebar-help" onClick={() => setModal({ type: 'help' })}><CircleHelp size={16} /> Help & quick guide</button>
          <div className="side-user" onClick={() => go('Settings')}>
            <div className="user-avatar">VS</div>
            <div><strong>{userEmail || 'VSR Sales Team'}</strong><small>{guestMode ? 'Development session' : 'Authenticated'}</small></div>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>
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
        <div className="dev-banner" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <span><Activity size={14} style={{ color: '#10b981' }} /> <b style={{ color: '#10b981' }}>LIVE ENGINE CONNECTED</b> <span>.NET 10 LTS Web API • Live Ingestion Pipeline • Gemini 2.5 Flash active</span></span>
          <button onClick={() => go('Settings')}>Environment controls <ChevronRight size={14} /></button>
        </div>
        <div className="page-content"><PageRouter ctx={ctx} /></div>
        <footer className="footer">
          <span>© 2026 VSR Sales Engine</span>
          <span><i className="footer-dot" style={{ backgroundColor: '#10b981' }} /> Live Workspace Connected <span className="footer-sep">·</span> API v0.1.0</span>
        </footer>
      </main>
      {modal && modal.type === 'compose' ? (
        <DraftComposerModal
          isOpen={true}
          onClose={() => setModal(null)}
          contacts={contacts}
          opportunities={opportunities}
          prefillSubject={modal.prefill}
          initialCompany={modal.company}
          onSaveDraft={(draft) => {
            setOutreachRows(prev => [
              { company: draft.company, contact: draft.contact, subject: draft.subject, channel: 'Email', status: 'Draft ready', updated: 'Just now' },
              ...prev.filter(r => r.company !== draft.company || r.subject !== draft.subject)
            ]);
            notify(`Outreach draft for ${draft.company} approved & saved to queue.`);
            setModal(null);
          }}
          notify={notify}
        />
      ) : modal && (
        <Modal modal={modal} onClose={() => setModal(null)} onNotify={notify} onCreate={(m: any) => {
          if (m.type === 'campaign') {
            setCampaigns(prev => [{ name: m.name || 'New sales campaign', audience: m.audience || 'Custom audience', sent: 0, replies: 0, status: 'Draft', next: 'Not scheduled' }, ...prev]);
            notify('Campaign draft created');
          } else if (m.type === 'contact') {
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
      {selectedGateCampaign && (
        <ComplianceGateModal
          isOpen={!!selectedGateCampaign}
          onClose={() => setSelectedGateCampaign(null)}
          campaign={selectedGateCampaign}
          onUpdateMode={async (id, mode) => {
            const updated = await api.updateCampaignMode(id, mode);
            if (updated) {
              setCampaigns(prev => prev.map(c => c.id === id ? { ...c, mode: updated.mode } : c));
            }
          }}
          notify={notify}
        />
      )}
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}
