export interface OutreachRow {
  company: string;
  contact: string;
  subject: string;
  channel: string;
  status: 'Draft ready' | 'Replied' | 'Follow-up due' | 'Needs contact' | string;
  updated: string;
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
