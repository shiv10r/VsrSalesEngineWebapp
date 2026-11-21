import { useState } from 'react';
import { api } from '../services/api';
import { AutomationSchedule } from '../types';
import type { UiState } from './useUiState';

export function useSchedules(ui: UiState) {
  const { notify, userEmail } = ui;

  const [schedules, setSchedules] = useState<AutomationSchedule[]>([]);
  const [isRunningSchedule, setIsRunningSchedule] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      if (data && data.length > 0) {
        setSchedules(data);
      }
    } catch {
      // Fallback
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
      // Fallback
    }
    setSchedules(prev => prev.map(item => item.id === s.id ? { ...item, isEnabled: nextVal } : item));
    notify(`Schedule '${s.name}' ${nextVal ? 'enabled' : 'paused'} (local)`);
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
        selectedSources: payload.selectedSources || ['SRC-001', 'SRC-002'],
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
      // Fallback
    }
    const fallback: AutomationSchedule = {
      id: `SCHED-${Date.now()}`,
      name: payload.name || 'New schedule',
      description: payload.description || payload.audience || 'Recurring discovery run',
      frequency: payload.frequency || 'Daily',
      cronExpression: '0 8 * * *',
      timezone: payload.timezone || 'UTC',
      isEnabled: true,
      selectedSources: ['SRC-001', 'SRC-002'],
      runCap: payload.runCap || 50,
      quietHoursStart: payload.quietHoursStart || '22:00',
      quietHoursEnd: payload.quietHoursEnd || '06:00',
      nextRunAtUtc: new Date(Date.now() + 86400000).toISOString(),
      lastRunStatus: 'Pending',
      createdBy: userEmail || 'user',
      createdAtUtc: new Date().toISOString(),
      updatedAtUtc: new Date().toISOString(),
    };
    setSchedules(prev => [fallback, ...prev]);
    notify(`Schedule '${fallback.name}' created (local)`);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete schedule ${id}?`)) {
      await api.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      notify(`Schedule ${id} deleted`);
    }
  };

  return {
    schedules, setSchedules, isRunningSchedule, setIsRunningSchedule, loadSchedules,
    handleToggleSchedule, handleRunScheduleNow, handleCreateSchedule, handleDeleteSchedule,
  };
}

export type SchedulesState = ReturnType<typeof useSchedules>;
