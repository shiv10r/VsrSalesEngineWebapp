import { API_BASE_URL, ApiCore } from './http';
import { AutomationSchedule, ScheduleRunResult } from '../types';

export function createSchedulesApi(core: ApiCore) {
  const methods = {
    async getSchedules(): Promise<AutomationSchedule[]> {
      try {
        const res = await fetch(`${API_BASE_URL}/schedules`, { headers: core.getHeaders() });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return [];
    },

    async createSchedule(data: {
      name: string;
      description: string;
      frequency: string;
      cronExpression?: string;
      timezone?: string;
      profileId?: string;
      selectedSources?: string[];
      runCap?: number;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      isEnabled?: boolean;
    }): Promise<AutomationSchedule | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/schedules`, {
          method: 'POST',
          headers: core.getHeaders(),
          body: JSON.stringify(data),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async toggleSchedule(id: string, isEnabled: boolean): Promise<AutomationSchedule | null> {
      try {
        const res = await fetch(`${API_BASE_URL}/schedules/${encodeURIComponent(id)}/toggle`, {
          method: 'PATCH',
          headers: core.getHeaders(),
          body: JSON.stringify({ isEnabled }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback
      }
      return null;
    },

    async runScheduleNow(id: string): Promise<ScheduleRunResult> {
      try {
        const res = await fetch(`${API_BASE_URL}/schedules/${encodeURIComponent(id)}/run-now`, {
          method: 'POST',
          headers: core.getHeaders(),
        });
        const data = await res.json();
        return {
          scheduleId: id,
          success: data.success ?? false,
          status: data.status || (data.success ? 'Success' : 'Conflict'),
          message: data.message || 'Execution processed',
          nextRunAtUtc: data.nextRunAtUtc,
          lockOwner: data.lockOwner,
        };
      } catch (err: any) {
        return {
          scheduleId: id,
          success: false,
          status: 'Error',
          message: err.message || 'Failed to trigger schedule execution',
        };
      }
    },

    async deleteSchedule(id: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE_URL}/schedules/${encodeURIComponent(id)}`, {
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
