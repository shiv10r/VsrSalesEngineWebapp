import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Bookmark, BriefcaseBusiness,
  CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Download, FileCheck2, FileText,
  Filter, Globe2, Inbox, LayoutDashboard, Link2, ListChecks, LockKeyhole,
  LogOut, Mail, Menu, MessageSquareText, Moon, MoreHorizontal, Play, Plus,
  RefreshCw, Search, Send, Settings, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Users, Workflow, X, Zap, ChartNoAxesCombined,
  Building2, CheckCheck, Pencil, TriangleAlert, CalendarDays, Info, Sun, Server,
  KeyRound, Database, Code2
} from 'lucide-react';
import { SignIn } from './components/screens/SignIn';
import { DraftComposerModal } from './components/DraftComposerModal';
import { api } from './services/api';
import { Campaign, Contact, DiscoveryRunResult, Opportunity, OutreachRow, SearchProfile, SourceDefinition } from './types';

const navGroups = [
  { title: 'WORKSPACE', items: [
    ['Dashboard', LayoutDashboard], ['Opportunities', Target], ['Discover', Search],
    ['Outreach', Send], ['Campaigns', MessageSquareText], ['Contacts', Users]
  ]},
  { title: 'AUTOMATION', items: [
    ['Schedules', CalendarClock], ['Sources', Globe2], ['Activity log', Activity]
  ]},
  { title: 'INSIGHTS & CONTROL', items: [
    ['Reports', ChartNoAxesCombined], ['Vendor readiness', FileCheck2], ['Settings', Settings]
  ]}
];

const seedOpportunities: Opportunity[] = [
  { id:'OP-1048', company:'Northstar Digital', title:'Senior .NET / React Engineer', source:'Company careers', location:'Remote · India', found:'Today, 10:42 AM', status:'New', fit:'High', type:'Individual developer', docs:false, sourceUrl:'https://example.com/careers/northstar', evidenceSnippet:'Looking for full-stack engineer.' },
  { id:'OP-1047', company:'CloudHarbor Labs', title:'Contract API modernization partner', source:'Public job board', location:'Bengaluru, India', found:'Today, 9:18 AM', status:'Needs review', fit:'High', type:'Company/vendor', docs:true, sourceUrl:'https://example.com/jobs/cloudharbor', evidenceSnippet:'Partner needed for legacy modernizations.' },
  { id:'OP-1046', company:'BrightPath Health', title:'Healthcare platform engineering support', source:'Company website', location:'Remote · Global', found:'Yesterday', status:'Qualified', fit:'High', type:'Direct project', docs:false, sourceUrl:'https://example.com/careers/brightpath', evidenceSnippet:'Direct project for analytics.' },
  { id:'OP-1045', company:'Vertex Logistics', title:'Full-stack .NET developer contract', source:'Approved feed', location:'Gurugram, India', found:'Yesterday', status:'Contacted', fit:'Medium', type:'Individual developer', docs:false, sourceUrl:'https://example.com/feed/vertex', evidenceSnippet:'.NET contractor needed.' },
  { id:'OP-1044', company:'NimbusWorks', title:'Build internal operations portal', source:'Public procurement', location:'New Delhi, India', found:'Oct 16', status:'Readiness hold', fit:'Medium', type:'Company/vendor', docs:true, sourceUrl:'https://example.com/tenders/nimbus', evidenceSnippet:'Tender requires GST and compliance pack.' },
  { id:'OP-1043', company:'Asterloop Systems', title:'React frontend contractor', source:'Company careers', location:'Remote · India', found:'Oct 16', status:'Interested', fit:'High', type:'Individual developer', docs:false, sourceUrl:'https://example.com/careers/asterloop', evidenceSnippet:'Revamp client dashboard with React.' },
];

const seedContacts: Contact[] = [
  { id: 'CNT-1001', name: 'Maya Patel', company: 'Northstar Digital', role: 'Engineering Manager', email: 'maya.patel@example.com', source: 'Company website', sourceUrl: 'https://example.com/careers/northstar', channelBasis: 'ExplicitBusinessContact', status: 'Not contacted', qualificationStatus: 'Verified', isRoleAccount: false },
  { id: 'CNT-1002', name: 'Arjun Mehta', company: 'BrightPath Health', role: 'Talent Partner', email: 'arjun.mehta@example.com', source: 'Public profile', sourceUrl: 'https://example.com/team/brightpath', channelBasis: 'PublicDirectory', status: 'Replied', qualificationStatus: 'Qualified', isRoleAccount: false },
  { id: 'CNT-1003', name: 'Sarah Johnson', company: 'Vertex Logistics', role: 'Technology Director', email: 'sarah.johnson@example.com', source: 'Direct', sourceUrl: 'https://example.com/contact/vertex', channelBasis: 'ExplicitBusinessContact', status: 'Follow-up due', qualificationStatus: 'Verified', isRoleAccount: false },
  { id: 'CNT-1004', name: 'Daniel Kim', company: 'NimbusWorks', role: 'Procurement Lead', email: 'daniel.kim@example.com', source: 'Tender portal', sourceUrl: 'https://example.com/tenders/nimbus', channelBasis: 'PublicDirectory', status: 'Do not contact', qualificationStatus: 'OptedOut', isRoleAccount: false },
];

const seedCampaigns: Campaign[] = [
  {name:'Healthcare engineering leads', audience:'Healthcare · India + global', sent:42, replies:9, status:'Active', next:'Today, 2:30 PM'},
  {name:'.NET modernization opportunities', audience:'.NET · Cloud · Engineering', sent:86, replies:13, status:'Paused', next:'Paused by owner'},
  {name:'Warm lead follow-up', audience:'Previously engaged contacts', sent:19, replies:7, status:'Completed', next:'Complete'},
];

const seedActivities = [
  {icon:Search,color:'blue',title:'Discovery run completed',detail:'Public job boards · 18 results found · 4 new matches',time:'10:42 AM',state:'success'},
  {icon:Mail,color:'green',title:'Outreach draft created',detail:'Northstar Digital · Senior .NET / React Engineer',time:'10:31 AM',state:'review'},
  {icon:CalendarClock,color:'violet',title:'Scheduled run skipped',detail:'Company careers scan · source rate limit reached',time:'9:00 AM',state:'warning'},
  {icon:Users,color:'blue',title:'Contact updated',detail:'Maya Patel · email status verified from public source',time:'Yesterday',state:'success'},
  {icon:ShieldAlert,color:'amber',title:'Readiness requirement detected',detail:'CloudHarbor Labs · supplier registration requested',time:'Yesterday',state:'review'},
];

function LogoMark({small=false}:{small?:boolean}) { return <div className={`brand-mark ${small?'small':''}`}><span>V</span></div>; }
function Button({children, variant='secondary', icon:Icon, onClick, disabled=false, small=false, className=''}:any) { return <button className={`btn ${variant} ${small?'sm':''} ${className}`} onClick={onClick} disabled={disabled}>{Icon && <Icon size={small?14:16}/>}<span>{children}</span></button>; }
function Pill({children, type='neutral', dot=false}:any) { return <span className={`pill ${type}`}>{dot && <i/>}{children}</span>; }
function Toggle({checked, onChange, label}:any) { return <button aria-label={label || 'Toggle'} className={`toggle ${checked?'on':''}`} onClick={()=>onChange(!checked)}><span/></button>; }
function EmptyHint({title, description, icon:Icon=Inbox, action, onAction}:any) { return <div className="empty-hint"><div className="empty-icon"><Icon size={22}/></div><h3>{title}</h3><p>{description}</p>{action && <Button variant="primary" onClick={onAction}>{action}</Button>}</div>; }

export function App() {
  const [page, setPage] = useState('Sign in');
  const [guestMode, setGuestMode] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sourceFilters, setSourceFilters] = useState<string[]>(['Company careers','Public job boards','Approved feeds','Public procurement']);
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sourceFilter, setSourceFilter] = useState('All sources');
  const [activeTab, setActiveTab] = useState('Recent opportunities');
  const [modal, setModal] = useState<any>(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [scheduled, setScheduled] = useState<Record<string, boolean>>({daily:true,weekly:false,followup:true});
  const [connected, setConnected] = useState<Record<string, boolean>>({'Company careers':true,'Public job boards':true,'Direct company research':true,'LinkedIn handoff':false,'Public procurement':true,'Approved APIs':false});
  const [outreachRows, setOutreachRows] = useState<OutreachRow[]>([
    {company:'Northstar Digital',contact:'Maya Patel',subject:'Engineering support for your .NET team',channel:'Email',status:'Draft ready',updated:'Today, 10:31 AM'},
    {company:'BrightPath Health',contact:'Arjun Mehta',subject:'Healthcare platform delivery capacity',channel:'Email',status:'Replied',updated:'Yesterday'},
    {company:'Vertex Logistics',contact:'Sarah Johnson',subject:'Follow-up: full-stack engineering support',channel:'Email',status:'Follow-up due',updated:'Yesterday'},
    {company:'Asterloop Systems',contact:'Unassigned',subject:'React frontend contractor opportunity',channel:'Manual handoff',status:'Needs contact',updated:'Oct 16'},
  ]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(seedOpportunities);
  const [contacts, setContacts] = useState<Contact[]>(seedContacts);
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [settingsTab, setSettingsTab] = useState('General');
  const [dark, setDark] = useState(false);
  const [sources, setSources] = useState<SourceDefinition[]>([]);
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([]);
  const [lastRunResult, setLastRunResult] = useState<DiscoveryRunResult | null>(null);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);

  const loadSourcesAndProfiles = async () => {
    try {
      const [srcData, profData] = await Promise.all([
        api.getSources(),
        api.getSearchProfiles(),
      ]);
      if (srcData && srcData.length > 0) setSources(srcData);
      if (profData && profData.length > 0) setSearchProfiles(profData);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadSourcesAndProfiles();
  }, [page]);

  const handleUpdateSourceStatus = async (id: string, newStatus: string) => {
    const updated = await api.updateSourceStatus(id, newStatus);
    if (updated) {
      setSources(prev => prev.map(s => s.id === id ? updated : s));
      notify(`Source ${updated.name} updated to ${newStatus}`);
    } else {
      setSources(prev => prev.map(s => s.id === id ? { ...s, policyStatus: newStatus } : s));
      notify(`Source policy updated to ${newStatus} (local)`);
    }
  };

  const handleRunDiscovery = async () => {
    setIsRunningDiscovery(true);
    notify('Starting opportunity discovery run across selected sources...');
    try {
      const res = await api.runDiscovery({
        targetKeywords: query || '.NET Developer',
        location: 'Remote · India',
        selectedSources: sourceFilters,
        maxResults: 30,
      });
      if (res) {
        setLastRunResult(res);
        notify(`Discovery complete: ${res.newMatchesCount} new match(es), ${res.duplicateCount} duplicate(s) evaluated.`);
        await loadOpportunities();
        go('Search results');
      } else {
        notify('Discovery finished in preview mode.');
        go('Search results');
      }
    } catch {
      notify('Failed to run discovery.');
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  const loadOpportunities = async () => {
    try {
      const data = await api.getOpportunities({
        query,
        status: statusFilter,
        source: sourceFilter,
      });
      if (data && data.length > 0) {
        setOpportunities(data);
      }
    } catch {
      // Fallback
    }
  };

  const loadContacts = async () => {
    try {
      const data = await api.getContacts();
      if (data && data.length > 0) {
        setContacts(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadContacts();
  }, [page]);

  const handleCreateContact = async (payload: any) => {
    const created = await api.createContact({
      name: payload.name,
      company: payload.company,
      role: payload.role,
      email: payload.email,
      source: payload.source || 'Manual entry',
      sourceUrl: payload.sourceUrl,
      channelBasis: payload.channelBasis || 'ExplicitBusinessContact',
      notes: payload.notes,
    });
    if (created) {
      setContacts(prev => [created, ...prev.filter(c => c.id !== created.id)]);
      notify(`Contact ${created.name} added`);
    } else {
      const fallback: Contact = {
        id: `CNT-${1000 + contacts.length + 1}`,
        name: payload.name || 'New contact',
        company: payload.company || 'Unassigned',
        role: payload.role || 'Unspecified',
        email: payload.email || 'contact@example.com',
        source: payload.source || 'Manual entry',
        sourceUrl: payload.sourceUrl,
        channelBasis: payload.channelBasis || 'ExplicitBusinessContact',
        status: 'Not contacted',
        qualificationStatus: 'Unverified',
        isRoleAccount: false,
        notes: payload.notes,
      };
      setContacts(prev => [fallback, ...prev]);
      notify('Contact added (local)');
    }
  };

  const handleQualifyContact = async (id: string, qualificationStatus: string, status?: string, notes?: string) => {
    const updated = await api.qualifyContact(id, qualificationStatus, status, notes);
    if (updated) {
      setContacts(prev => prev.map(c => c.id === id ? updated : c));
      notify(`Contact ${updated.name} updated to ${qualificationStatus}`);
    } else {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, qualificationStatus, status: status || c.status } : c));
      notify(`Contact qualification updated (local)`);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [page, statusFilter, sourceFilter]);

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout((window as any).__vsrToastTimer);
    (window as any).__vsrToastTimer = window.setTimeout(() => setToast(''), 3000);
  };

  const handleCreateOpportunity = async (payload: any) => {
    const created = await api.createOpportunity({
      company: payload.company || 'New company',
      title: payload.title || 'Opportunity to qualify',
      source: payload.source || 'Company careers',
      location: payload.location || 'Remote · India',
      fit: payload.fit || 'High',
      type: payload.type || 'Individual developer',
      hasVendorDocRequirements: !!payload.docs,
      vendorRequirementNotes: payload.vendorRequirementNotes,
      sourceUrl: payload.sourceUrl,
      evidenceSnippet: payload.evidenceSnippet,
    });
    if (created) {
      setOpportunities(prev => [created, ...prev.filter(x => x.id !== created.id)]);
      notify(`Opportunity ${created.id} saved to server`);
    } else {
      const fallback: Opportunity = {
        id: `OP-${1050 + opportunities.length}`,
        company: payload.company || 'New company',
        title: payload.title || 'Opportunity to qualify',
        source: payload.source || 'Manually added',
        location: payload.location || 'Remote · India',
        found: 'Just now',
        status: 'New',
        fit: payload.fit || 'High',
        type: payload.type || 'Individual developer',
        docs: !!payload.docs,
        sourceUrl: payload.sourceUrl,
        evidenceSnippet: payload.evidenceSnippet,
      };
      setOpportunities(prev => [fallback, ...prev]);
      notify('Opportunity added to review queue');
    }
  };

  const handleStatusChange = async (item: Opportunity, newStatus: string, reason?: string) => {
    const updated = await api.updateOpportunityStatus(item.id, newStatus, reason);
    if (updated) {
      setOpportunities(prev => prev.map(o => o.id === item.id ? updated : o));
      setDetail(updated);
      notify(`Status transitioned to ${newStatus}`);
    } else {
      const fallback: Opportunity = {
        ...item,
        status: newStatus,
        statusHistory: [
          ...(item.statusHistory || []),
          {
            fromStatus: item.status,
            toStatus: newStatus,
            changedBy: userEmail || 'Sales Member',
            reason: reason || 'Status transition in UI',
            changedAtUtc: new Date().toISOString(),
          }
        ]
      };
      setOpportunities(prev => prev.map(o => o.id === item.id ? fallback : o));
      setDetail(fallback);
      notify(`Status transitioned to ${newStatus} (local)`);
    }
  };

  const handleArchive = async (item: Opportunity) => {
    await api.archiveOpportunity(item.id);
    setOpportunities(prev => prev.filter(o => o.id !== item.id));
    setDetail(null);
    notify(`Opportunity ${item.id} archived`);
  };

  const go = (next: string) => { setPage(next); setMobileNav(false); setGlobalSearch(''); };

  const filteredOpportunities = useMemo(() => opportunities.filter(o => {
    const text = `${o.company} ${o.title} ${o.source} ${o.location} ${o.id}`.toLowerCase();
    const matchesSearch = !query || text.includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All statuses' || o.status === statusFilter;
    const matchesSource = sourceFilter === 'All sources' || o.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  }), [opportunities, query, statusFilter, sourceFilter]);

  if (page === 'Sign in') {
    return (
      <SignIn
        onSuccess={(email, isGuest) => {
          setUserEmail(email);
          setGuestMode(isGuest);
          go('Dashboard');
        }}
        onNotify={notify}
      />
    );
  }

  return (
    <div className={`app-shell ${dark ? 'dark' : ''}`}>
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand-row" onClick={() => go('Dashboard')}>
          <LogoMark />
          <div className="brand-name">VSR <b>Sales Engine</b><small>SALES WORKSPACE</small></div>
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
          <button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
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
        <div className="dev-banner">
          <span><Code2 size={14} /> <b>DEVELOPMENT PREVIEW</b> <span>Illustrative sample data · No live sources connected · No messages sent</span></span>
          <button onClick={() => go('Settings')}>View environment controls <ChevronRight size={14} /></button>
        </div>
        <div className="page-content">{renderPage()}</div>
        <footer className="footer">
          <span>© 2026 VSR Sales Engine</span>
          <span><i className="footer-dot" /> Prototype workspace <span className="footer-sep">·</span> Data is illustrative</span>
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
        />
      )}
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );

  function pageHeading(title: string, subtitle: string, actions: any = null, eyebrow: any = null) {
    return (
      <div className="page-heading">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="heading-actions">{actions}</div>
      </div>
    );
  }

  function kpi(title: string, value: string, change: string, Icon: any, tone: string = 'blue', note: string = 'vs. previous 7 days') {
    return (
      <div className="kpi-card" key={title}>
        <div className={`kpi-icon ${tone}`}><Icon size={18} /></div>
        <div className="kpi-content">
          <div className="kpi-title">{title}</div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-foot">
            <span className={change.startsWith('+') ? 'positive' : 'muted'}>{change.startsWith('+') && <ArrowUpRight size={13} />} {change}</span>
            <span>{note}</span>
          </div>
        </div>
        <MoreHorizontal size={17} className="kpi-more" />
      </div>
    );
  }

  function tableControls(showSource: boolean = true) {
    return (
      <div className="table-controls">
        <label className="table-search">
          <Search size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records..." />
        </label>
        <div className="control-right">
          <div className="select-wrap">
            <Filter size={14} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All statuses</option>
              {['New', 'Needs review', 'Qualified', 'Contacted', 'Readiness hold', 'Interested'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {showSource && (
            <div className="select-wrap">
              <SlidersHorizontal size={14} />
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                <option>All sources</option>
                {Array.from(new Set(opportunities.map(o => o.source))).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <Button small onClick={() => { setQuery(''); setStatusFilter('All statuses'); setSourceFilter('All sources'); }}>Reset</Button>
        </div>
      </div>
    );
  }

  function opportunitiesTable(rows: Opportunity[] = filteredOpportunities, compact: boolean = false) {
    return (
      <div className={`table-wrap ${compact ? 'compact' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>COMPANY / OPPORTUNITY</th>
              <th>SOURCE</th>
              <th>LOCATION</th>
              <th>FIT</th>
              <th>STATUS</th>
              <th>FOUND</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td>
                  <div className="company-cell">
                    <div className={`company-logo logo-${o.company.length % 5}`}>
                      {o.company.split(' ').map(p => p[0]).join('').slice(0, 2)}
                    </div>
                    <div><strong>{o.company}</strong><small>{o.title}</small></div>
                  </div>
                </td>
                <td>
                  <span className="source-cell">
                    <span className="source-mini">
                      {o.source.includes('LinkedIn') ? 'in' : o.source.includes('board') ? 'JB' : o.source.includes('careers') ? 'WE' : o.source.includes('procurement') ? 'GOV' : '↗'}
                    </span>
                    {o.source}
                  </span>
                </td>
                <td className="muted-cell">{o.location}</td>
                <td><Pill type={o.fit === 'High' ? 'green' : o.fit === 'Medium' ? 'blue' : 'neutral'}>{o.fit}</Pill></td>
                <td>
                  <Pill type={statusTone(o.status)} dot>{o.status}</Pill>
                  {o.docs && <span title="Vendor requirements detected" className="tiny-flag"><FileCheck2 size={13} /></span>}
                </td>
                <td className="muted-cell">{o.found}</td>
                <td><button className="row-more" onClick={() => setDetail(o)} title="View details"><ChevronRight size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <EmptyHint
            title="No matching opportunities"
            description="Try changing your search or filters."
            icon={Search}
            action="Clear filters"
            onAction={() => { setQuery(''); setStatusFilter('All statuses'); setSourceFilter('All sources'); }}
          />
        )}
      </div>
    );
  }

  function renderPage() {
    if (page === 'Dashboard') {
      return (
        <>
          {pageHeading('Good morning, team', 'Here’s your sales activity at a glance.', (
            <>
              <Button icon={RefreshCw} onClick={() => { go('Discover'); notify('Ready to configure a discovery run'); }}>Run discovery</Button>
              <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>New campaign</Button>
            </>
          ), 'YOUR WORKSPACE')}
          <div className="notice-inline">
            <Info size={15} />
            <span>Demo dashboard — counts below are sample values for design review, not live sales results.</span>
            <button onClick={() => go('Settings')}>Environment settings</button>
          </div>
          <div className="kpi-grid">
            {kpi('Opportunities found', `${opportunities.length + 242}`, '+12%', Target, 'blue')}
            {kpi('Outreach sent', '156', '+8%', Send, 'violet')}
            {kpi('Replies received', '32', '+27%', MessageSquareText, 'green')}
            {kpi('Interested leads', '11', '+22%', Users, 'amber')}
          </div>
          <div className="dashboard-grid">
            <section className="panel chart-panel">
              <div className="panel-heading">
                <div><h2>Opportunity discovery</h2><p>Results found by day</p></div>
                <div className="range-select">
                  <select defaultValue="7 days"><option>7 days</option><option>30 days</option><option>90 days</option></select>
                  <MoreHorizontal size={18} />
                </div>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot blue-dot" /> Company careers</span>
                <span><i className="legend-dot green-dot" /> Job boards</span>
                <span><i className="legend-dot violet-dot" /> Direct research</span>
              </div>
              <LineChart />
            </section>
            <section className="panel source-panel">
              <div className="panel-heading">
                <div><h2>Opportunities by source</h2><p>Illustrative source mix</p></div>
                <button className="text-link" onClick={() => go('Sources')}>Manage sources</button>
              </div>
              <div className="donut-row">
                <div className="donut-chart"><div><strong>248</strong><span>Total</span></div></div>
                <div className="donut-legend">
                  <span><i className="legend-dot blue-dot" />Company careers <b>38%</b></span>
                  <span><i className="legend-dot green-dot" />Public job boards <b>25%</b></span>
                  <span><i className="legend-dot violet-dot" />Direct research <b>18%</b></span>
                  <span><i className="legend-dot orange-dot" />Procurement <b>12%</b></span>
                  <span><i className="legend-dot grey-dot" />Other <b>7%</b></span>
                </div>
              </div>
            </section>
          </div>
          <section className="panel table-panel">
            <div className="panel-heading">
              <div><h2>Sales workspace</h2><p>Latest opportunities, outreach and scheduled activity</p></div>
              <button className="text-link" onClick={() => go('Opportunities')}>View all opportunities <ChevronRight size={14} /></button>
            </div>
            <div className="tabs">
              {['Recent opportunities', 'Outreach activity', 'Scheduled runs'].map(t => (
                <button className={activeTab === t ? 'selected' : ''} onClick={() => setActiveTab(t)} key={t}>{t}</button>
              ))}
            </div>
            {activeTab === 'Recent opportunities' ? opportunitiesTable(opportunities.slice(0, 4), true) :
             activeTab === 'Outreach activity' ? <ActivityList items={seedActivities.slice(0, 3)} /> :
             <ScheduleMini scheduled={scheduled} onToggle={setScheduled} />}
          </section>
          <div className="bottom-grid">
            <section className="panel panel-pad">
              <div className="panel-heading"><div><h2>Readiness review</h2><p>Separate from opportunity qualification</p></div><Pill type="amber">2 need review</Pill></div>
              <div className="readiness-callout">
                <div className="callout-icon"><ShieldAlert size={18} /></div>
                <div>
                  <strong>Vendor documents are not assumed</strong>
                  <p>Keep interested work visible while requirements such as GST, insurance or vendor onboarding are tracked separately.</p>
                  <button className="text-link" onClick={() => go('Vendor readiness')}>Open readiness queue <ChevronRight size={14} /></button>
                </div>
              </div>
            </section>
            <section className="panel panel-pad">
              <div className="panel-heading"><div><h2>Quick actions</h2><p>Get started without automation setup</p></div></div>
              <div className="quick-grid">
                <button onClick={() => go('Discover')}><div className="quick-icon blue"><Search size={18} /></div><strong>Find opportunities</strong><small>Search selected sources</small></button>
                <button onClick={() => setModal({ type: 'opportunity' })}><div className="quick-icon green"><Plus size={18} /></div><strong>Add manually</strong><small>Log a lead or project</small></button>
                <button onClick={() => go('Outreach')}><div className="quick-icon violet"><Send size={18} /></div><strong>Review outreach</strong><small>Drafts and replies</small></button>
                <button onClick={() => go('Schedules')}><div className="quick-icon amber"><CalendarClock size={18} /></div><strong>Set a schedule</strong><small>Recurring discovery</small></button>
              </div>
            </section>
          </div>
        </>
      );
    }

    if (page === 'Opportunities') {
      return (
        <>
          {pageHeading('Opportunities', 'Review, qualify, and track sales opportunities from every configured source.', (
            <>
              <Button icon={Download} onClick={() => notify('CSV export is a prototype action.')}>Export</Button>
              <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'opportunity' })}>Add opportunity</Button>
            </>
          ), 'PIPELINE')}
          <div className="summary-strip">
            <div><span>All opportunities</span><strong>{opportunities.length + 242}</strong></div>
            <div><span>New to review</span><strong>{opportunities.filter(o => ['New', 'Needs review'].includes(o.status)).length}</strong></div>
            <div><span>Qualified</span><strong>{opportunities.filter(o => o.status === 'Qualified').length + 18}</strong></div>
            <div><span>Readiness hold</span><strong>{opportunities.filter(o => o.docs).length}</strong></div>
            <div className="strip-note"><Info size={14} />Readiness is tracked separately from sales fit.</div>
          </div>
          <section className="panel table-panel">
            <div className="panel-heading">
              <div><h2>All opportunities</h2><p>Latest discovery results and manually added leads</p></div>
              <Button small icon={Filter} onClick={() => notify('Filters active.')}>Filter list</Button>
            </div>
            {tableControls(true)}
            {opportunitiesTable()}
          </section>
        </>
      );
    }

    if (page === 'Discover') {
      return (
        <>
          {pageHeading('Discover opportunities', 'Search public sources manually or configure a repeatable discovery run.', <Button icon={Clock3} onClick={() => go('Schedules')}>View schedules</Button>, 'OPPORTUNITY DISCOVERY')}
          <div className="discovery-layout">
            <div className="discovery-main">
              <section className="panel panel-pad">
                <div className="section-title-row">
                  <div><h2>Build a search</h2><p>Start narrow, inspect the evidence, then save the search if it is useful.</p></div>
                  <span className="step-chip">STEP 01</span>
                </div>
                <label className="field-label">What are you looking for?</label>
                <div className="big-input">
                  <Search size={18} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. .NET developer, React contractor, software delivery project" />
                  <button onClick={() => { setQuery(''); setSourceFilters(['Company careers', 'Public job boards', 'Approved feeds', 'Public procurement']); }}>Clear</button>
                </div>
                <div className="field-grid">
                  <label className="field-label">Location or market<input placeholder="India, remote, Europe..." defaultValue="India · Remote" /></label>
                  <label className="field-label">Opportunity type
                    <select defaultValue="All relevant types">
                      <option>All relevant types</option>
                      <option>Individual developer roles</option>
                      <option>Project / consulting work</option>
                      <option>Procurement / vendor opportunities</option>
                    </select>
                  </label>
                  <label className="field-label">Date published
                    <select defaultValue="Last 7 days">
                      <option>Last 24 hours</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                    </select>
                  </label>
                  <label className="field-label">Keywords to exclude<input placeholder="internship, unpaid..." /></label>
                </div>
                <div className="divider-line" />
                <div className="section-title-row">
                  <div><h3>Choose sources</h3><p>Only enabled, permitted connectors can be queried.</p></div>
                  <span className="selected-count">{sourceFilters.length} selected</span>
                </div>
                <div className="source-choice-grid">
                  {[
                    { name: 'Company careers', desc: 'Public career pages', tag: 'Direct', icon: Building2 },
                    { name: 'Public job boards', desc: 'Public listings and feeds', tag: 'Job board', icon: BriefcaseBusiness },
                    { name: 'Approved feeds', desc: 'Configured APIs / aggregators', tag: 'API', icon: Server },
                    { name: 'Public procurement', desc: 'Tender and buyer portals', tag: 'Public', icon: FileText },
                    { name: 'LinkedIn handoff', desc: 'Research link / manual review', tag: 'Handoff', icon: Link2 },
                    { name: 'Direct company research', desc: 'Company services and signals', tag: 'Web', icon: Globe2 }
                  ].map(s => (
                    <button
                      key={s.name}
                      className={`source-choice ${sourceFilters.includes(s.name) ? 'checked' : ''}`}
                      onClick={() => setSourceFilters(prev => prev.includes(s.name) ? prev.filter(x => x !== s.name) : [...prev, s.name])}
                    >
                      <span className="source-choice-icon"><s.icon size={18} /></span>
                      <span><strong>{s.name}</strong><small>{s.desc}</small><em>{s.tag}</em></span>
                      <span className={`check-box ${sourceFilters.includes(s.name) ? 'is-checked' : ''}`}>{sourceFilters.includes(s.name) && <Check size={13} />}</span>
                    </button>
                  ))}
                </div>
                <div className="form-footer">
                  <span><ShieldCheck size={15} /> Platform access rules are respected.</span>
                  <Button
                    variant="primary"
                    icon={Search}
                    disabled={isRunningDiscovery}
                    onClick={handleRunDiscovery}
                  >
                    {isRunningDiscovery ? 'Running discovery...' : 'Run live discovery'}
                  </Button>
                </div>
              </section>
            </div>
            <aside className="discovery-side">
              <section className="panel panel-pad">
                <div className="panel-heading"><div><h3>Run mode</h3><p>Choose how discovery starts</p></div></div>
                <div className="mode-option selected"><div className="radio-dot" /><div><strong>Run once now</strong><small>Manual, on-demand search</small></div><Zap size={17} /></div>
                <button className="mode-option" onClick={() => go('Schedules')}><div className="radio-empty" /><div><strong>Schedule automatically</strong><small>Run daily or weekly</small></div><CalendarClock size={17} /></button>
                <div className="tip-card"><Sparkles size={17} /><div><strong>Keep search evidence</strong><p>Each result retains source URL, date found, snippet, and retrieval status for later validation.</p></div></div>
              </section>
            </aside>
          </div>
        </>
      );
    }

    if (page === 'Search results') {
      return (
        <>
          {pageHeading('Search results', 'Review illustrative matches and their source evidence before qualifying them.', (
            <>
              <Button onClick={() => go('Discover')}>Edit search</Button>
              <Button variant="primary" icon={Bookmark} onClick={() => notify('Search profile saved in session.')}>Save search</Button>
            </>
          ), 'DISCOVERY RUN')}
          <div className="run-status">
            <div className="run-icon"><CheckCircle2 size={18} /></div>
            <div>
              <strong>{lastRunResult ? `Run ${lastRunResult.runId} completed` : 'Search run completed'}</strong>
              <p>
                {lastRunResult
                  ? `${lastRunResult.newMatchesCount} new matches · ${lastRunResult.duplicateCount} duplicate(s) evaluated · ${lastRunResult.evaluatedCount} total candidates`
                  : `${opportunities.length} matches · Source evidence recorded`}
              </p>
            </div>
            <Pill type="green">{lastRunResult?.status || 'Completed'}</Pill>
          </div>

          {lastRunResult && lastRunResult.sourceMetrics && (
            <div className="metric-strip" style={{ display: 'flex', gap: '10px', margin: '14px 0', flexWrap: 'wrap' }}>
              {lastRunResult.sourceMetrics.map((sm, i) => (
                <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 14px', flex: '1', minWidth: '180px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12px' }}>{sm.sourceName}</strong>
                    <Pill type={sm.status === 'Success' ? 'green' : sm.status === 'PolicyRestricted' ? 'amber' : 'neutral'}>
                      {sm.status}
                    </Pill>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                    Fetched: <b>{sm.recordsFetched}</b> · New: <b>{sm.newMatches}</b>
                    {sm.rejectedByPolicy > 0 && <span style={{ color: '#d97706', marginLeft: '6px' }}>Policy restricted</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className="panel table-panel">
            <div className="panel-heading"><div><h2>Potential matches</h2><p>Validate opening details and contact channels before outreach.</p></div></div>
            {opportunitiesTable()}
          </section>
        </>
      );
    }

    if (page === 'Outreach') {
      return (
        <>
          {pageHeading('Outreach', 'Prepare relevant, evidence-based messages and track approved follow-up.', (
            <>
              <Button icon={ListChecks} onClick={() => notify('Bulk review mode active.')}>Review queue</Button>
              <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'compose' })}>Draft outreach</Button>
            </>
          ), 'ENGAGEMENT')}
          <div className="notice-inline amber-notice">
            <ShieldCheck size={15} />
            <span>Safe mode: messages are draft-only in this UI. The production flow enforces approved channels, consent/legitimate basis, opt-outs, and rate limits.</span>
          </div>
          <div className="kpi-grid three">
            {kpi('Drafts ready', '12', '4 due today', FileText, 'blue', 'awaiting review')}
            {kpi('Replies to review', '5', '2 new', MessageSquareText, 'green', 'awaiting classification')}
            {kpi('Follow-ups due', '8', '3 overdue', CalendarClock, 'amber', 'based on demo rules')}
          </div>
          <section className="panel table-panel">
            <div className="panel-heading"><div><h2>Outreach queue</h2><p>Track message status independently from opportunity status.</p></div></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>COMPANY / CONTACT</th><th>MESSAGE</th><th>CHANNEL</th><th>STATUS</th><th>LAST UPDATED</th><th></th></tr></thead>
                <tbody>
                  {outreachRows.map(r => (
                    <tr key={r.company}>
                      <td><div className="company-cell"><div className="company-logo logo-2">{r.company.slice(0, 2)}</div><div><strong>{r.company}</strong><small>{r.contact}</small></div></div></td>
                      <td><div className="message-cell">{r.subject}</div></td>
                      <td><span className="source-cell"><Mail size={14} />{r.channel}</span></td>
                      <td><Pill type={r.status === 'Replied' ? 'green' : r.status === 'Follow-up due' ? 'amber' : 'blue'} dot>{r.status}</Pill></td>
                      <td className="muted-cell">{r.updated}</td>
                      <td><button className="row-action" onClick={() => setModal({ type: 'compose', prefill: r.subject, company: r.company })}>Open <ChevronRight size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      );
    }

    if (page === 'Campaigns') {
      return (
        <>
          {pageHeading('Campaigns', 'Organize outreach sequences with transparent limits and stop conditions.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>Create campaign</Button>, 'OUTREACH MANAGEMENT')}
          <div className="campaign-cards">
            {campaigns.map(c => (
              <section className="panel campaign-card" key={c.name}>
                <Pill type={c.status === 'Active' ? 'green' : c.status === 'Paused' ? 'amber' : 'blue'} dot>{c.status}</Pill>
                <h3>{c.name}</h3>
                <p>{c.audience}</p>
                <div className="campaign-stats">
                  <div><small>Messages sent</small><strong>{c.sent}</strong></div>
                  <div><small>Replies</small><strong>{c.replies}</strong></div>
                  <div><small>Reply rate</small><strong>{c.sent ? Math.round(c.replies / c.sent * 100) + '%' : '—'}</strong></div>
                </div>
                <div className="campaign-actions">
                  <Button small onClick={() => setModal({ type: 'compose', prefill: `Campaign: ${c.name}` })}>Review sequence</Button>
                  <Button small variant="primary" onClick={() => notify(`${c.name} status updated`)}>{c.status === 'Active' ? 'Pause' : 'Open'}</Button>
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (page === 'Contacts') {
      return (
        <>
          {pageHeading('Contacts', 'Keep people, source evidence, communication preference and do-not-contact status together.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'contact' })}>Add contact</Button>, 'RELATIONSHIP MANAGEMENT')}
          <section className="panel table-panel">
            <div className="table-wrap">
              <table>
                <thead><tr><th>CONTACT</th><th>COMPANY</th><th>ROLE</th><th>EMAIL / CHANNEL</th><th>SOURCE & PROVENANCE</th><th>QUALIFICATION</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id || c.email}>
                      <td>
                        <strong>{c.name}</strong>
                        {c.isRoleAccount && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--red-600, #dc2626)', background: 'var(--red-50, #fef2f2)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>Role account</span>}
                      </td>
                      <td>{c.company}</td>
                      <td className="muted-cell">{c.role}</td>
                      <td><span className="email-cell"><Mail size={13} />{c.email}</span></td>
                      <td className="muted-cell">
                        <div>{c.source}</div>
                        {c.sourceUrl && (
                          <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                            Source link
                          </a>
                        )}
                        {c.channelBasis && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{c.channelBasis}</div>}
                      </td>
                      <td>
                        <Pill type={c.qualificationStatus === 'Verified' ? 'green' : c.qualificationStatus === 'BlockedByPolicy' || c.qualificationStatus === 'OptedOut' ? 'red' : 'neutral'}>
                          {c.qualificationStatus || 'Unverified'}
                        </Pill>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.qualificationStatus !== 'Verified' && (
                            <button
                              className="btn btn-sm btn-outline"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer' }}
                              onClick={() => handleQualifyContact(c.id, 'Verified', 'Ready for outreach')}
                            >
                              Verify
                            </button>
                          )}
                          {c.qualificationStatus !== 'OptedOut' && (
                            <button
                              className="btn btn-sm btn-outline"
                              style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}
                              onClick={() => handleQualifyContact(c.id, 'OptedOut', 'Do not contact', 'Opted out by user')}
                            >
                              Opt Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      );
    }

    if (page === 'Schedules') {
      return (
        <>
          {pageHeading('Schedules & automation', 'Set recurring searches and follow-ups. Every run must be visible and recoverable.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'schedule' })}>New schedule</Button>, 'AUTOMATION CONTROL')}
          <section className="panel">
            {[{ key: 'daily', name: 'Daily opportunity discovery', desc: 'Company career pages and permitted public feeds', freq: 'Weekdays · 8:30 AM' },
              { key: 'weekly', name: 'Weekly procurement scan', desc: 'Selected public procurement portals', freq: 'Mondays · 9:00 AM' }].map(s => (
              <div className="schedule-row" key={s.key}>
                <div className="schedule-info">
                  <strong>{s.name}</strong>
                  <p>{s.desc}</p>
                  <div className="schedule-meta"><span><Clock3 size={13} />{s.freq}</span></div>
                </div>
                <div className="schedule-status">
                  <Pill type={scheduled[s.key] ? 'green' : 'neutral'} dot>{scheduled[s.key] ? 'Enabled' : 'Paused'}</Pill>
                  <Toggle checked={!!scheduled[s.key]} onChange={(v: boolean) => { setScheduled(p => ({ ...p, [s.key]: v })); notify(`${s.name} ${v ? 'enabled' : 'paused'}`); }} label={`Toggle ${s.name}`} />
                </div>
              </div>
            ))}
          </section>
        </>
      );
    }

    if (page === 'Sources') {
      const activeSources = sources.length > 0 ? sources : [
        { id: 'SRC-001', name: 'Company careers', description: 'Target corporate career pages and approved public job boards.', category: 'Careers', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Extracted from public career portal.', dailyRequestLimit: 500, currentDayRequests: 42, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
        { id: 'SRC-002', name: 'Public job board', description: 'Public indexing boards and technology work listings.', category: 'JobBoard', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Referenced from public job board listing.', dailyRequestLimit: 300, currentDayRequests: 18, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
        { id: 'SRC-003', name: 'Direct company research', description: 'Verified manual and automated deep research on target organizations.', category: 'Research', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Verified research entry by sales team member.', dailyRequestLimit: 200, currentDayRequests: 9, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
        { id: 'SRC-004', name: 'Public procurement', description: 'Government and public sector RFP / vendor registration portals.', category: 'Procurement', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Public procurement notice / tender reference.', dailyRequestLimit: 150, currentDayRequests: 3, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
        { id: 'SRC-005', name: 'Approved feed', description: 'Syndicated developer contract and technology requirement feeds.', category: 'Feed', policyStatus: 'Active', allowsDirectFetch: true, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Syndicated feed item with canonical URL.', dailyRequestLimit: 400, currentDayRequests: 24, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
        { id: 'SRC-006', name: 'LinkedIn handoff', description: 'Manual browser handoff only. Automated scraping and automated DMs prohibited by policy.', category: 'Social', policyStatus: 'Restricted', allowsDirectFetch: false, termsUrl: 'https://vsrsystems.com/compliance/source-policy', attributionNotice: 'Manual external browser link only. No automated access.', dailyRequestLimit: 0, currentDayRequests: 0, healthStatus: 'Healthy', lastCheckedAtUtc: new Date().toISOString() },
      ];

      return (
        <>
          {pageHeading('Sources & integrations', 'Manage source connectors with explicit access methods and clear policy rules.', <Button icon={RefreshCw} onClick={() => { loadSourcesAndProfiles(); notify('Source registry reloaded.'); }}>Refresh registry</Button>, 'DATA SOURCES')}
          <div className="notice-inline">
            <Info size={15} />
            <span>Policy rule: LinkedIn handoff is restricted by design. Automated scraping and unsolicited platform DMs are prohibited.</span>
          </div>
          <div className="sources-grid">
            {activeSources.map(s => (
              <section className="panel source-card" key={s.id || s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{s.name}</h3>
                  <Pill type={s.policyStatus === 'Active' ? 'green' : s.policyStatus === 'Restricted' ? 'amber' : 'neutral'} dot>
                    {s.policyStatus}
                  </Pill>
                </div>
                <p>{s.description}</p>
                <div className="source-method">
                  <span>CATEGORY / HEALTH</span>
                  <strong>{s.category} · {s.healthStatus}</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', margin: '8px 0' }}>
                  Daily requests: <b>{s.currentDayRequests}</b> / {s.dailyRequestLimit > 0 ? s.dailyRequestLimit : 'Manual only'}
                </div>
                <div className="source-card-bottom" style={{ marginTop: '10px' }}>
                  <select
                    value={s.policyStatus}
                    onChange={e => handleUpdateSourceStatus(s.id, e.target.value)}
                    style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Restricted">Restricted</option>
                    <option value="UnderReview">UnderReview</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {s.allowsDirectFetch ? 'Direct fetch' : 'Handoff only'}
                  </span>
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (page === 'Vendor readiness') {
      const vendorRequirements = opportunities.filter(o => o.docs);

      return (
        <>
          {pageHeading('Vendor readiness', 'Track documentary requirements separately from sales fit. An opportunity can remain visible while readiness is incomplete.', null, 'ELIGIBILITY & COMPLIANCE')}
          <div className="notice-inline amber-notice">
            <ShieldAlert size={15} />
            <span>VSR has not asserted GST registration, office premises, certifications, or other verification documents. Mark requirements as pending until verified.</span>
          </div>
          <section className="panel table-panel">
            <div className="panel-heading">
              <div>
                <h2>Requirements requiring review ({vendorRequirements.length})</h2>
                <p>Active opportunities with mandatory supplier onboarding or tender documentation</p>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>OPPORTUNITY</th>
                    <th>REQUIREMENT / NOTES</th>
                    <th>SOURCE</th>
                    <th>CURRENT STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorRequirements.map(o => (
                    <tr key={o.id}>
                      <td>
                        <div className="company-cell">
                          <div className="company-logo logo-1">{o.company.slice(0, 2)}</div>
                          <div><strong>{o.company}</strong><small>{o.title}</small></div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', maxWidth: '320px' }}>
                          {o.vendorRequirementNotes || 'Supplier registration and compliance pack required.'}
                        </div>
                      </td>
                      <td>
                        <span className="source-cell">{o.source}</span>
                      </td>
                      <td>
                        <Pill type={statusTone(o.status)} dot>{o.status}</Pill>
                      </td>
                      <td>
                        <button className="row-action" onClick={() => setDetail(o)}>
                          Inspect <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vendorRequirements.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                        No opportunities currently require vendor readiness documentation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      );
    }

    if (page === 'Activity log') {
      return (
        <>
          {pageHeading('Activity log', 'An auditable timeline of searches, schedules, data changes, outreach drafts and system decisions.', null, 'AUDIT TRAIL')}
          <section className="panel panel-pad activity-panel">
            <ActivityList items={seedActivities} />
          </section>
        </>
      );
    }

    if (page === 'Reports') {
      return (
        <>
          {pageHeading('Reports & insights', 'Track discovery coverage and workflow outcomes without inventing performance claims.', null, 'PERFORMANCE')}
          <div className="kpi-grid">
            {kpi('Opportunities found', '248', '+12%', Target, 'blue')}
            {kpi('Qualified rate', '34%', '+4.1%', CheckCheck, 'green')}
            {kpi('Reply rate', '18.4%', '+3.2%', MessageSquareText, 'violet')}
            {kpi('Source coverage', '6', '+1', Globe2, 'amber')}
          </div>
        </>
      );
    }

    if (page === 'Settings') {
      return (
        <>
          {pageHeading('Settings', 'Manage the workspace defaults and development environment safeguards.', null, 'WORKSPACE CONFIGURATION')}
          <div className="settings-layout">
            <aside className="panel settings-nav">
              {['General', 'Authentication', 'Guest mode', 'Outreach safety', 'Source policy', 'Data & privacy', 'About'].map(t => (
                <button key={t} className={settingsTab === t ? 'selected' : ''} onClick={() => setSettingsTab(t)}>
                  <span>{t}</span><ChevronRight size={14} />
                </button>
              ))}
            </aside>
            <section className="panel settings-main">
              {settingsTab === 'General' && (
                <>
                  <div className="settings-title"><h2>Workspace preferences</h2></div>
                  <SettingRow title="Color theme" desc="Toggle light and dark themes.">
                    <div className="theme-pick">
                      <button className={!dark ? 'picked' : ''} onClick={() => setDark(false)}><Sun size={15} />Light</button>
                      <button className={dark ? 'picked' : ''} onClick={() => setDark(true)}><Moon size={15} />Dark</button>
                    </div>
                  </SettingRow>
                </>
              )}
              {settingsTab === 'Authentication' && (
                <>
                  <div className="settings-title"><h2>Authentication</h2></div>
                  <div className="auth-callout">
                    <KeyRound size={19} />
                    <div><strong>JWT authentication is required by default</strong><p>Enforced server-side in ASP.NET Core.</p></div>
                  </div>
                  <SettingRow title="Guest bypass in production" desc="Security boundary constraint."><Pill type="red">Strictly Disabled</Pill></SettingRow>
                </>
              )}
              {settingsTab === 'Guest mode' && (
                <>
                  <div className="settings-title"><h2>Development guest mode</h2></div>
                  <div className="guest-settings-card">
                    <div className="guest-settings-icon"><Code2 size={20} /></div>
                    <div className="guest-settings-copy">
                      <strong>Guest access status</strong>
                      <p>Currently {guestMode ? 'active in local development session.' : 'disabled; using authenticated token.'}</p>
                    </div>
                  </div>
                  <div className="settings-footer">
                    <Button onClick={() => go('Sign in')} icon={LogOut}>Open sign-in screen</Button>
                  </div>
                </>
              )}
              {settingsTab === 'About' && (
                <>
                  <div className="settings-title"><h2>About VSR Sales Engine</h2></div>
                  <SettingRow title="Frontend stack" desc="UI framework."><strong>React + TypeScript (Vite)</strong></SettingRow>
                  <SettingRow title="Backend API" desc="Web API framework."><strong>.NET 10 LTS ASP.NET Core</strong></SettingRow>
                  <SettingRow title="Database" desc="Target database."><strong>Supabase PostgreSQL</strong></SettingRow>
                </>
              )}
            </section>
          </div>
        </>
      );
    }

    return null;
  }
}

function statusTone(status: string) {
  if (['New', 'Qualified', 'Interested'].includes(status)) return status === 'New' ? 'blue' : 'green';
  if (['Needs review', 'Readiness hold'].includes(status)) return status === 'Readiness hold' ? 'amber' : 'violet';
  return 'neutral';
}

function SettingRow({ title, desc, children }: any) {
  return (
    <div className="setting-row">
      <div className="setting-copy"><strong>{title}</strong><p>{desc}</p></div>
      <div className="setting-action">{children}</div>
    </div>
  );
}

function ActivityList({ items }: { items: any[] }) {
  return (
    <div className="activity-list">
      {items.map((it, i) => (
        <div className="activity-row" key={i}>
          <div className={`activity-icon ${it.color}`}><it.icon size={16} /></div>
          <div className="activity-info"><strong>{it.title}</strong><p>{it.detail}</p></div>
          <span className="activity-time">{it.time}</span>
        </div>
      ))}
    </div>
  );
}

function ScheduleMini({ scheduled, onToggle }: any) {
  return (
    <div className="schedule-mini-list">
      {[{ key: 'daily', title: 'Daily opportunity discovery', time: 'Tomorrow, 8:30 AM' },
        { key: 'followup', title: 'Follow-up reminder digest', time: 'Tomorrow, 10:00 AM' }].map(s => (
        <div className="schedule-mini-item" key={s.key}>
          <div><strong>{s.title}</strong><small>{s.time}</small></div>
          <Toggle checked={!!scheduled[s.key]} onChange={(v: boolean) => onToggle((p: any) => ({ ...p, [s.key]: v }))} label={`Toggle ${s.title}`} />
        </div>
      ))}
    </div>
  );
}

function LineChart() {
  return (
    <div className="chart-placeholder">
      <svg viewBox="0 0 400 120" className="chart-svg">
        <path d="M 0 100 Q 100 20 200 80 T 400 30" fill="none" stroke="#286BE8" strokeWidth="2.5" />
        <path d="M 0 110 Q 100 60 200 90 T 400 70" fill="none" stroke="#159E7E" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}

function Modal({ modal, onClose, onNotify, onCreate }: any) {
  const [name, setName] = useState('');
  const [secondary, setSecondary] = useState('');
  const [source, setSource] = useState('Company careers');
  const [location, setLocation] = useState('Remote · India');
  const [fit, setFit] = useState('High');
  const [type, setType] = useState('Individual developer');
  const [docs, setDocs] = useState(false);
  const [vendorRequirementNotes, setVendorRequirementNotes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [evidenceSnippet, setEvidenceSnippet] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [channelBasis, setChannelBasis] = useState('ExplicitBusinessContact');
  const [contactNotes, setContactNotes] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{modal.type === 'campaign' ? 'Create Sales Campaign' : modal.type === 'contact' ? 'Add Contact' : modal.type === 'opportunity' ? 'Add Opportunity' : 'Information'}</h3>
          <button className="icon-button" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {modal.type === 'campaign' && (
            <>
              <label className="field-label">Campaign Name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. .NET API Modernization" /></label>
              <label className="field-label">Target Audience<input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Healthcare CTOs" /></label>
            </>
          )}
          {modal.type === 'contact' && (
            <>
              <label className="field-label">Full Name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maya Patel" /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label className="field-label">Company<input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Northstar Digital" /></label>
                <label className="field-label">Role<input value={contactRole} onChange={e => setContactRole(e.target.value)} placeholder="e.g. Engineering Manager" /></label>
              </div>
              <label className="field-label">Email Address<input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="e.g. maya.patel@example.com" /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label className="field-label">Source
                  <select value={source} onChange={e => setSource(e.target.value)}>
                    <option value="Company careers">Company careers</option>
                    <option value="Public directory">Public directory</option>
                    <option value="Direct research">Direct research</option>
                    <option value="Public procurement">Public procurement</option>
                    <option value="Manual entry">Manual entry</option>
                  </select>
                </label>
                <label className="field-label">Channel Basis
                  <select value={channelBasis} onChange={e => setChannelBasis(e.target.value)}>
                    <option value="ExplicitBusinessContact">Explicit Business Contact</option>
                    <option value="PublicDirectory">Public Directory</option>
                    <option value="ManualHandoff">Manual Handoff</option>
                  </select>
                </label>
              </div>
              <label className="field-label">Source URL<input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://example.com/team" /></label>
              <label className="field-label">Verification / Provenance Notes<input value={contactNotes} onChange={e => setContactNotes(e.target.value)} placeholder="Publicly listed on corporate site." /></label>
            </>
          )}
          {modal.type === 'opportunity' && (
            <>
              <label className="field-label">Company<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Northstar Digital" /></label>
              <label className="field-label">Role / Requirement Title<input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Contract Senior .NET Engineer" /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label className="field-label">Source
                  <select value={source} onChange={e => setSource(e.target.value)}>
                    <option value="Company careers">Company careers</option>
                    <option value="Public job board">Public job board</option>
                    <option value="Direct research">Direct research</option>
                    <option value="Public procurement">Public procurement</option>
                    <option value="Approved feed">Approved feed</option>
                  </select>
                </label>
                <label className="field-label">Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bengaluru, India / Remote" /></label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label className="field-label">Fit Rating
                  <select value={fit} onChange={e => setFit(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </label>
                <label className="field-label">Opportunity Type
                  <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="Individual developer">Individual developer</option>
                    <option value="Company/vendor">Company/vendor</option>
                    <option value="Direct project">Direct project</option>
                  </select>
                </label>
              </div>
              <label className="field-label">Source URL<input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://careers.example.com/job" /></label>
              <label className="field-label">Captured Evidence Snippet<textarea rows={2} value={evidenceSnippet} onChange={e => setEvidenceSnippet(e.target.value)} placeholder="Raw text evidence from source posting..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }} /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                <input type="checkbox" checked={docs} onChange={e => setDocs(e.target.checked)} />
                <span>Requires Vendor Registration / Procurement Documentation</span>
              </label>
              {docs && (
                <label className="field-label" style={{ marginTop: '8px' }}>Vendor Document Notes<input value={vendorRequirementNotes} onChange={e => setVendorRequirementNotes(e.target.value)} placeholder="e.g. GST registration, ISO certification, vendor portal setup required" /></label>
              )}
            </>
          )}
          {modal.type === 'help' && (
            <p>Welcome to VSR Sales Engine. Use the left navigation to explore opportunities, build discovery runs, draft outreach, and verify document readiness.</p>
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cancel</Button>
          {modal.type !== 'help' && (
            <Button variant="primary" onClick={() => onCreate({
              type: modal.type,
              name,
              company: modal.type === 'contact' ? secondary : name,
              role: contactRole,
              email: contactEmail,
              title: secondary,
              audience: secondary,
              source,
              location,
              fit,
              opportunityType: type,
              docs,
              vendorRequirementNotes,
              sourceUrl,
              channelBasis,
              notes: contactNotes,
              evidenceSnippet
            })}>Create</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({
  item,
  onClose,
  onNotify,
  onStatusChange,
  onArchive
}: {
  item: Opportunity;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onStatusChange: (item: Opportunity, newStatus: string, reason?: string) => void;
  onArchive: (item: Opportunity) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(item.status);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['New', 'Needs review', 'Qualified', 'Contacted', 'Readiness hold', 'Interested', 'Archived'];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="detail-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="eyebrow">{item.id}</div>
            <h2>{item.company}</h2>
            <p>{item.title}</p>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-content">
          <div className="drawer-field"><strong>Source</strong><span>{item.source}</span></div>
          <div className="drawer-field"><strong>Location</strong><span>{item.location}</span></div>
          <div className="drawer-field"><strong>Fit Rating</strong><Pill type={item.fit === 'High' ? 'green' : item.fit === 'Medium' ? 'blue' : 'neutral'}>{item.fit}</Pill></div>
          <div className="drawer-field"><strong>Type</strong><span>{item.type}</span></div>
          <div className="drawer-field"><strong>Current Status</strong><Pill type={statusTone(item.status)} dot>{item.status}</Pill></div>

          <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '8px', margin: '12px 0' }}>
            <strong style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--text)' }}>Pipeline Transition:</strong>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px' }}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button
                small
                variant="primary"
                disabled={selectedStatus === item.status || isUpdating}
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    await onStatusChange(item, selectedStatus, reason || undefined);
                  } finally {
                    setIsUpdating(false);
                  }
                }}
              >
                Update
              </Button>
            </div>
            {selectedStatus !== item.status && (
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason or audit note (optional)..."
                style={{ marginTop: '8px', width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px' }}
              />
            )}
          </div>

          {item.sourceUrl && (
            <div className="drawer-field">
              <strong>Source URL</strong>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-link"><Globe2 size={13} /> {item.sourceUrl}</a>
            </div>
          )}
          {item.evidenceSnippet && (
            <div className="drawer-field evidence-box">
              <strong>Captured Evidence</strong>
              <p>{item.evidenceSnippet}</p>
            </div>
          )}
          {item.docs && (
            <div className="readiness-callout">
              <ShieldAlert size={16} />
              <div>
                <strong>Vendor document requirement detected</strong>
                <p>{item.vendorRequirementNotes || 'Review supplier requirements in the Vendor Readiness queue.'}</p>
              </div>
            </div>
          )}

          {item.statusHistory && item.statusHistory.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <strong style={{ display: 'block', fontSize: '11px', marginBottom: '8px', color: 'var(--text)' }}>Status Audit Trail ({item.statusHistory.length})</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {item.statusHistory.map((h, i) => (
                  <div key={i} style={{ fontSize: '11px', background: 'var(--bg)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                      <span><strong>{h.fromStatus}</strong> → <strong>{h.toStatus}</strong></span>
                      <small>{new Date(h.changedAtUtc).toLocaleString()}</small>
                    </div>
                    <div style={{ marginTop: '4px', color: 'var(--text)' }}>
                      <span>By: {h.changedBy}</span>
                      {h.reason && <span style={{ marginLeft: '8px', fontStyle: 'italic', color: 'var(--muted)' }}>"{h.reason}"</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="drawer-footer">
          <Button variant="secondary" onClick={() => onArchive(item)}>Archive</Button>
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => { onNotify('Outreach draft created from opportunity'); onClose(); }}>Prepare outreach draft</Button>
        </div>
      </div>
    </div>
  );
}
