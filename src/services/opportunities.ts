import { API_BASE_URL, ApiCore } from './http';
import { CreateOpportunityPayload, Opportunity } from '../types';

export function createOpportunitiesApi(core: ApiCore) {
  function mapOpportunity(o: any): Opportunity {
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

  const methods = {
    async getOpportunities(params?: { query?: string; status?: string; source?: string; fit?: string }): Promise<Opportunity[]> {
      try {
        const searchParams = new URLSearchParams();
        if (params?.query) searchParams.append('query', params.query);
        if (params?.status && params.status !== 'All statuses') searchParams.append('status', params.status);
        if (params?.source && params.source !== 'All sources') searchParams.append('source', params.source);
        if (params?.fit) searchParams.append('fit', params.fit);
        searchParams.append('pageSize', '100');

        const url = `${API_BASE_URL}/opportunities?${searchParams.toString()}`;
        const res = await fetch(url, { headers: core.getHeaders() });
        if (res.ok) {
          const data = await res.json();
          const items = data.items ? data.items : (Array.isArray(data) ? data : []);
          return items.map((o: any) => mapOpportunity(o));
        }
      } catch {
        // Fallback to local state if server offline
      }
      return [];
    },

    async getOpportunityById(id: string): Promise<Opportunity | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}`, {
          headers: core.getHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          return mapOpportunity(data);
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async createOpportunity(payload: CreateOpportunityPayload): Promise<Opportunity | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return mapOpportunity(data);
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async updateOpportunityStatus(id: string, newStatus: string, reason?: string): Promise<Opportunity | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: core.getHeaders(),
          body: JSON.stringify({ newStatus, reason }),
        });
        if (res.ok) {
          const data = await res.json();
          return mapOpportunity(data);
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async archiveOpportunity(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/opportunities/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: core.getHeaders(),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async deleteOpportunity(id: string): Promise<boolean> {
      return methods.archiveOpportunity(id);
    },
  };

  return methods;
}
