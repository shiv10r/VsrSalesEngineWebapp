import { Search } from 'lucide-react';
import { GUEST_MAPS_REASON, type GoogleMapsSearch } from '../../hooks/useGoogleMapsSearch';
import type { LocalLeadOptions } from '../../types/localLeads';
import { MapsSetupCard } from './MapsSetupCard';
import { PlaceResultCard } from './PlaceResultCard';

export const MAPS_NOTE =
  "Results come live from Google's official Places API. Only the name, district, category and Maps link are saved.";

function blockedReason(maps: GoogleMapsSearch): string | null {
  const { status, statusState, form, guest } = maps;
  if (guest) return GUEST_MAPS_REASON;
  if (statusState === 'error') return "Can't reach the search service.";
  if (statusState !== 'ready' || !status) return 'Checking whether Google Maps search is set up.';
  if (!status.configured) return 'Google Maps search is not set up on the server yet.';
  if (status.remainingToday <= 0) return "Today's search limit is used up. It resets at midnight UTC.";
  if (!form.district) return 'Choose a district first.';
  return null;
}

export function MapsSearchPanel({ options, maps }: { options: LocalLeadOptions; maps: GoogleMapsSearch }) {
  const { form, patchForm, status, statusState, searchState, results, searchError, searched, saved, guest } = maps;
  const configured = status?.configured === true;
  const blocked = blockedReason(maps);

  return (
    <section className="ag-panel ms-panel" aria-label="Find businesses on Google Maps">
      <div className="ag-panel-h">
        <h2>Find on Google Maps</h2>
        {status && configured && (
          <span aria-live="polite">{status.remainingToday} of {status.dailyCap} searches left today</span>
        )}
      </div>
      <form className="ms-form" onSubmit={e => { e.preventDefault(); if (!blocked) void maps.search(); }}>
        <div className="ll-field">
          <label htmlFor="ms-district">District</label>
          <select id="ms-district" value={form.district} onChange={e => patchForm({ district: e.target.value })}>
            <option value="">Choose a district</option>
            {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="ll-field">
          <label htmlFor="ms-category">Category</label>
          <select id="ms-category" value={form.category} onChange={e => patchForm({ category: e.target.value })}>
            <option value="">Any category</option>
            {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="ll-field ms-grow">
          <label htmlFor="ms-query">What to look for (optional)</label>
          <input id="ms-query" type="search" value={form.query} maxLength={80} placeholder="e.g. interior designer"
            onChange={e => patchForm({ query: e.target.value })} />
        </div>
        <div className="ll-field ms-max">
          <label htmlFor="ms-max">Max results</label>
          <input id="ms-max" type="number" min={1} max={20} value={form.maxResults}
            onChange={e => patchForm({ maxResults: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} />
        </div>
        <button type="submit" className="btn primary ms-btn" disabled={blocked !== null || searchState === 'loading'}
          title={blocked ?? undefined}>
          <Search size={14} aria-hidden="true" /><span>{searchState === 'loading' ? 'Searching…' : 'Search'}</span>
        </button>
      </form>
      {guest && blocked && <p className="ll-muted ms-reason">{blocked}</p>}
      <p className="ll-note-line ms-note">{MAPS_NOTE}</p>

      {statusState === 'error' && (
        <div className="ag-state" role="alert">
          <h3>Can't reach the search service</h3>
          <p>The backend didn't respond, so nothing here is a guess.</p>
          <button type="button" className="btn primary" onClick={() => void maps.loadStatus()}>Try again</button>
        </div>
      )}
      {statusState === 'ready' && !configured && (
        <MapsSetupCard district={form.district} query={form.query} category={form.category} />
      )}
      {searchState === 'loading' && <div className="ag-skel ms-skel" aria-busy="true" />}
      {searchState === 'error' && searchError && <div className="ll-alert ms-alert" role="alert">{searchError}</div>}
      {searchState === 'ready' && results.length === 0 && (
        <div className="ag-state">
          <h3>Google found nothing for that search</h3>
          <p>Try a broader word{searched ? ` than "${searched.query}"` : ''}, another category or a nearby district.</p>
        </div>
      )}
      {searchState === 'ready' && results.length > 0 && (
        <ul className="ms-results" aria-label={`${results.length} results from Google Maps`}>
          {results.map(p => (
            <PlaceResultCard key={p.placeId} place={p} saveState={saved[p.placeId]} guest={guest} onSave={maps.save} />
          ))}
        </ul>
      )}
    </section>
  );
}
