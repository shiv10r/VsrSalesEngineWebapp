import { API_BASE_URL, ApiCore } from './http';
import {
  DraftGenerationRequest, DraftGenerationResult, DraftValidationResult, OutreachSendRequest,
  OutreachSendResult, OutreachTemplate, SinkMessage, SuppressionRecord,
} from '../types';

export function createOutreachApi(core: ApiCore) {
  const methods = {
    async getOutreachTemplates(category?: string): Promise<OutreachTemplate[]> {
      try {
        const url = category ? `${API_BASE_URL}/outreach/templates?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/outreach/templates`;
        const res = await fetch(url, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async getOutreachTemplate(id: string): Promise<OutreachTemplate | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/templates/${encodeURIComponent(id)}`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async createOutreachTemplate(payload: Partial<OutreachTemplate>): Promise<OutreachTemplate | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/templates`, {
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

    async generateDraft(request: DraftGenerationRequest): Promise<DraftGenerationResult | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/drafts/generate`, {
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

    async validateDraft(subject: string, body: string, jurisdictionPolicy?: string): Promise<DraftValidationResult | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/drafts/validate`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify({ subject, body, jurisdictionPolicy }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async sendOutreach(request: OutreachSendRequest): Promise<OutreachSendResult | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/send`, {
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

    async getSinkMessages(): Promise<SinkMessage[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/sink-messages`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async getSuppressions(query?: string): Promise<SuppressionRecord[]> {
      try {
        const url = query ? `${API_BASE_URL}/outreach/suppressions?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/outreach/suppressions`;
        const res = await fetch(url, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async addSuppression(target: string, reason?: string, type?: string): Promise<SuppressionRecord | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/suppressions`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify({ target, reason: reason || 'ManualSuppression', type: type || 'Email', source: 'AdminAction' }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async removeSuppression(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/outreach/suppressions/${encodeURIComponent(id)}`, {
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
