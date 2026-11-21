import { API_BASE_URL, ApiCore } from './http';
import { DiscoveryRunResult, SearchProfile, SourceDefinition } from '../types';

export function createSourcesApi(core: ApiCore) {
  const methods = {
    async getSources(): Promise<SourceDefinition[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/sources`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async updateSourceStatus(id: string, policyStatus: string, reason?: string): Promise<SourceDefinition | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/sources/${encodeURIComponent(id)}/status`, {
          method: 'PUT',
          headers: core.getHeaders(),
          body: JSON.stringify({ policyStatus, reason }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async getSearchProfiles(): Promise<SearchProfile[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/searchprofiles`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async createSearchProfile(payload: Partial<SearchProfile>): Promise<SearchProfile | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/searchprofiles`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async runDiscovery(request: { profileId?: string; targetKeywords?: string; excludedKeywords?: string; location?: string; selectedSources?: string[]; maxResults?: number }): Promise<DiscoveryRunResult | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/searchprofiles/run`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(request),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },
  };

  return methods;
}
