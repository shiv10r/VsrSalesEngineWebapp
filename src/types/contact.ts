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
