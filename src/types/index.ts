export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isGuest: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  errorMessage?: string;
  user?: User;
}

export interface GuestStatus {
  allowedInCurrentEnvironment: boolean;
  serverFlagEnabled: boolean;
  environmentName: string;
  notice: string;
}

export interface StatusChange {
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  reason?: string;
  changedAtUtc: string;
}

export interface Opportunity {
  id: string;
  company: string;
  title: string;
  source: string;
  location: string;
  found: string;
  status: 'New' | 'Needs review' | 'Qualified' | 'Contacted' | 'Readiness hold' | 'Interested' | 'Archived' | string;
  fit: 'High' | 'Medium' | 'Low' | 'Unrated' | string;
  type: 'Individual developer' | 'Company/vendor' | 'Direct project' | string;
  docs: boolean;
  vendorRequirementNotes?: string;
  sourceUrl?: string;
  evidenceSnippet?: string;
  statusHistory?: StatusChange[];
}

export interface CreateOpportunityPayload {
  company: string;
  title: string;
  source: string;
  location: string;
  fit: string;
  type: string;
  hasVendorDocRequirements: boolean;
  vendorRequirementNotes?: string;
  sourceUrl?: string;
  evidenceSnippet?: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  source: string;
  sourceUrl?: string;
  channelBasis?: string;
  status: 'Not contacted' | 'Replied' | 'Follow-up due' | 'Do not contact' | 'Qualified' | string;
  qualificationStatus?: 'Unverified' | 'Verified' | 'BlockedByPolicy' | 'OptedOut' | 'Qualified' | string;
  isRoleAccount?: boolean;
  notes?: string;
  createdBy?: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface Campaign {
  id?: string;
  name: string;
  audience: string;
  mode?: 'DraftOnly' | 'ApprovalRequired' | 'AutoSendWithinRules' | string;
  sent: number;
  replies: number;
  status: 'Active' | 'Paused' | 'Draft' | 'Completed' | string;
  next?: string;
  dailySendLimit?: number;
  currentDaySent?: number;
  maxTouches?: number;
  delayDaysBetweenTouches?: number;
  stopOnReply?: boolean;
  stopOnOptOut?: boolean;
  stopOnBounce?: boolean;
  selectedTemplateId?: string;
  senderName?: string;
  senderEmail?: string;
  senderAddress?: string;
  jurisdiction?: string;
  optOutMechanismUrl?: string;
}

export interface ComplianceGateResult {
  isProductionReady: boolean;
  senderIdentityConfigured: boolean;
  providerCredentialsConfigured: boolean;
  physicalAddressConfigured: boolean;
  optOutMechanismConfigured: boolean;
  jurisdictionPolicyConfigured: boolean;
  rateLimitsConfigured: boolean;
  blockingReasons: string[];
  remediationSteps: string[];
}

export interface ActivityItem {
  icon: any;
  color: string;
  title: string;
  detail: string;
  time: string;
  state: 'success' | 'review' | 'warning' | string;
}

export interface OutreachRow {
  company: string;
  contact: string;
  subject: string;
  channel: string;
  status: 'Draft ready' | 'Replied' | 'Follow-up due' | 'Needs contact' | string;
  updated: string;
}

export interface SourceDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  policyStatus: 'Active' | 'Restricted' | 'UnderReview' | 'Disabled' | string;
  allowsDirectFetch: boolean;
  termsUrl: string;
  attributionNotice: string;
  dailyRequestLimit: number;
  currentDayRequests: number;
  healthStatus: string;
  lastCheckedAtUtc: string;
}

export interface SearchProfile {
  id: string;
  name: string;
  targetKeywords: string;
  excludedKeywords: string;
  location: string;
  opportunityType: string;
  publishedWithinDays: number;
  selectedSources: string[];
  maxResults: number;
  isActive: boolean;
  createdBy: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface DiscoveryRunResult {
  runId: string;
  initiatedBy: string;
  profileName: string;
  initiatedAtUtc: string;
  completedAtUtc: string;
  status: string;
  evaluatedCount: number;
  newMatchesCount: number;
  duplicateCount: number;
  sourceMetrics: {
    sourceName: string;
    recordsFetched: number;
    newMatches: number;
    rejectedByPolicy: number;
    status: string;
  }[];
}

export interface OutreachTemplate {
  id: string;
  name: string;
  category: string;
  subjectTemplate: string;
  bodyTemplate: string;
  serviceProposition: string;
  jurisdictionPolicy: string;
  footerTemplate: string;
  isActive: boolean;
  createdBy?: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface DraftGenerationRequest {
  templateId?: string;
  contactName: string;
  companyName: string;
  role?: string;
  opportunityTitle?: string;
  sourceEvidenceSnippet?: string;
  serviceProposition?: string;
  senderName?: string;
  senderTitle?: string;
  senderCompany?: string;
  jurisdictionPolicy?: string;
}

export interface DraftGenerationResult {
  subject: string;
  body: string;
  factsUsed: string[];
  isValid: boolean;
  missingVariables: string[];
  prohibitedClaims: string[];
  warnings: string[];
  tone: string;
  jurisdictionFooter: string;
}

export interface DraftValidationResult {
  isValid: boolean;
  missingVariables: string[];
  prohibitedClaims: string[];
  warnings: string[];
  hasUnsubscribeMechanism: boolean;
  hasPhysicalAddress: boolean;
  hasSenderIdentity: boolean;
}

export interface OutreachSendRequest {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  idempotencyKey?: string;
  isTestMode?: boolean;
  sinkAddressOverride?: string;
}

export interface OutreachSendResult {
  success: boolean;
  messageId: string;
  status: string;
  detail: string;
  suppressed: boolean;
  wasRoutedToSink: boolean;
  providerMessageId?: string;
}

export interface SinkMessage {
  id: string;
  idempotencyKey: string;
  originalRecipient: string;
  routedRecipient: string;
  subject: string;
  body: string;
  providerMessageId: string;
  mode: string;
  sentAtUtc: string;
}

export interface SuppressionRecord {
  id: string;
  target: string;
  type: string;
  reason: string;
  source: string;
  createdBy: string;
  createdAtUtc: string;
}

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

