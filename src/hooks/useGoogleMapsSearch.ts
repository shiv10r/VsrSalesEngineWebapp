import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services';
import type { LocalLead } from '../types/localLeads';
import type {
  LiveEntry, MapsForm, MapsSearchState, PlaceResult, PlacesStatus,
} from '../types/mapsSearch';

interface Options {
  /** True while the Maps panel is visible; the status is only fetched then. */
  active: boolean;
  guest: boolean;
  notify: (msg: string) => void;
  onSaved: () => void;
}

export const GUEST_MAPS_REASON = "Guests can't search Google Maps or save leads. Sign in to do that.";
const EMPTY_FORM: MapsForm = { district: '', category: '', query: '', maxResults: 10 };

export function useGoogleMapsSearch({ active, guest, notify, onSaved }: Options) {
  const [form, setForm] = useState<MapsForm>(EMPTY_FORM);
  const [status, setStatus] = useState<PlacesStatus | null>(null);
  const [statusState, setStatusState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [searchState, setSearchState] = useState<MapsSearchState>('idle');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searched, setSearched] = useState<{ query: string; district: string } | null>(null);
  const [saved, setSaved] = useState<Record<string, 'saving' | 'saved'>>({});
  const [live, setLive] = useState<Record<string, LiveEntry>>({});
  const seq = useRef(0);

  const loadStatus = useCallback(async () => {
    setStatusState('loading');
    try {
      setStatus(await api.getDiscoverStatus());
      setStatusState('ready');
    } catch {
      setStatusState('error');
    }
  }, []);

  useEffect(() => {
    if (active && statusState === 'idle') void loadStatus();
  }, [active, statusState, loadStatus]);

  const patchForm = useCallback((patch: Partial<MapsForm>) => setForm(f => ({ ...f, ...patch })), []);

  const search = async () => {
    if (guest) { notify(GUEST_MAPS_REASON); return; }
    if (!form.district) { setSearchError('Choose a district first.'); setSearchState('error'); return; }
    const mine = ++seq.current;
    setSearchState('loading');
    setSearchError(null);
    const res = await api.discoverPlaces({
      district: form.district,
      category: form.category || undefined,
      query: form.query.trim() || undefined,
      maxResults: form.maxResults,
    });
    if (mine !== seq.current) return;
    if (res.ok) {
      setResults(res.value.results);
      setSearched({ query: form.query.trim() || form.category, district: form.district });
      setStatus(s => (s ? { ...s, remainingToday: res.value.remainingToday } : s));
      setSearchState('ready');
      return;
    }
    if (res.reason === 'notConfigured') setStatus(s => ({ dailyCap: s?.dailyCap ?? 0, remainingToday: 0, configured: false }));
    if (res.reason === 'quota') setStatus(s => (s ? { ...s, remainingToday: 0 } : s));
    setResults([]);
    setSearchError(res.message);
    setSearchState('error');
  };

  const save = async (place: PlaceResult) => {
    if (guest) { notify(GUEST_MAPS_REASON); return; }
    setSaved(s => ({ ...s, [place.placeId]: 'saving' }));
    const res = await api.savePlace({
      placeId: place.placeId, name: place.name, district: place.district,
      category: place.suggestedCategory, mapsUrl: place.mapsUrl,
    });
    if (res.ok) {
      setSaved(s => ({ ...s, [place.placeId]: 'saved' }));
      notify(res.value.alreadySaved ? `${place.name} was already saved.` : `Saved ${place.name} as a lead.`);
      onSaved();
      return;
    }
    setSaved(s => { const { [place.placeId]: _drop, ...rest } = s; return rest; });
    notify(res.message);
  };

  const showLive = async (lead: LocalLead) => {
    setLive(l => ({ ...l, [lead.id]: { state: 'loading' } }));
    const res = await api.getLiveDetails(lead.id);
    setLive(l => ({
      ...l,
      [lead.id]: res.ok ? { state: 'ready', details: res.value } : { state: 'error', message: res.message },
    }));
  };

  const hideLive = (leadId: string) => setLive(l => { const { [leadId]: _drop, ...rest } = l; return rest; });

  return {
    form, patchForm, status, statusState, loadStatus, searchState, results, searchError, searched,
    saved, live, search, save, showLive, hideLive, guest,
  };
}

export type GoogleMapsSearch = ReturnType<typeof useGoogleMapsSearch>;
