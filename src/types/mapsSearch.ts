/** Live Google Places results. Everything except name, district, category, placeId and mapsUrl is shown, never saved. */
export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  hasWebsite: boolean;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string;
  suggestedCategory: string;
  district: string;
}

export interface DiscoverResponse {
  configured: boolean;
  results: PlaceResult[];
  remainingToday: number;
}

export interface PlacesStatus {
  configured: boolean;
  dailyCap: number;
  remainingToday: number;
}

export interface DiscoverRequest {
  district: string;
  category?: string;
  query?: string;
  maxResults?: number;
}

export interface SavePlaceBody {
  placeId: string;
  name: string;
  district: string;
  category: string;
  mapsUrl: string;
}

export interface SavePlaceResult {
  alreadySaved: boolean;
}

export interface LiveDetails {
  placeId: string;
  address: string;
  phone: string;
  website: string;
  hasWebsite: boolean;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string;
}

export type MapsFailureReason =
  'notConfigured' | 'forbidden' | 'quota' | 'validation' | 'notFound' | 'unreachable' | 'error';

export type MapsResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: MapsFailureReason; message: string };

export interface MapsForm {
  district: string;
  category: string;
  query: string;
  maxResults: number;
}

export type MapsSearchState = 'idle' | 'loading' | 'ready' | 'error';

export interface LiveEntry {
  state: 'loading' | 'ready' | 'error';
  details?: LiveDetails;
  message?: string;
}
