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
