import { API_BASE_URL, ApiCore, fetchList } from './http';
import { Contact } from '../types';
import { toRelation } from '../utils/linkedinHandoff';

export function createContactsApi(core: ApiCore) {
  function mapContact(c: any): Contact {
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      role: c.role,
      email: c.email,
      source: c.source,
      sourceUrl: c.sourceUrl,
      channelBasis: c.channelBasis,
      status: c.status,
      qualificationStatus: c.qualificationStatus,
      isRoleAccount: c.isRoleAccount,
      relationToPost: toRelation(c.relationToPost),
      notes: c.notes,
      createdBy: c.createdBy,
      createdAtUtc: c.createdAtUtc,
      updatedAtUtc: c.updatedAtUtc,
    };
  }

  const methods = {
    async getContacts(params?: { query?: string; company?: string; status?: string; qualificationStatus?: string }): Promise<Contact[]> {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.append('query', params.query);
      if (params?.company) searchParams.append('company', params.company);
      if (params?.status && params.status !== 'All statuses') searchParams.append('status', params.status);
      if (params?.qualificationStatus) searchParams.append('qualificationStatus', params.qualificationStatus);
      searchParams.append('pageSize', '100');

      const data = await fetchList(core, `/contacts?${searchParams.toString()}`, 'contacts');
      const items = data.items ? data.items : (Array.isArray(data) ? data : []);
      return items.map((c: any) => mapContact(c));
    },

    async createContact(payload: Partial<Contact>): Promise<Contact | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          return mapContact(data);
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async qualifyContact(id: string, qualificationStatus: string, status?: string, notes?: string): Promise<Contact | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(id)}/qualify`, {
          method: 'PATCH',
          headers: core.getHeaders(),
          body: JSON.stringify({ qualificationStatus, status, notes }),
        });
        if (res.ok) {
          const data = await res.json();
          return mapContact(data);
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async deleteContact(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: core.getHeaders(),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  };

  return methods;
}
