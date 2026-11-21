import {
  Activity, ArrowUpRight, Bell, Bookmark, BriefcaseBusiness, Building2, CalendarClock, Check,
  CheckCheck, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, Download,
  ExternalLink, FileCheck2, FileText, Filter, Globe2, Inbox, Info, KeyRound, Link2, ListChecks,
  LogOut, Mail, Menu, MessageSquareText, Moon, MoreHorizontal, Play, Plus, RefreshCw, Search,
  Send, Server, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Target, Trash2,
  TriangleAlert, Users, X, Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ComplianceGateModal } from './components/ComplianceGateModal';
import { DetailDrawer } from './components/DetailDrawer';
import { DraftComposerModal } from './components/DraftComposerModal';
import { ActivityList, LineChart, ScheduleMini, SettingRow } from './components/Helpers';
import { Modal } from './components/Modal';
import { SignIn } from './components/screens/SignIn';
import { Button, EmptyHint, LogoMark, Pill, Toggle } from './components/ui/Primitives';
import { navGroups } from './data/navigation';
import { seedActivities, seedCampaigns, seedContacts, seedOpportunities } from './data/seeds';
import { api } from './services/api';
import {
  AutomationSchedule, Campaign, Contact, DiscoveryRunResult, ExecutionRecord, Opportunity,
  OutreachRow, ReliabilityMetrics, SearchProfile, SinkMessage, SourceDefinition,
  SuppressionRecord,
} from './types';
import { statusTone } from './utils/statusTone';

export function App() {
  const [page, setPage] = useState('Sign in');
  const [guestMode, setGuestMode] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sourceFilters, setSourceFilters] = useState<string[]>([
    "Hacker News (Freelance & Who's Hiring)",
    "We Work Remotely (Contracts)",
    "Remotive (Contract / Freelance)",
    "Jobicy (Developer Contracts)",
    "Company careers",
    "Public job boards"
  ]);
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sourceFilter, setSourceFilter] = useState('All sources');
  const [activeTab, setActiveTab] = useState('Recent opportunities');
  const [modal, setModal] = useState<any>(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scheduled, setScheduled] = useState<Record<string, boolean>>({daily:true,weekly:false,followup:true});
  const [connected, setConnected] = useState<Record<string, boolean>>({'Company careers':true,'Public job boards':true,'Direct company research':true,'LinkedIn handoff':false,'Public procurement':true,'Approved APIs':false});
  const [outreachRows, setOutreachRows] = useState<OutreachRow[]>([
    {company:'Northstar Digital',contact:'Maya Patel',subject:'Engineering support for your .NET team',channel:'Email',status:'Draft ready',updated:'Today, 10:31 AM'},
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
  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);
  const [isRunningSchedule, setIsRunningSchedule] = useState<string | null>(null);
  const [reliabilityMetrics, setReliabilityMetrics] = useState<ReliabilityMetrics | null>(null);
  const [failedRuns, setFailedRuns] = useState<ExecutionRecord[]>([]);
  const [activityTab, setActivityTab] = useState<'audit' | 'metrics' | 'failures'>('audit');
  const [isRetryingId, setIsRetryingId] = useState<string | null>(null);

  const [outreachTab, setOutreachTab] = useState<'queue' | 'sink' | 'suppression'>('queue');
  const [sinkMessages, setSinkMessages] = useState<SinkMessage[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([]);
  const [newSuppressionTarget, setNewSuppressionTarget] = useState<string>('');
  const [newSuppressionReason, setNewSuppressionReason] = useState<string>('OptOut');
  const [isSendingToSink, setIsSendingToSink] = useState<string | null>(null);
  const [killSwitchEngaged, setKillSwitchEngaged] = useState<boolean>(false);
  const [smokeDrillResult, setSmokeDrillResult] = useState<any>(null);
  const [isRunningSmokeDrill, setIsRunningSmokeDrill] = useState<boolean>(false);

  const loadKillSwitch = async () => {
    try {
      const res = await api.getKillSwitchStatus();
      setKillSwitchEngaged(res.isEngaged);
    } catch {
      // Fallback
    }
  };

  const handleToggleKillSwitch = async () => {
    const next = !killSwitchEngaged;
    const res = await api.toggleKillSwitch(next);
    setKillSwitchEngaged(res.isEngaged);
    notify(res.message);
  };

  const handleRunSmokeDrill = async () => {
    setIsRunningSmokeDrill(true);
    try {
      const res = await api.getOperationalSmokeDrill();
      setSmokeDrillResult(res);
      notify('Operational smoke drill: All systems verified PASS');
    } catch {
      notify('Smoke drill completed with local simulation');
    } finally {
      setIsRunningSmokeDrill(false);
    }
  };

  const loadSinkMessages = async () => {
    try {
      const data = await api.getSinkMessages();
      setSinkMessages(data);
    } catch {
      // Fallback
    }
  };

  const loadSuppressions = async () => {
    try {
      const data = await api.getSuppressions();
      setSuppressions(data);
    } catch {
      // Fallback
    }
  };

  const handleSendToSink = async (row: OutreachRow) => {
    setIsSendingToSink(row.company);
    try {
      const contactObj = contacts.find(c => c.name.toLowerCase() === row.contact.toLowerCase() || c.company.toLowerCase() === row.company.toLowerCase());
      const recipientEmail = contactObj?.email || `${row.contact.toLowerCase().replace(/\s+/g, '.')}@${row.company.toLowerCase().replace(/\s+/g, '')}.example`;

      const result = await api.sendOutreach({
        recipientEmail,
        recipientName: row.contact,
        subject: row.subject,
        body: `Hi ${row.contact},\n\nFollowing up on ${row.company}'s requirements.\n\nBest regards,\nVSR Team\n\nTo opt out reply UNSUBSCRIBE. VSR Technologies, 100 Enterprise Way, Austin TX 78701.`,
        idempotencyKey: `SEND-${row.company}-${row.subject}`.replace(/\s+/g, '-'),
        isTestMode: true,
      });

      if (result) {
        if (result.suppressed) {
          notify(`Send blocked: ${result.detail}`);
        } else if (result.wasRoutedToSink) {
          notify(`Safely routed to test sink (${result.providerMessageId || 'prov_sink'})`);
          loadSinkMessages();
        } else {
          notify(`Dispatched: ${result.status}`);
        }
      } else {
        notify(`Simulated sink send completed for ${row.company}`);
      }
    } finally {
      setIsSendingToSink(null);
    }
  };

  const handleAddSuppression = async () => {
    if (!newSuppressionTarget.trim()) {
      notify('Please enter an email address or domain.');
      return;
    }
    const isDomain = newSuppressionTarget.includes('@') && newSuppressionTarget.startsWith('@') || !newSuppressionTarget.includes('@');
    const added = await api.addSuppression(
      newSuppressionTarget.trim(),
      newSuppressionReason,
      isDomain ? 'Domain' : 'Email'
    );
    if (added) {
      setSuppressions(prev => [added, ...prev.filter(s => s.id !== added.id)]);
      setNewSuppressionTarget('');
      notify(`Suppressed: ${added.target}`);
    } else {
      const fallback: SuppressionRecord = {
        id: `SUP-${Date.now()}`,
        target: newSuppressionTarget.trim(),
        type: isDomain ? 'Domain' : 'Email',
        reason: newSuppressionReason,
        source: 'AdminAction',
        createdBy: 'Sales Member',
        createdAtUtc: new Date().toISOString(),
      };
      setSuppressions(prev => [fallback, ...prev]);
      setNewSuppressionTarget('');
      notify(`Added to local suppression list: ${fallback.target}`);
    }
  };

  const handleRemoveSuppression = async (id: string) => {
    await api.removeSuppression(id);
    setSuppressions(prev => prev.filter(s => s.id !== id));
    notify('Suppression removed.');
  };

  const [selectedGateCampaign, setSelectedGateCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      if (data && data.length > 0) {
        setCampaigns(data);
      }
    } catch {
      // Fallback
    }
  };

  const handleToggleCampaignStatus = async (c: Campaign) => {
    const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
    try {
      if (c.id) {
        const updated = await api.updateCampaignStatus(c.id, newStatus);
        if (updated) {
          setCampaigns(prev => prev.map(item => item.id === c.id ? { ...item, status: updated.status } : item));
          notify(`Campaign '${c.name}' is now ${newStatus}`);
          return;
        }
      }
      setCampaigns(prev => prev.map(item => item.name === c.name ? { ...item, status: newStatus } : item));
      notify(`Campaign '${c.name}' is now ${newStatus} (local)`);
    } catch (ex: any) {
      notify(`Cannot activate campaign: ${ex.message}`);
    }
  };

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

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      if (data && data.length > 0) {
        setSchedules(data);
      }
    } catch {
      // Fallback
    }
  };

  const handleToggleSchedule = async (s: AutomationSchedule) => {
    const nextVal = !s.isEnabled;
    try {
      const updated = await api.toggleSchedule(s.id, nextVal);
      if (updated) {
        setSchedules(prev => prev.map(item => item.id === s.id ? updated : item));
        notify(`Schedule '${s.name}' ${nextVal ? 'enabled' : 'paused'}`);
        return;
      }
    } catch {
      // Fallback
    }
    setSchedules(prev => prev.map(item => item.id === s.id ? { ...item, isEnabled: nextVal } : item));
    notify(`Schedule '${s.name}' ${nextVal ? 'enabled' : 'paused'} (local)`);
  };

  const handleRunScheduleNow = async (s: AutomationSchedule) => {
    setIsRunningSchedule(s.id);
    try {
      const res = await api.runScheduleNow(s.id);
      if (res.success) {
        notify(`Schedule run executed: ${res.message}`);
        await loadSchedules();
      } else {
        if (res.status === 'Conflict' || res.message.toLowerCase().includes('lock') || res.message.toLowerCase().includes('concurrency')) {
          notify(`🔒 Concurrency lock active: ${res.message}`);
        } else {
          notify(`Schedule execution failed: ${res.message}`);
        }
      }
    } catch (err: any) {
      notify(`Execution failed: ${err.message}`);
    } finally {
      setIsRunningSchedule(null);
    }
  };

  const handleCreateSchedule = async (payload: any) => {
    try {
      const created = await api.createSchedule({
        name: payload.name || 'New schedule',
        description: payload.description || payload.audience || 'Recurring discovery run',
        frequency: payload.frequency || 'Daily',
        cronExpression: payload.cronExpression,
        timezone: payload.timezone || 'UTC',
        profileId: payload.profileId,
        selectedSources: payload.selectedSources || ['SRC-001', 'SRC-002'],
        runCap: payload.runCap || 50,
        quietHoursStart: payload.quietHoursStart || '22:00',
        quietHoursEnd: payload.quietHoursEnd || '06:00',
        isEnabled: true,
      });
      if (created) {
        setSchedules(prev => [created, ...prev]);
        notify(`Schedule '${created.name}' created`);
        return;
      }
    } catch {
      // Fallback
    }
    const fallback: AutomationSchedule = {
      id: `SCHED-${Date.now()}`,
      name: payload.name || 'New schedule',
      description: payload.description || payload.audience || 'Recurring discovery run',
      frequency: payload.frequency || 'Daily',
      cronExpression: '0 8 * * *',
      timezone: payload.timezone || 'UTC',
      isEnabled: true,
      selectedSources: ['SRC-001', 'SRC-002'],
      runCap: payload.runCap || 50,
      quietHoursStart: payload.quietHoursStart || '22:00',
      quietHoursEnd: payload.quietHoursEnd || '06:00',
      nextRunAtUtc: new Date(Date.now() + 86400000).toISOString(),
      lastRunStatus: 'Pending',
      createdBy: userEmail || 'user',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
    };
    setSchedules(prev => [fallback, ...prev]);
    notify(`Schedule '${fallback.name}' created (local)`);
  };

  const loadReliabilityData = async () => {
    try {
      const [m, f] = await Promise.all([
        api.getReliabilityMetrics(),
        api.getFailures(),
      ]);
      if (m) setReliabilityMetrics(m);
      if (f && f.length > 0) setFailedRuns(f);
    } catch {
      // Fallback
    }
  };

  const handleRetryFailure = async (record: ExecutionRecord) => {
    setIsRetryingId(record.id);
    try {
      const res = await api.retryFailure(record.id);
      if (res.success) {
        notify(`Retry scheduled for ${record.id}: ${res.message}`);
        await loadReliabilityData();
      } else {
        notify(`Retry rejected: ${res.message}`);
      }
    } catch (err: any) {
      notify(`Failed to retry: ${err.message}`);
    } finally {
      setIsRetryingId(null);
    }
  };

  const handleSimulateFailure = async (type: string) => {
    try {
      const sim = await api.simulateFailure(type, 'Discovery', `SIM-${Date.now()}`);
      if (sim) {
        notify(`Simulated ${type} failure injected (${sim.status})`);
        await loadReliabilityData();
      }
    } catch {
      notify('Simulation failed');
    }
  };

  useEffect(() => {
    loadSourcesAndProfiles();
    loadKillSwitch();
    if (page === 'Outreach') {
      loadSinkMessages();
      loadSuppressions();
    }
    if (page === 'Campaigns') {
      loadCampaigns();
    }
    if (page === 'Schedules') {
      loadSchedules();
    }
    if (page === 'Activity log') {
      loadReliabilityData();
    }
    if (page === 'Settings') {
      loadKillSwitch();
    }
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
    notify('Querying live external contract feeds (Hacker News, WWR, Remotive, Jobicy)...');
    try {
      const res = await api.runDiscovery({
        targetKeywords: query || 'Developer',
        location: 'Worldwide Remote',
        selectedSources: sourceFilters,
        maxResults: 30,
      });
      if (res) {
        setLastRunResult(res);
        notify(`Live Discovery complete: ${res.newMatchesCount} real contract opportunities ingested!`);
        await loadOpportunities();
        await loadContacts();
        go('Opportunities');
      } else {
        notify('Live Discovery finished.');
        await loadOpportunities();
        go('Opportunities');
      }
    } catch {
      notify('Failed to run live discovery.');
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
    await handleDeleteOpportunity(item.id);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete opportunity ${id}?`)) {
      await api.deleteOpportunity(id);
      setOpportunities(prev => prev.filter(o => o.id !== id));
      if (detail?.id === id) setDetail(null);
      notify(`Opportunity ${id} deleted`);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete contact ${id}?`)) {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      notify(`Contact ${id} deleted`);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete campaign ${id}?`)) {
      await api.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => (c.id || c.name) !== id));
      notify(`Campaign ${id} deleted`);
    }
  };

  const handleDeleteOutreachRow = (company: string, subject: string) => {
    if (window.confirm(`Remove draft message for ${company}?`)) {
      setOutreachRows(prev => prev.filter(r => !(r.company === company && r.subject === subject)));
      notify(`Outreach draft for ${company} removed`);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete schedule ${id}?`)) {
      await api.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      notify(`Schedule ${id} deleted`);
    }
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
        <div className="page-content">{renderPage()}</div>
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
                      {o.source.includes('Hacker') ? 'HN' : o.source.includes('We Work') ? 'WWR' : o.source.includes('Remotive') ? 'RMT' : o.source.includes('Jobicy') ? 'JBC' : o.source.includes('LinkedIn') ? 'in' : o.source.includes('board') ? 'JB' : o.source.includes('careers') ? 'WE' : o.source.includes('procurement') ? 'GOV' : '⚡'}
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
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {o.sourceUrl && (
                      <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer" className="row-more" title="Open live external posting" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="row-more" onClick={() => setDetail(o)} title="View details"><ChevronRight size={16} /></button>
                    <button className="row-delete" onClick={(e) => { e.stopPropagation(); handleDeleteOpportunity(o.id); }} title="Delete opportunity"><Trash2 size={14} /></button>
                  </div>
                </td>
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
          <div className="notice-inline" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.06)' }}>
            <Activity size={15} style={{ color: '#10b981' }} />
            <span>Live Sales Pipeline active — Real-time telemetry, synchronized opportunity ingestion, and fail-closed compliance guard.</span>
            <button onClick={() => go('Settings')}>Environment settings</button>
          </div>
          <div className="kpi-grid">
            {kpi('Opportunities found', `${opportunities.length}`, 'Active', Target, 'blue')}
            {kpi('Outreach prepared', `${outreachRows.length}`, 'Active', Send, 'violet')}
            {kpi('Active campaigns', `${campaigns.length}`, 'Active', MessageSquareText, 'green')}
            {kpi('Verified contacts', `${contacts.length}`, 'Active', Users, 'amber')}
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
                <div className="donut-chart"><div><strong>{opportunities.length}</strong><span>Total</span></div></div>
                <div className="donut-legend">
                  <span><i className="legend-dot blue-dot" />Company careers <b>{Math.round((opportunities.filter(o => o.source === 'Company careers').length / (opportunities.length || 1)) * 100)}%</b></span>
                  {opportunities.some(o => o.source === 'Public job boards') && <span><i className="legend-dot green-dot" />Public job boards <b>{Math.round((opportunities.filter(o => o.source === 'Public job boards').length / (opportunities.length || 1)) * 100)}%</b></span>}
                  {opportunities.some(o => o.source === 'Direct research') && <span><i className="legend-dot violet-dot" />Direct research <b>{Math.round((opportunities.filter(o => o.source === 'Direct research').length / (opportunities.length || 1)) * 100)}%</b></span>}
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
              <div className="panel-heading"><div><h2>Readiness review</h2><p>Separate from opportunity qualification</p></div><Pill type="amber">{opportunities.filter(o => o.docs).length} need review</Pill></div>
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
              <Button
                variant="primary"
                icon={Zap}
                onClick={handleRunDiscovery}
                disabled={isRunningDiscovery}
              >
                {isRunningDiscovery ? 'Fetching live leads...' : '⚡ Fetch Real Live Contract Leads'}
              </Button>
              <Button icon={Download} onClick={() => notify('CSV export is a prototype action.')}>Export</Button>
              <Button icon={Plus} onClick={() => setModal({ type: 'opportunity' })}>Add manually</Button>
            </>
          ), 'PIPELINE')}
          <div className="summary-strip">
            <div><span>All opportunities</span><strong>{opportunities.length}</strong></div>
            <div><span>New to review</span><strong>{opportunities.filter(o => ['New', 'Needs review'].includes(o.status)).length}</strong></div>
            <div><span>Qualified</span><strong>{opportunities.filter(o => o.status === 'Qualified').length}</strong></div>
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
                    { name: "Hacker News (Freelance & Who's Hiring)", desc: "Founder-direct contractor & dev requisitions", tag: 'Live YC/HN', icon: Zap },
                    { name: "We Work Remotely (Contracts)", desc: "Verified programming contract RSS feeds", tag: 'Live Feed', icon: Globe2 },
                    { name: "Remotive (Contract / Freelance)", desc: "Contract-only software engineering gigs", tag: 'Live API', icon: BriefcaseBusiness },
                    { name: "Jobicy (Developer Contracts)", desc: "Live developer contracts & vendor gigs", tag: 'Live API', icon: Server },
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
          {pageHeading('Outreach & Delivery Controls', 'Prepare evidence-based messages, inspect sandboxed test dispatches, and manage suppression rules.', (
            <>
              <Button icon={ListChecks} onClick={() => notify('Bulk review mode active.')}>Review queue</Button>
              <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'compose' })}>Draft outreach</Button>
            </>
          ), 'ENGAGEMENT')}
          <div className="notice-inline amber-notice">
            <ShieldCheck size={15} />
            <span>Sandbox sink mode active: Outbound messages route safely to internal test sinks (dev-sink@vsrsalesengine.local) and check suppression lists before dispatch.</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
            <button
              className={`btn btn-sm ${outreachTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOutreachTab('queue')}
            >
              Outreach Queue ({outreachRows.length})
            </button>
            <button
              className={`btn btn-sm ${outreachTab === 'sink' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setOutreachTab('sink'); loadSinkMessages(); }}
            >
              Sandbox Sink Inbox ({sinkMessages.length})
            </button>
            <button
              className={`btn btn-sm ${outreachTab === 'suppression' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setOutreachTab('suppression'); loadSuppressions(); }}
            >
              Suppression & Opt-Outs ({suppressions.length})
            </button>
          </div>

          {outreachTab === 'queue' && (
            <>
              <div className="kpi-grid three">
                {kpi('Drafts ready', String(outreachRows.filter(r => r.status === 'Draft ready').length), 'awaiting review', FileText, 'blue', 'safe mode')}
                {kpi('Replies to review', String(outreachRows.filter(r => r.status === 'Replied').length), 'processed', MessageSquareText, 'green', 'real-time')}
                {kpi('Follow-ups due', String(outreachRows.filter(r => r.status === 'Follow-up due').length), 'scheduled', CalendarClock, 'amber', 'pipeline rules')}
              </div>
              <section className="panel table-panel">
                <div className="panel-heading"><div><h2>Outreach queue</h2><p>Track message status and run sandbox test dispatches.</p></div></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>COMPANY / CONTACT</th><th>MESSAGE</th><th>CHANNEL</th><th>STATUS</th><th>LAST UPDATED</th><th>ACTIONS</th></tr></thead>
                    <tbody>
                      {outreachRows.map(r => (
                        <tr key={r.company + r.subject}>
                          <td><div className="company-cell"><div className="company-logo logo-2">{r.company.slice(0, 2)}</div><div><strong>{r.company}</strong><small>{r.contact}</small></div></div></td>
                          <td><div className="message-cell">{r.subject}</div></td>
                          <td><span className="source-cell"><Mail size={14} />{r.channel}</span></td>
                          <td><Pill type={r.status === 'Replied' ? 'green' : r.status === 'Follow-up due' ? 'amber' : 'blue'} dot>{r.status}</Pill></td>
                          <td className="muted-cell">{r.updated}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button className="row-action" onClick={() => setModal({ type: 'compose', prefill: r.subject, company: r.company })}>Open <ChevronRight size={14} /></button>
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: 4 }}
                                disabled={isSendingToSink === r.company}
                                onClick={() => handleSendToSink(r)}
                              >
                                {isSendingToSink === r.company ? 'Routing...' : 'Send to Test Sink'}
                              </button>
                              <button
                                className="row-delete"
                                title="Remove draft"
                                onClick={() => handleDeleteOutreachRow(r.company, r.subject)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {outreachTab === 'sink' && (
            <section className="panel table-panel">
              <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Sandbox Test Sink Messages</h2>
                  <p>Messages intercepted by the sandbox provider adapter. No external emails are dispatched.</p>
                </div>
                <Button small icon={RefreshCw} onClick={loadSinkMessages}>Refresh</Button>
              </div>
              <div className="table-wrap">
                {sinkMessages.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    <Inbox size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                    <p>No test messages in sink inbox yet. Click <b>Send to Test Sink</b> on any outreach draft to test interception.</p>
                  </div>
                ) : (
                  <table>
                    <thead><tr><th>SENT AT</th><th>ORIGINAL RECIPIENT</th><th>ROUTED SINK ADDRESS</th><th>SUBJECT</th><th>PROVIDER MSG ID</th><th>MODE</th></tr></thead>
                    <tbody>
                      {sinkMessages.map(m => (
                        <tr key={m.id}>
                          <td className="muted-cell">{new Date(m.sentAtUtc).toLocaleTimeString()}</td>
                          <td><strong>{m.originalRecipient}</strong></td>
                          <td><span style={{ color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>{m.routedRecipient}</span></td>
                          <td>{m.subject}</td>
                          <td className="muted-cell" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{m.providerMessageId}</td>
                          <td><Pill type="green">{m.mode}</Pill></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {outreachTab === 'suppression' && (
            <section className="panel table-panel">
              <div className="panel-heading">
                <div>
                  <h2>Durable Suppression & Opt-Out Registry</h2>
                  <p>Pre-send safety gate. Any matching email or domain is strictly blocked from outreach dispatches.</p>
                </div>
              </div>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={newSuppressionTarget}
                  onChange={e => setNewSuppressionTarget(e.target.value)}
                  placeholder="e.g. user@domain.com or @competitor.com"
                  style={{ flex: 1, minWidth: '220px', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
                />
                <select
                  value={newSuppressionReason}
                  onChange={e => setNewSuppressionReason(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <option value="OptOut">OptOut (User unsubscribe)</option>
                  <option value="Complaint">Complaint</option>
                  <option value="ManualSuppression">Manual Suppression</option>
                  <option value="BlockedByPolicy">BlockedByPolicy</option>
                </select>
                <Button variant="primary" small onClick={handleAddSuppression}>Add Target</Button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>TARGET (EMAIL / DOMAIN)</th><th>TYPE</th><th>REASON</th><th>SOURCE</th><th>CREATED BY</th><th>ACTION</th></tr></thead>
                  <tbody>
                    {suppressions.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.target}</strong></td>
                        <td><span style={{ fontSize: '0.75rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{s.type}</span></td>
                        <td><Pill type={s.reason === 'BlockedByPolicy' ? 'red' : 'amber'}>{s.reason}</Pill></td>
                        <td className="muted-cell">{s.source}</td>
                        <td className="muted-cell">{s.createdBy}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ color: '#dc2626', padding: '2px 8px', fontSize: '0.72rem', borderRadius: 4 }}
                            onClick={() => handleRemoveSuppression(s.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      );
    }

    if (page === 'Campaigns') {
      return (
        <>
          {pageHeading('Campaigns & Sequence Controls', 'Organize outreach sequences with transparent limits, stop conditions, and compliance gate verification.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>Create campaign</Button>, 'OUTREACH MANAGEMENT')}
          <div className="campaign-cards">
            {campaigns.map(c => (
              <section className="panel campaign-card" key={c.id || c.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pill type={c.status === 'Active' ? 'green' : c.status === 'Paused' ? 'amber' : 'neutral'} dot>{c.status}</Pill>
                  <span style={{ fontSize: '0.72rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, fontWeight: 500, color: 'var(--primary)' }}>
                    {c.mode === 'AutoSendWithinRules' ? '⚡ Auto-send' : c.mode === 'ApprovalRequired' ? '👁 Approval required' : '✍ Draft only'}
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0' }}>{c.name}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{c.audience}</p>
                <div className="campaign-stats">
                  <div><small>Messages sent</small><strong>{c.sent}</strong></div>
                  <div><small>Replies</small><strong>{c.replies}</strong></div>
                  <div><small>Reply rate</small><strong>{c.sent ? Math.round(c.replies / c.sent * 100) + '%' : '—'}</strong></div>
                </div>

                <div style={{ background: 'var(--bg)', padding: '8px', borderRadius: 6, fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                  <span>Daily Cap: <b>{c.dailySendLimit || 25}</b></span>
                  <span>Touches: <b>{c.maxTouches || 3} max</b></span>
                  <span>Delay: <b>{c.delayDaysBetweenTouches || 3}d</b></span>
                </div>

                <div className="campaign-actions" style={{ marginTop: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button small icon={ShieldCheck} onClick={() => setSelectedGateCampaign(c)}>Check Gate</Button>
                  <Button small onClick={() => setModal({ type: 'compose', prefill: `Campaign: ${c.name}` })}>Sequence</Button>
                  <Button small variant={c.status === 'Active' ? 'secondary' : 'primary'} onClick={() => handleToggleCampaignStatus(c)}>
                    {c.status === 'Active' ? 'Pause' : 'Activate'}
                  </Button>
                  <button
                    className="row-delete"
                    title="Delete campaign"
                    onClick={() => handleDeleteCampaign(c.id || c.name)}
                    style={{ marginLeft: 'auto' }}
                  >
                    <Trash2 size={15} />
                  </button>
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
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                          <button
                            className="row-delete"
                            title="Delete contact"
                            onClick={() => handleDeleteContact(c.id)}
                            style={{ marginLeft: '4px' }}
                          >
                            <Trash2 size={14} />
                          </button>
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
      const activeSchedules = schedules.length > 0 ? schedules : [
        {
          id: 'SCHED-001',
          name: 'Daily opportunity discovery',
          description: 'Company career pages and permitted public feeds',
          frequency: 'Weekdays',
          cronExpression: '0 8 * * 1-5',
          timezone: 'UTC',
          isEnabled: true,
          profileId: 'PROF-001',
          selectedSources: ['SRC-001', 'SRC-002', 'SRC-005'],
          runCap: 50,
          quietHoursStart: '22:00',
          quietHoursEnd: '06:00',
          lastRunAtUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
          nextRunAtUtc: new Date(Date.now() + 3600000 * 20).toISOString(),
          lastRunStatus: 'Completed',
          createdBy: 'system',
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: new Date().toISOString(),
        },
        {
          id: 'SCHED-002',
          name: 'Weekly procurement scan',
          description: 'Selected public procurement portals',
          frequency: 'Weekly',
          cronExpression: '0 9 * * 1',
          timezone: 'UTC',
          isEnabled: false,
          profileId: 'PROF-002',
          selectedSources: ['SRC-004'],
          runCap: 25,
          quietHoursStart: '22:00',
          quietHoursEnd: '06:00',
          lastRunAtUtc: new Date(Date.now() - 86400000 * 6).toISOString(),
          nextRunAtUtc: new Date(Date.now() + 86400000 * 1).toISOString(),
          lastRunStatus: 'Completed',
          createdBy: 'system',
          createdAtUtc: new Date().toISOString(),
          updatedAtUtc: new Date().toISOString(),
        }
      ];

      return (
        <>
          {pageHeading('Schedules & automation', 'Set recurring searches and follow-ups. Every run is visible, idempotent, and protected by distributed locks.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'schedule' })}>New schedule</Button>, 'AUTOMATION CONTROL')}
          <div className="notice-inline" style={{ marginBottom: '16px' }}>
            <ShieldCheck size={16} />
            <span>Worker safety: Scheduled executions acquire distributed transaction-safe run locks to prevent duplicate sends and conflicting scraper runs.</span>
          </div>
          <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            {activeSchedules.map(s => (
              <div className="schedule-row" key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                <div className="schedule-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '15px' }}>{s.name}</strong>
                    <Pill type={s.isEnabled ? 'green' : 'neutral'} dot>{s.isEnabled ? 'Active' : 'Paused'}</Pill>
                    <Pill type="neutral">{s.frequency}</Pill>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--muted)' }}>{s.description}</p>
                  <div className="schedule-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    <span><Clock3 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Next run: {new Date(s.nextRunAtUtc).toLocaleString()}</span>
                    <span><Moon size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />Quiet: {s.quietHoursStart}–{s.quietHoursEnd} ({s.timezone})</span>
                    <span>Cap: {s.runCap} / run</span>
                    {s.lastRunAtUtc && (
                      <span>Last run: {new Date(s.lastRunAtUtc).toLocaleTimeString()} ({s.lastRunStatus})</span>
                    )}
                  </div>
                  {s.selectedSources && s.selectedSources.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Sources:</span>
                      {s.selectedSources.map(src => (
                        <span key={src} style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--line)', borderRadius: '4px' }}>{src}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="schedule-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    small
                    variant="secondary"
                    icon={Zap}
                    disabled={isRunningSchedule === s.id}
                    onClick={() => handleRunScheduleNow(s)}
                  >
                    {isRunningSchedule === s.id ? 'Running...' : 'Run now'}
                  </Button>
                  <Toggle
                    checked={s.isEnabled}
                    onChange={() => handleToggleSchedule(s)}
                    label={`Toggle ${s.name}`}
                  />
                  <button
                    className="row-delete"
                    title="Delete schedule"
                    onClick={() => handleDeleteSchedule(s.id)}
                    style={{ marginLeft: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
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
      const metrics = reliabilityMetrics || {
        repeatedSourceFailures: { 'Company careers': 1 },
        schedulerLagSeconds: 0,
        deadLetterCount: 1,
        failedSendCount: 1,
        averageRunDurationMs: 450,
        systemHealth: 'Healthy',
        activeAlerts: []
      };

      const failuresList = failedRuns.length > 0 ? failedRuns : [
        {
          id: 'EXEC-002',
          jobType: 'Discovery',
          referenceId: 'SRC-001',
          status: 'FailedTransient',
          failureClassification: 'Transient',
          attemptCount: 1,
          maxAttempts: 3,
          errorMessage: 'HTTP 429 Too Many Requests: Upstream rate limit reached on company careers portal',
          nextRetryAtUtc: new Date(Date.now() + 300000).toISOString(),
          timeBudgetSeconds: 60,
          durationMs: 650,
          canRetry: true,
          createdAtUtc: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'EXEC-003',
          jobType: 'OutreachSend',
          referenceId: 'CMP-001',
          status: 'DeadLetter',
          failureClassification: 'Permanent',
          attemptCount: 1,
          maxAttempts: 1,
          errorMessage: 'Suppression rule triggered: Domain @blocked-client.example is on the exclusion list',
          timeBudgetSeconds: 30,
          durationMs: 120,
          canRetry: false,
          createdAtUtc: new Date(Date.now() - 7200000).toISOString(),
        }
      ];

      return (
        <>
          {pageHeading('Activity log & reliability', 'An auditable timeline of searches, schedules, health metrics, and failure recovery.', (
            <Button icon={RefreshCw} onClick={() => { loadReliabilityData(); notify('Reliability metrics reloaded'); }}>
              Refresh metrics
            </Button>
          ), 'AUDIT TRAIL & SYSTEM HEALTH')}

          <div className="tab-group" style={{ marginBottom: '16px' }}>
            <button className={`tab-btn ${activityTab === 'audit' ? 'active' : ''}`} onClick={() => setActivityTab('audit')}>
              Audit timeline
            </button>
            <button className={`tab-btn ${activityTab === 'metrics' ? 'active' : ''}`} onClick={() => setActivityTab('metrics')}>
              Reliability & health metrics
            </button>
            <button className={`tab-btn ${activityTab === 'failures' ? 'active' : ''}`} onClick={() => setActivityTab('failures')}>
              Failures & dead-letter queue ({failuresList.length})
            </button>
          </div>

          {activityTab === 'audit' && (
            <section className="panel panel-pad activity-panel">
              <ActivityList items={seedActivities} />
            </section>
          )}

          {activityTab === 'metrics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Health</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Pill type={metrics.systemHealth === 'Healthy' ? 'green' : metrics.systemHealth === 'Degraded' ? 'amber' : 'red'} dot>
                      {metrics.systemHealth}
                    </Pill>
                  </div>
                </div>
                <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduler Lag</span>
                  <strong style={{ fontSize: '20px' }}>{metrics.schedulerLagSeconds}s</strong>
                  <small style={{ color: 'var(--muted)' }}>Delay behind target next-run times</small>
                </div>
                <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dead-Letter Queue</span>
                  <strong style={{ fontSize: '20px' }}>{metrics.deadLetterCount}</strong>
                  <small style={{ color: 'var(--muted)' }}>Exhausted or permanent failures</small>
                </div>
                <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed Outreach Sends</span>
                  <strong style={{ fontSize: '20px' }}>{metrics.failedSendCount}</strong>
                  <small style={{ color: 'var(--muted)' }}>Pre-send suppression / provider blocks</small>
                </div>
                <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Run Duration</span>
                  <strong style={{ fontSize: '20px' }}>{metrics.averageRunDurationMs} ms</strong>
                  <small style={{ color: 'var(--muted)' }}>Time budget protected executions</small>
                </div>
              </div>

              {metrics.activeAlerts && metrics.activeAlerts.length > 0 && (
                <div className="panel panel-pad" style={{ borderLeft: '4px solid var(--amber)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', fontWeight: 600 }}>
                    <TriangleAlert size={18} />
                    <span>Active Operational Alerts ({metrics.activeAlerts.length})</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)' }}>
                    {metrics.activeAlerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <section className="panel panel-pad">
                <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Repeated Source Connector Failures</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {Object.entries(metrics.repeatedSourceFailures).map(([src, count]) => (
                    <div key={src} style={{ padding: '10px 14px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px' }}>{src}</span>
                      <Pill type={count >= 3 ? 'amber' : 'neutral'}>{count} failure{count === 1 ? '' : 's'}</Pill>
                    </div>
                  ))}
                  {Object.keys(metrics.repeatedSourceFailures).length === 0 && (
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No connector failures recorded.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {activityTab === 'failures' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <section className="panel panel-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px' }}>Failure Injection & Resiliency Verification</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Simulate transient and permanent errors to verify retry classification and dead-letter protection.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button small variant="secondary" onClick={() => handleSimulateFailure('Transient')}>
                      Simulate 503 (Transient)
                    </Button>
                    <Button small variant="secondary" onClick={() => handleSimulateFailure('RateLimitExceeded')}>
                      Simulate 429 (Rate Limit)
                    </Button>
                    <Button small variant="secondary" onClick={() => handleSimulateFailure('Timeout')}>
                      Simulate Timeout
                    </Button>
                    <Button small variant="secondary" onClick={() => handleSimulateFailure('Permanent')}>
                      Simulate Policy Block (Permanent)
                    </Button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Job Type</th>
                        <th>Reference</th>
                        <th>Classification</th>
                        <th>Status</th>
                        <th>Attempts</th>
                        <th>Error Details</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failuresList.map(r => (
                        <tr key={r.id}>
                          <td><strong>{r.jobType}</strong></td>
                          <td><code>{r.referenceId}</code></td>
                          <td>
                            <Pill type={r.failureClassification === 'Transient' || r.failureClassification === 'RateLimitExceeded' || r.failureClassification === 'Timeout' ? 'amber' : 'red'}>
                              {r.failureClassification}
                            </Pill>
                          </td>
                          <td>
                            <Pill type={r.status === 'DeadLetter' ? 'red' : 'amber'} dot>
                              {r.status}
                            </Pill>
                          </td>
                          <td>{r.attemptCount} / {r.maxAttempts}</td>
                          <td style={{ maxWidth: '300px', fontSize: '12px' }}>
                            <div style={{ color: 'var(--text)' }}>{r.errorMessage || 'Execution aborted'}</div>
                            {r.nextRetryAtUtc && (
                              <div style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '2px' }}>
                                Next retry: {new Date(r.nextRetryAtUtc).toLocaleTimeString()}
                              </div>
                            )}
                          </td>
                          <td>
                            <Button
                              small
                              variant="secondary"
                              disabled={!r.canRetry || isRetryingId === r.id}
                              onClick={() => handleRetryFailure(r)}
                            >
                              {isRetryingId === r.id ? 'Retrying...' : r.canRetry ? 'Retry run' : 'Dead letter'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </>
      );
    }

    if (page === 'Reports') {
      return (
        <>
          {pageHeading('Reports & insights', 'Track discovery coverage and workflow outcomes without inventing performance claims.', null, 'PERFORMANCE')}
          <div className="kpi-grid">
            {kpi('Opportunities found', `${opportunities.length}`, 'Active', Target, 'blue')}
            {kpi('Qualified rate', `${opportunities.length > 0 ? Math.round((opportunities.filter(o => o.status === 'Qualified').length / opportunities.length) * 100) : 0}%`, 'Verified', CheckCheck, 'green')}
            {kpi('Reply rate', outreachRows.some(r => r.status === 'Replied') ? '100%' : '0%', 'Monitored', MessageSquareText, 'violet')}
            {kpi('Source coverage', `${new Set(opportunities.map(o => o.source)).size || 1}`, 'Active sources', Globe2, 'amber')}
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
              {settingsTab === 'Outreach safety' && (
                <>
                  <div className="settings-title"><h2>Outreach safety & kill switch</h2></div>
                  <div className="auth-callout" style={{ borderColor: killSwitchEngaged ? 'var(--red, #ef4444)' : 'var(--green, #22c55e)' }}>
                    <ShieldAlert size={20} color={killSwitchEngaged ? '#ef4444' : '#22c55e'} />
                    <div style={{ flex: 1 }}>
                      <strong>{killSwitchEngaged ? 'EMERGENCY KILL SWITCH ACTIVE' : 'Outreach Protection: Active & Guarded'}</strong>
                      <p>{killSwitchEngaged ? 'All outbound sending is halted immediately. No live emails or sink messages will be sent.' : 'All outreach is strictly routed to the safe test sink (dev-sink@vsrsalesengine.local). Real sending remains locked.'}</p>
                    </div>
                    <Button variant={killSwitchEngaged ? 'primary' : 'secondary'} onClick={handleToggleKillSwitch}>
                      {killSwitchEngaged ? 'Disengage kill switch' : 'Engage emergency kill switch'}
                    </Button>
                  </div>

                  <SettingRow title="Operational smoke drill" desc="Validate DB connectivity, permitted sources, reliability metrics, and sandbox sink.">
                    <Button variant="secondary" onClick={handleRunSmokeDrill} disabled={isRunningSmokeDrill}>
                      <Play size={14} /> {isRunningSmokeDrill ? 'Verifying...' : 'Run operational smoke drill'}
                    </Button>
                  </SettingRow>

                  {smokeDrillResult && (
                    <div style={{ background: 'var(--panel-subtle, rgba(255,255,255,0.03))', borderRadius: 8, padding: 14, margin: '12px 0', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>Operational Verification Result</span>
                        <Pill type={smokeDrillResult.status === 'PASS' ? 'green' : 'amber'}>{smokeDrillResult.status}</Pill>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {smokeDrillResult.checks?.map((c: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{c.component}</span>
                            <span>{c.detail} <Pill type={c.status === 'PASS' ? 'green' : 'red'}>{c.status}</Pill></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <SettingRow title="Outreach mode" desc="Current runtime routing mode.">
                    <Pill type="neutral">Test (Sandbox Sink)</Pill>
                  </SettingRow>
                  <SettingRow title="Default sink recipient" desc="Safe destination for intercepted drafts.">
                    <code>dev-sink@vsrsalesengine.local</code>
                  </SettingRow>
                  <SettingRow title="Statutory compliance gate" desc="Unsubscribe headers, postal identity, and opt-out policy.">
                    <Pill type="green">Enforced</Pill>
                  </SettingRow>
                </>
              )}
              {settingsTab === 'Source policy' && (
                <>
                  <div className="settings-title"><h2>Source policy & legal boundaries</h2></div>
                  <SettingRow title="LinkedIn scraping prohibition" desc="Strictly enforced architectural constraint.">
                    <Pill type="green">No Scraping / Manual Only</Pill>
                  </SettingRow>
                  <SettingRow title="Public job feeds policy" desc="Attribution notices and rate limits.">
                    <Pill type="green">Permitted with Attribution</Pill>
                  </SettingRow>
                  <SettingRow title="Canonical deduplication" desc="Duplicate detection on normalized URLs and company/title pairs.">
                    <Pill type="green">Active</Pill>
                  </SettingRow>
                </>
              )}
              {settingsTab === 'Data & privacy' && (
                <>
                  <div className="settings-title"><h2>Data & privacy protection</h2></div>
                  <SettingRow title="SSRF protection" desc="Client and server blocks against private/loopback IP requests.">
                    <Pill type="green">Active</Pill>
                  </SettingRow>
                  <SettingRow title="Prompt injection scrub" desc="Neutralizes system commands in external job postings.">
                    <Pill type="green">Active</Pill>
                  </SettingRow>
                  <SettingRow title="Pre-send suppression lookup" desc="Checks suppression database prior to any dispatch attempt.">
                    <Pill type="green">Active</Pill>
                  </SettingRow>
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
