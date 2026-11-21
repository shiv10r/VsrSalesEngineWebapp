import { API_BASE_URL, ApiCore } from './http';
import { Campaign, ComplianceGateResult } from '../types';

export function createCampaignsApi(core: ApiCore) {
  const methods = {
    async deleteCampaign(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: core.getHeaders(),
        });
        return res.ok;
      } catch {
        return false;
      }
    },

    async getCampaigns(status?: string): Promise<Campaign[]> {
      try {
        const url = status ? `${API_BASE_URL}/campaigns?status=${encodeURIComponent(status)}` : `${API_BASE_URL}/campaigns`;
        const res = await fetch(url, { headers: core.getHeaders() });
        if (res.ok) {
          const list = await res.json();
          return list.map((c: any) => ({
            id: c.id,
            name: c.name,
            audience: c.audience,
            mode: c.mode,
            status: c.status,
            sent: c.totalSent ?? 0,
            replies: c.totalReplies ?? 0,
            next: c.mode === 'AutoSendWithinRules' ? `${c.dailySendLimit} daily limit` : 'Manual review',
            dailySendLimit: c.dailySendLimit,
            currentDaySent: c.currentDaySent,
            maxTouches: c.maxTouches,
            delayDaysBetweenTouches: c.delayDaysBetweenTouches,
            stopOnReply: c.stopOnReply,
            stopOnOptOut: c.stopOnOptOut,
            stopOnBounce: c.stopOnBounce,
            selectedTemplateId: c.selectedTemplateId,
            senderName: c.senderName,
            senderEmail: c.senderEmail,
            senderAddress: c.senderAddress,
            jurisdiction: c.jurisdiction,
            optOutMechanismUrl: c.optOutMechanismUrl,
          }));
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async createCampaign(payload: Partial<Campaign>): Promise<Campaign | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/campaigns`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const c = await res.json();
          return {
            id: c.id,
            name: c.name,
            audience: c.audience,
            mode: c.mode,
            status: c.status,
            sent: c.totalSent ?? 0,
            replies: c.totalReplies ?? 0,
            next: `${c.dailySendLimit} daily limit`,
            dailySendLimit: c.dailySendLimit,
            maxTouches: c.maxTouches,
            delayDaysBetweenTouches: c.delayDaysBetweenTouches,
          };
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async updateCampaignStatus(id: string, status: string, reason?: string): Promise<Campaign | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: core.getHeaders(),
          body: JSON.stringify({ status, reason }),
        });
        if (res.ok) {
          const c = await res.json();
          return {
            id: c.id,
            name: c.name,
            audience: c.audience,
            mode: c.mode,
            status: c.status,
            sent: c.totalSent ?? 0,
            replies: c.totalReplies ?? 0,
            next: `${c.dailySendLimit} daily limit`,
          };
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async updateCampaignMode(id: string, mode: string): Promise<Campaign | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(id)}/mode`, {
          method: 'PATCH',
          headers: core.getHeaders(),
          body: JSON.stringify({ mode }),
        });
        if (res.ok) {
          const c = await res.json();
          return {
            id: c.id,
            name: c.name,
            audience: c.audience,
            mode: c.mode,
            status: c.status,
            sent: c.totalSent ?? 0,
            replies: c.totalReplies ?? 0,
            next: `${c.dailySendLimit} daily limit`,
          };
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async getCampaignComplianceGate(id: string): Promise<ComplianceGateResult | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/campaigns/${encodeURIComponent(id)}/compliance-gate`, { headers: core.getHeaders() });
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
