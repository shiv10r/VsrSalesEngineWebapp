import { ExternalLink } from 'lucide-react';
import { googleMapsSearchUrl, justdialSearchUrl, searchLabel } from '../../utils/mapsFallback';

/** Shown when the server has no Google API key. The fallback links are plain links the user opens themselves. */
export function MapsSetupCard({ district, query, category }: { district: string; query: string; category: string }) {
  const label = searchLabel(query, category);
  const links = district
    ? [
      { href: googleMapsSearchUrl(label, district), text: `Open Google Maps search for ${label} in ${district}` },
      { href: justdialSearchUrl(label, district), text: `Search Justdial for ${label} in ${district} (via Google)` },
    ]
    : [];

  return (
    <div className="ag-state ms-setup" role="status">
      <h3>Google Maps search needs an API key</h3>
      <p>Google Maps search needs an API key. Add <code>GooglePlaces__ApiKey</code> on Render.</p>
      {links.length === 0 && <p className="ll-muted">Choose a district to get manual search links.</p>}
      <div className="ms-fallbacks">
        {links.map(l => (
          <a key={l.href} className="btn secondary ms-btn" href={l.href} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} aria-hidden="true" /><span>{l.text}</span>
          </a>
        ))}
      </div>
      <p className="ll-muted">These open in a new tab. Nothing is fetched from them.</p>
    </div>
  );
}
