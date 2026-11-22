/** Plain links the user clicks themselves. Nothing here fetches anything. */
const place = (district: string) => `${district} Uttar Pradesh`;

export function searchLabel(query: string, category: string): string {
  return query.trim() || category.trim() || 'businesses';
}

export function googleMapsSearchUrl(query: string, district: string): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${query.trim()} ${place(district)}`.trim())}`;
}

/** Justdial URLs are not predictable, so this is a Google web search limited to Justdial. */
export function justdialSearchUrl(query: string, district: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`site:justdial.com ${query.trim()} ${place(district)}`)}`;
}
