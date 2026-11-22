import type { LiveEntry } from '../../types/mapsSearch';
import { formatRating, safeWebsiteHref, telHref, websiteLabel } from '../../utils/localLeadsFormat';

/** Phone, website and rating fetched live from Google for one lead. Shown here only, never saved. */
export function LiveDetails({ entry, onHide }: { entry: LiveEntry; onHide: () => void }) {
  if (entry.state === 'loading') return <div className="ms-live" aria-busy="true">Fetching live details…</div>;
  if (entry.state === 'error' || !entry.details) {
    return <div className="ms-live ms-live-err" role="alert">{entry.message ?? 'Could not load live details.'}</div>;
  }
  const d = entry.details;
  const site = d.hasWebsite ? safeWebsiteHref(d.website) : null;
  const tel = telHref(d.phone);
  return (
    <div className="ms-live">
      <span className="ms-live-tag">Live from Google, not saved</span>
      {d.address && <span className="ll-sub">{d.address}</span>}
      <span>Phone: {!d.phone ? '—' : tel ? <a className="ll-link" href={tel}>{d.phone}</a> : d.phone}</span>
      <span>Website: {site
        ? <a className="ll-link" href={site} target="_blank" rel="noopener noreferrer">{websiteLabel(d.website)}</a>
        : <span className="ll-badge warn">No website</span>}</span>
      <span>Rating: {formatRating(d.rating, d.reviewCount)}</span>
      <button type="button" className="ll-clear" onClick={onHide}>Hide</button>
    </div>
  );
}
