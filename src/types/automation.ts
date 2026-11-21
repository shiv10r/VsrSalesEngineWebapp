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

export interface ReliabilityMetrics {
  repeatedSourceFailures: Record<string, number>;
  schedulerLagSeconds: number;
  deadLetterCount: number;
  failedSendCount: number;
  averageRunDurationMs: number;
  systemHealth: string;
  activeAlerts: string[];
}

export interface ExecutionRecord {
  id: string;
  jobType: string;
  referenceId: string;
  status: string;
  failureClassification: string;
  attemptCount: number;
  maxAttempts: number;
  errorMessage?: string;
  nextRetryAtUtc?: string;
  timeBudgetSeconds: number;
  durationMs: number;
  canRetry: boolean;
  createdAtUtc: string;
  completedAtUtc?: string;
}

export interface RetryResult {
  executionId: string;
  success: boolean;
  status: string;
  message: string;
  nextRetryAtUtc?: string;
  attemptCount: number;
}
