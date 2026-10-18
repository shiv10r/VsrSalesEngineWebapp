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
import { api } from './services/api';
import { Campaign, Contact, Opportunity, OutreachRow } from './types';

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
  {name:'Maya Patel', company:'Northstar Digital', role:'Engineering Manager', email:'maya.patel@example.com', source:'Company website', status:'Not contacted'},
  {name:'Arjun Mehta', company:'BrightPath Health', role:'Talent Partner', email:'arjun.mehta@example.com', source:'Public profile', status:'Replied'},
  {name:'Sarah Johnson', company:'Vertex Logistics', role:'Technology Director', email:'sarah.johnson@example.com', source:'Direct', status:'Follow-up due'},
  {name:'Daniel Kim', company:'NimbusWorks', role:'Procurement Lead', email:'daniel.kim@example.com', source:'Tender portal', status:'Do not contact'},
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

  useEffect(() => {
    // Attempt to load opportunities from backend API if available
    api.getOpportunities().then(data => {
      if (data && data.length > 0) {
        setOpportunities(data);
      }
    });
  }, [page]);

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout((window as any).__vsrToastTimer);
    (window as any).__vsrToastTimer = window.setTimeout(() => setToast(''), 3000);
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
      {modal && <Modal modal={modal} onClose={() => setModal(null)} onNotify={notify} onCreate={(m: any) => {
        if (m.type === 'campaign') {
          setCampaigns(prev => [{ name: m.name || 'New sales campaign', audience: m.audience || 'Custom audience', sent: 0, replies: 0, status: 'Draft', next: 'Not scheduled' }, ...prev]);
          notify('Campaign draft created');
        } else if (m.type === 'contact') {
          setContacts(prev => [{ name: m.name || 'New contact', company: m.company || 'Unassigned', role: m.role || 'Not specified', email: m.email || 'Not provided', source: 'Manually added', status: 'Not contacted' }, ...prev]);
          notify('Contact added');
        } else if (m.type === 'opportunity') {
          setOpportunities(prev => [{ id: `OP-${1050 + prev.length}`, company: m.company || 'New company', title: m.title || 'Opportunity to qualify', source: 'Manually added', location: m.location || 'Not specified', found: 'Just now', status: 'New', fit: 'Unrated', type: 'Direct project', docs: false }, ...prev]);
          notify('Opportunity added to review queue');
        }
        setModal(null);
      }} />}
      {detail && <DetailDrawer item={detail} onClose={() => setDetail(null)} onNotify={notify} />}
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
                  <Button variant="primary" icon={Search} onClick={() => { setSourceFilter('All sources'); go('Search results'); }}>Search selected sources</Button>
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
              <Button variant="primary" icon={Bookmark} onClick={() => notify('Search saved in session.')}>Save search</Button>
            </>
          ), 'DISCOVERY RUN · DEMO')}
          <div className="run-status">
            <div className="run-icon"><CheckCircle2 size={18} /></div>
            <div><strong>Search run completed</strong><p>{opportunities.length} matches · Source evidence recorded</p></div>
            <Pill type="green">Completed</Pill>
          </div>
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
                <thead><tr><th>CONTACT</th><th>COMPANY</th><th>ROLE</th><th>EMAIL / CHANNEL</th><th>SOURCE</th><th>STATUS</th></tr></thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.email}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.company}</td>
                      <td className="muted-cell">{c.role}</td>
                      <td><span className="email-cell"><Mail size={13} />{c.email}</span></td>
                      <td className="muted-cell">{c.source}</td>
                      <td><Pill type={c.status === 'Replied' ? 'green' : c.status === 'Do not contact' ? 'red' : 'neutral'}>{c.status}</Pill></td>
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
      return (
        <>
          {pageHeading('Sources & integrations', 'Manage source connectors with explicit access methods and clear limitations.', <Button icon={RefreshCw} onClick={() => notify('Connectors healthy.')}>Check status</Button>, 'DATA SOURCES')}
          <div className="sources-grid">
            {[{ name: 'Company careers', desc: 'Public career pages', method: 'Public web', status: 'Connected' },
              { name: 'Public job boards', desc: 'Official public feeds', method: 'API / Feed', status: 'Connected' },
              { name: 'LinkedIn handoff', desc: 'Manual review link', method: 'Human handoff', status: 'Manual handoff' }].map(s => (
              <section className="panel source-card" key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <div className="source-method"><span>ACCESS METHOD</span><strong>{s.method}</strong></div>
                <div className="source-card-bottom">
                  <Pill type={s.status === 'Connected' ? 'green' : 'blue'} dot>{s.status}</Pill>
                  <Toggle checked={!!connected[s.name]} onChange={(v: boolean) => setConnected(p => ({ ...p, [s.name]: v }))} label={`Toggle ${s.name}`} />
                </div>
              </section>
            ))}
          </div>
        </>
      );
    }

    if (page === 'Vendor readiness') {
      return (
        <>
          {pageHeading('Vendor readiness', 'Track documentary requirements separately from sales fit. An opportunity can remain visible while readiness is incomplete.', null, 'ELIGIBILITY & COMPLIANCE')}
          <div className="notice-inline amber-notice">
            <ShieldAlert size={15} />
            <span>VSR has not asserted GST registration, office premises, certifications, or other verification documents. Mark requirements as pending until verified.</span>
          </div>
          <section className="panel table-panel">
            <div className="panel-heading"><h2>Requirements requiring review</h2></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>OPPORTUNITY</th><th>REQUIREMENT</th><th>STATUS</th><th>OWNER</th></tr></thead>
                <tbody>
                  <tr><td><strong>CloudHarbor Labs</strong></td><td>Supplier onboarding pack</td><td><Pill type="amber" dot>Needs assessment</Pill></td><td>Sales team</td></tr>
                  <tr><td><strong>NimbusWorks</strong></td><td>GST and legal entity details</td><td><Pill type="red" dot>Missing evidence</Pill></td><td>Unassigned</td></tr>
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

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
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
              <label className="field-label">Full Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Maya Patel" /></label>
              <label className="field-label">Company<input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Northstar Digital" /></label>
            </>
          )}
          {modal.type === 'opportunity' && (
            <>
              <label className="field-label">Company<input value={name} onChange={e => setName(e.target.value)} placeholder="Company Name" /></label>
              <label className="field-label">Title<input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Contract Senior Developer" /></label>
            </>
          )}
          {modal.type === 'help' && (
            <p>Welcome to VSR Sales Engine. Use the left navigation to explore opportunities, build discovery runs, draft outreach, and verify document readiness.</p>
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cancel</Button>
          {modal.type !== 'help' && (
            <Button variant="primary" onClick={() => onCreate({ type: modal.type, name, company: name, title: secondary, audience: secondary })}>Create</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ item, onClose, onNotify }: { item: Opportunity; onClose: () => void; onNotify: (msg: string) => void }) {
  return (
    <div className="drawer-backdrop">
      <div className="detail-drawer">
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
          <div className="drawer-field"><strong>Fit Rating</strong><Pill type={item.fit === 'High' ? 'green' : 'blue'}>{item.fit}</Pill></div>
          <div className="drawer-field"><strong>Status</strong><Pill type={statusTone(item.status)} dot>{item.status}</Pill></div>
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
              <div><strong>Vendor document requirement detected</strong><p>Review supplier requirements in the Vendor Readiness queue.</p></div>
            </div>
          )}
        </div>
        <div className="drawer-footer">
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => { onNotify('Outreach draft created from opportunity'); onClose(); }}>Prepare outreach draft</Button>
        </div>
      </div>
    </div>
  );
}
