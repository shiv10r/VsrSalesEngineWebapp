import { useState } from 'react';
import { api } from '../services/api';
import { AutomationSchedule } from '../types';
import type { UiState } from './useUiState';

export function useSchedules(ui: UiState) {
  const { notify, userEmail } = ui;

  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);
  const [schedulesError, setSchedulesError] = useState(false);
  const [isRunningSchedule, setIsRunningSchedule] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data ?? []);
      setSchedulesError(false);
    } catch {
      setSchedules([]);
      setSchedulesError(true);
    }
  };

  const handleToggleSchedule = async (s: AutomationSchedule) => {
    const nextVal = !s.isEnabled;
    try {
      const updated = await api.toggleSchedule(s.id, nextVal);
      if (updated) {
        setSchedules(prev => prev.map(item => item.id === s.id ? updated : item));
        notify(`Schedule '${s.name}' ${nextVal ? 'enabled' : 'paused'}`);
        return;
      }
    } catch {
      // handled below
    }
    notify(`Could not change schedule '${s.name}': the server did not answer.`);
  };

  const handleRunScheduleNow = async (s: AutomationSchedule) => {
    setIsRunningSchedule(s.id);
    try {
      const res = await api.runScheduleNow(s.id);
      if (res.success) {
        notify(`Schedule run executed: ${res.message}`);
        await loadSchedules();
      } else {
        if (res.status === 'Conflict' || res.message.toLowerCase().includes('lock') || res.message.toLowerCase().includes('concurrency')) {
          notify(`🔒 Concurrency lock active: ${res.message}`);
        } else {
          notify(`Schedule execution failed: ${res.message}`);
        }
      }
    } catch (err: any) {
      notify(`Execution failed: ${err.message}`);
    } finally {
      setIsRunningSchedule(null);
    }
  };

  const handleCreateSchedule = async (payload: any) => {
    try {
      const created = await api.createSchedule({
        name: payload.name || 'New schedule',
        description: payload.description || payload.audience || 'Recurring discovery run',
        frequency: payload.frequency || 'Daily',
        cronExpression: payload.cronExpression,
        timezone: payload.timezone || 'UTC',
        profileId: payload.profileId,
        selectedSources: payload.selectedSources || [],
        runCap: payload.runCap || 50,
        quietHoursStart: payload.quietHoursStart || '22:00',
        quietHoursEnd: payload.quietHoursEnd || '06:00',
        isEnabled: true,
      });
      if (created) {
        setSchedules(prev => [created, ...prev]);
        notify(`Schedule '${created.name}' created`);
        return;
      }
    } catch {
      // handled below
    }
    notify('Could not create the schedule: the server did not answer.');
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete schedule ${id}?`)) {
      await api.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      notify(`Schedule ${id} deleted`);
    }
  };

  return {
    schedules, schedulesError, setSchedules, isRunningSchedule, setIsRunningSchedule, loadSchedules,
    handleToggleSchedule, handleRunScheduleNow, handleCreateSchedule, handleDeleteSchedule,
  };
}

export type SchedulesState = ReturnType<typeof useSchedules>;
