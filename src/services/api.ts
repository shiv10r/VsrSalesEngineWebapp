import { AuthResponse, GuestStatus, Opportunity } from '../types';

const API_BASE_URL = '/api';

class ApiService {
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

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        errorMessage: err.message || 'Failed to connect to authentication server.',
      };
    }
  }

  async createGuestSession(): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/guest-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch {
      // In offline/prototype mode, simulate fail-safe guest session
      const simulatedGuest: AuthResponse = {
        success: true,
        token: 'dev-guest-preview-token',
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'guest.dev@vsrsalesengine.local',
          fullName: 'Local Development Guest',
          role: 'Guest',
          isGuest: true,
        },
      };
      this.setToken(simulatedGuest.token!);
      return simulatedGuest;
    }
  }

  async getGuestStatus(): Promise<GuestStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/guest-status`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      allowedInCurrentEnvironment: true,
      serverFlagEnabled: true,
      environmentName: 'Development',
      notice: 'Client is running in development mode.',
    };
  }

  async getOpportunities(): Promise<Opportunity[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.map((o: any) => ({
          id: o.id,
          company: o.company,
          title: o.title,
          source: o.source,
          location: o.location,
          found: o.foundAt || 'Today',
          status: o.status,
          fit: o.fit,
          type: o.type,
          docs: o.hasVendorDocRequirements,
          sourceUrl: o.sourceUrl,
          evidenceSnippet: o.evidenceSnippet,
        }));
      }
    } catch {
      // Fallback to local state if server offline
    }
    return [];
  }
}

export const api = new ApiService();
