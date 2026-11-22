export interface AutomationSchedule {
  id: string;
  name: string;
  description: string;
  frequency: string;
  cronExpression?: string;
  timezone: string;
  isEnabled: boolean;
  profileId?: string;
  selectedSources: string[];
  runCap: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  lastRunAtUtc?: string;
  nextRunAtUtc: string;
  lastRunStatus: string;
  createdBy: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ScheduleRunResult {
  scheduleId: string;
  success: boolean;
  status: string;
  message: string;
  nextRunAtUtc?: string;
  lockOwner?: string;
}
