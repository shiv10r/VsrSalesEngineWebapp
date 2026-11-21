import { useState } from 'react';

export function useUiState() {
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

  const [settingsTab, setSettingsTab] = useState('General');
  const [dark, setDark] = useState(false);

  const [activityTab, setActivityTab] = useState<'audit' | 'metrics' | 'failures'>('audit');

  const [outreachTab, setOutreachTab] = useState<'queue' | 'sink' | 'suppression'>('queue');

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout((window as any).__vsrToastTimer);
    (window as any).__vsrToastTimer = window.setTimeout(() => setToast(''), 3000);
  };

  const go = (next: string) => { setPage(next); setMobileNav(false); setGlobalSearch(''); };

  return {
    page, setPage, guestMode, setGuestMode, userEmail, setUserEmail, globalSearch,
    setGlobalSearch, query, setQuery, sourceFilters, setSourceFilters, statusFilter,
    setStatusFilter, sourceFilter, setSourceFilter, activeTab, setActiveTab, modal, setModal,
    toast, setToast, mobileNav, setMobileNav, sidebarCollapsed, setSidebarCollapsed,
    scheduled, setScheduled, connected, setConnected, settingsTab, setSettingsTab, dark,
    setDark, activityTab, setActivityTab, outreachTab, setOutreachTab, notify, go,
  };
}

export type UiState = ReturnType<typeof useUiState>;
