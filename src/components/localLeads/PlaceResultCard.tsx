import { Check, ExternalLink, Save } from 'lucide-react';
import type { PlaceResult } from '../../types/mapsSearch';
import { formatRating, safeWebsiteHref, telHref, websiteLabel } from '../../utils/localLeadsFormat';
import { GUEST_MAPS_REASON } from '../../hooks/useGoogleMapsSearch';

interface Props {
  place: PlaceResult;
  saveState?: 'saving' | 'saved';
  guest: boolean;
  onSave: (place: PlaceResult) => void;
}

export function PlaceResultCard({ place, saveState, guest, onSave }: Props) {
  const site = place.hasWebsite ? safeWebsiteHref(place.website) : null;
  const tel = telHref(place.phone);
  const mapsHref = place.mapsUrl ? safeWebsiteHref(place.mapsUrl) : null;

  return (
    <li className="ms-card">
      <div className="ms-card-main">
        <div className="ms-card-head">
          <strong className="ll-name">{place.name}</strong>
          <span className="ll-chip">{place.suggestedCategory}</span>
        </div>
        {place.address && <span className="ll-sub ms-addr">{place.address}</span>}
        <dl className="ms-facts">
          <div><dt>Phone</dt><dd>{!place.phone ? <span className="ll-muted">—</span>
            : tel ? <a className="ll-link" href={tel}>{place.phone}</a> : place.phone}</dd></div>
          <div><dt>Website</dt><dd>{site
            ? <a className="ll-link" href={site} target="_blank" rel="noopener noreferrer">{websiteLabel(place.website)}</a>
            : <span className="ll-badge warn">No website</span>}</dd></div>
          <div><dt>Rating</dt><dd>{formatRating(place.rating, place.reviewCount)}</dd></div>
        </dl>
      </div>
      <div className="ms-card-actions">
        {mapsHref && (
          <a className="btn secondary ms-btn" href={mapsHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} aria-hidden="true" /><span>Open in Google Maps</span>
          </a>
        )}
        {saveState === 'saved' ? (
          <button type="button" className="btn secondary ms-btn" disabled>
            <Check size={14} aria-hidden="true" /><span>Saved</span>
          </button>
        ) : (
          <button type="button" className="btn primary ms-btn" disabled={guest || saveState === 'saving'}
            title={guest ? GUEST_MAPS_REASON : undefined} onClick={() => onSave(place)}>
            <Save size={14} aria-hidden="true" /><span>{saveState === 'saving' ? 'Saving…' : 'Save as lead'}</span>
          </button>
        )}
      </div>
    </li>
  );
}
