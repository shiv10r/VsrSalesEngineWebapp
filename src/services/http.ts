const ENV_API_URL = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL;
export const API_BASE_URL = ENV_API_URL ? `${ENV_API_URL.replace(/\/+$/, '')}/api` : '/api';

export class ApiCore {
  private token: string | null = null;

  constructor() {
    this.token = sessionStorage.getItem('vsr_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('vsr_auth_token', token);
    } else {
      sessionStorage.removeItem('vsr_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }
}

export const SESSION_EXPIRED_MESSAGE = 'Your session has expired or is no longer valid. Please sign in again.';

type FetchFn = typeof fetch;

/**
 * Wraps fetch once so every API call shares one rule: a 401 from the API (other than a failed sign-in)
 * clears the stored token and calls onExpired, which returns the user to the sign-in screen.
 */
export function withUnauthorizedHandling(original: FetchFn, core: ApiCore, onExpired: () => void): FetchFn {
  return async (input, init) => {
    const response = await original(input, init);
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const isApi = url.startsWith(API_BASE_URL);
    const isSignIn = url.startsWith(`${API_BASE_URL}/auth/login`) || url.startsWith(`${API_BASE_URL}/auth/guest-session`);
    if (response.status === 401 && isApi && !isSignIn && core.getToken()) {
      core.setToken(null);
      onExpired();
    }
    return response;
  };
}

/** Thrown by list loaders when the server answered with an error or could not be reached, so callers never mistake a failure for an empty list. */
export class ListLoadError extends Error {
  constructor(what: string) {
    super(`Could not load ${what} from the server.`);
    this.name = 'ListLoadError';
  }
}

/** GET a JSON list. Returns the parsed body, or throws ListLoadError on a network error or a non-2xx answer. */
export async function fetchList(core: ApiCore, path: string, what: string): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { headers: core.getHeaders() });
  } catch {
    throw new ListLoadError(what);
  }
  if (!res.ok) throw new ListLoadError(what);
  try {
    return await res.json();
  } catch {
    throw new ListLoadError(what);
  }
}
