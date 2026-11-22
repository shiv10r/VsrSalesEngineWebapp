export const placeResults = [
  {
    placeId: 'ChIJ1', name: 'Kanha Interiors', address: 'Civil Lines, Gorakhpur', phone: '0551 234 5678', website: '',
    hasWebsite: false, rating: 4.6, reviewCount: 88, mapsUrl: 'https://maps.google.com/?cid=1',
    suggestedCategory: 'Professional Services', district: 'Gorakhpur',
  },
  {
    placeId: 'ChIJ2', name: 'Green Hotel', address: 'Golghar, Gorakhpur', phone: '', website: 'https://greenhotel.example',
    hasWebsite: true, rating: null, reviewCount: null, mapsUrl: 'javascript:alert(1)',
    suggestedCategory: 'Hotels & Travel', district: 'Gorakhpur',
  },
];

export const liveDetails = {
  placeId: 'ChIJ1', address: 'Civil Lines, Gorakhpur', phone: '0551 234 5678', website: '', hasWebsite: false,
  rating: 4.6, reviewCount: 88, mapsUrl: 'https://maps.google.com/?cid=1',
};

const noop = () => {};

/** A stand-in for the useGoogleMapsSearch return value. */
export function mapsState(over = {}) {
  return {
    form: { district: 'Gorakhpur', category: '', query: 'interior designer', maxResults: 10 }, patchForm: noop,
    status: { configured: true, dailyCap: 100, remainingToday: 97 }, statusState: 'ready', loadStatus: noop,
    searchState: 'idle', results: [], searchError: null, searched: null, saved: {}, live: {}, guest: false,
    search: noop, save: noop, showLive: noop, hideLive: noop, ...over,
  };
}
