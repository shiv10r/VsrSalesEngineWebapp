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
