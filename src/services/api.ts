import { AuthResponse, CreateOpportunityPayload, DiscoveryRunResult, GuestStatus, Opportunity, SearchProfile, SourceDefinition } from '../types';

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

  private mapOpportunity(o: any): Opportunity {
    return {
      id: o.id,
      company: o.company,
      title: o.title,
      source: o.source,
      location: o.location,
      found: o.foundAt || 'Today',
      status: o.status,
      fit: o.fit,
      type: o.type,
      docs: o.hasVendorDocRequirements ?? false,
      vendorRequirementNotes: o.vendorRequirementNotes,
      sourceUrl: o.sourceUrl,
      evidenceSnippet: o.evidenceSnippet,
      statusHistory: o.statusHistory || [],
    };
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

  async getOpportunities(params?: { query?: string; status?: string; source?: string; fit?: string }): Promise<Opportunity[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.append('query', params.query);
      if (params?.status && params.status !== 'All statuses') searchParams.append('status', params.status);
      if (params?.source && params.source !== 'All sources') searchParams.append('source', params.source);
      if (params?.fit) searchParams.append('fit', params.fit);
      searchParams.append('pageSize', '100');

      const url = `${API_BASE_URL}/opportunities?${searchParams.toString()}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const items = data.items ? data.items : (Array.isArray(data) ? data : []);
        return items.map((o: any) => this.mapOpportunity(o));
      }
    } catch {
      // Fallback to local state if server offline
    }
    return [];
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return this.mapOpportunity(data);
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return this.mapOpportunity(data);
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async updateOpportunityStatus(id: string, newStatus: string, reason?: string): Promise<Opportunity | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ newStatus, reason }),
      });
      if (res.ok) {
        const data = await res.json();
        return this.mapOpportunity(data);
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async archiveOpportunity(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getSources(): Promise<SourceDefinition[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sources`, { headers: this.getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return [];
  }

  async updateSourceStatus(id: string, policyStatus: string, reason?: string): Promise<SourceDefinition | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sources/${encodeURIComponent(id)}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ policyStatus, reason }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async getSearchProfiles(): Promise<SearchProfile[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/searchprofiles`, { headers: this.getHeaders() });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return [];
  }

  async createSearchProfile(payload: Partial<SearchProfile>): Promise<SearchProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/searchprofiles`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  }

  async runDiscovery(request: { profileId?: string; targetKeywords?: string; excludedKeywords?: string; location?: string; selectedSources?: string[]; maxResults?: number }): Promise<DiscoveryRunResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/searchprofiles/run`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  }
}

export const api = new ApiService();
