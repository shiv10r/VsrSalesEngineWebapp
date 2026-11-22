import { API_BASE_URL, ApiCore } from './http';
import { ExecutionRecord, ReliabilityMetrics, RetryResult } from '../types';

export function createReliabilityApi(core: ApiCore) {
  const methods = {
    async getReliabilityMetrics(): Promise<ReliabilityMetrics | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/metrics`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async getFailures(): Promise<ExecutionRecord[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/failures`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async retryFailure(id: string): Promise<RetryResult> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/failures/${encodeURIComponent(id)}/retry`, {
          method: 'POST',
          headers: core.getHeaders(),
        });
        const data = await res.json();
        return {
          executionId: id,
          success: data.success ?? false,
          status: data.status || (data.success ? 'Success' : 'Error'),
          message: data.message || 'Retry executed',
          nextRetryAtUtc: data.nextRetryAtUtc,
          attemptCount: data.attemptCount || 1,
        };
      } catch (err: any) {
        return {
          executionId: id,
          success: false,
          status: 'Error',
          message: err.message || 'Failed to retry execution',
          attemptCount: 1,
        };
      }
    },

    async getOperationalSmokeDrill(): Promise<{ status: string; allChecksPassed: boolean; checks: Array<{ component: string; status: string; detail: string }>; timestampUtc: string }> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/smoke-test`, {
          headers: core.getHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // fall through to the error below
      }
      throw new Error('The server could not be reached.');
    },

    async getKillSwitchStatus(): Promise<{ isEngaged: boolean; mode: string }> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/kill-switch`, {
          headers: core.getHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      throw new Error('The server could not be reached.');
    },

    async toggleKillSwitch(engaged?: boolean): Promise<{ isEngaged: boolean; action: string; message: string }> {
      try {
        const res = await fetch(`${API_BASE_URL}/reliability/kill-switch/toggle`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify({ engaged }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      throw new Error('The server could not be reached, so the kill switch was not changed.');
    },
  };

  return methods;
}
