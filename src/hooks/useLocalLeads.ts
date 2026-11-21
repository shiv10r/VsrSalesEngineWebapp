import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services';
import type {
  ImportResult, ImportRow, LocalLead, LocalLeadOptions, LocalLeadPage, LocalLeadPatch,
  LocalLeadSummary, LocalLeadsLoadState, NewLocalLead, WriteResult,
} from '../types/localLeads';

interface UiLike {
  page: string;
  guestMode: boolean;
  notify: (msg: string) => void;
}

export interface LocalLeadFilters {
  district: string;
  category: string;
  status: string;
  noWebsite: boolean;
  q: string;
}

const NO_FILTERS: LocalLeadFilters = { district: '', category: '', status: '', noWebsite: false, q: '' };
const GUEST_MESSAGE = "Guests can't change leads. Sign in to edit.";
/** Changing these fields can move a lead to another cell of the district x category grid. */
const AFFECTS_SUMMARY: (keyof LocalLeadPatch)[] = ['category', 'district', 'website'];

export function useLocalLeads(ui: UiLike) {
  const enabled = ui.page === 'Local Leads';
  const [options, setOptions] = useState<LocalLeadOptions | null>(null);
  const [summary, setSummary] = useState<LocalLeadSummary | null>(null);
  const [list, setList] = useState<LocalLeadPage | null>(null);
  const [filters, setFilters] = useState<LocalLeadFilters>(NO_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loadState, setLoadState] = useState<LocalLeadsLoadState>('loading');
  const [tick, setTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const seq = useRef(0);
  const optionsRef = useRef<LocalLeadOptions | null>(null);
  optionsRef.current = options;

  // Debounce the search box so typing does not fire a request per key.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      setFilters(f => (f.q === next ? f : { ...f, q: next }));
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!enabled) return;
    const mine = ++seq.current;
    void (async () => {
      try {
        const [opt, sum, items] = await Promise.all([
          optionsRef.current ?? api.getLocalLeadOptions(),
          api.getLocalLeadSummary(),
          api.getLocalLeads({
            district: filters.district || undefined,
            category: filters.category || undefined,
            status: filters.status || undefined,
            hasWebsite: filters.noWebsite ? false : undefined,
            q: filters.q,
            page,
          }),
        ]);
        if (mine !== seq.current) return;
        setOptions(opt);
        setSummary(sum);
        setList(items);
        setLoadState('ready');
      } catch {
        if (mine !== seq.current) return;
        setLoadState(prev => {
          if (prev === 'ready') ui.notify("Couldn't refresh local leads. Showing the last data.");
          return prev === 'ready' ? 'ready' : 'error';
        });
      }
    })();
  }, [enabled, filters, page, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setTick(t => t + 1), []);
  const retry = useCallback(() => { setLoadState('loading'); setTick(t => t + 1); }, []);

  const setFilter = useCallback((patch: Partial<LocalLeadFilters>) => {
    setFilters(f => ({ ...f, ...patch }));
    setPage(1);
  }, []);
  const clearFilters = useCallback(() => { setFilters(NO_FILTERS); setSearchInput(''); setPage(1); }, []);
  /** Clicking the selected grid cell again clears the district and category filters. */
  const pickCell = useCallback((district: string, category: string) => {
    setFilters(f => (f.district === district && f.category === category
      ? { ...f, district: '', category: '' }
      : { ...f, district, category }));
    setPage(1);
  }, []);

  const replaceLead = (lead: LocalLead) =>
    setList(l => (l ? { ...l, items: l.items.map(i => (i.id === lead.id ? lead : i)) } : l));

  const update = async (lead: LocalLead, patch: LocalLeadPatch): Promise<boolean> => {
    if (ui.guestMode) { ui.notify(GUEST_MESSAGE); return false; }
    setBusyId(lead.id);
    replaceLead({ ...lead, ...patch } as LocalLead); // optimistic; rolled back below if the server says no
    const res = await api.updateLocalLead(lead.id, patch);
    setBusyId(null);
    if (res.ok) {
      replaceLead(res.value);
      if (AFFECTS_SUMMARY.some(k => k in patch)) reload();
      return true;
    }
    replaceLead(lead);
    ui.notify(res.message);
    if (res.reason === 'notFound') reload();
    return false;
  };

  const remove = async (lead: LocalLead): Promise<boolean> => {
    if (ui.guestMode) { ui.notify(GUEST_MESSAGE); return false; }
    setBusyId(lead.id);
    const res = await api.deleteLocalLead(lead.id);
    setBusyId(null);
    if (res.ok || res.reason === 'notFound') {
      ui.notify(`Deleted ${lead.businessName}.`);
      reload();
      return true;
    }
    ui.notify(res.message);
    return false;
  };

  const add = async (body: NewLocalLead): Promise<WriteResult<LocalLead>> => {
    const res = await api.createLocalLead(body);
    if (res.ok) { ui.notify(`Added ${res.value.businessName}.`); reload(); }
    return res;
  };

  const importRows = async (sourceLabel: string, rows: ImportRow[]): Promise<WriteResult<ImportResult>> => {
    const res = await api.importLocalLeads(sourceLabel, rows);
    if (res.ok) { ui.notify(`Imported ${res.value.imported} lead${res.value.imported === 1 ? '' : 's'}.`); reload(); }
    return res;
  };

  return {
    options, summary, list, filters, searchInput, setSearchInput, page, setPage, loadState, busyId,
    readOnly: ui.guestMode, setFilter, clearFilters, pickCell, retry, update, remove, add, importRows,
  };
}

export type LocalLeadsState = ReturnType<typeof useLocalLeads>;
