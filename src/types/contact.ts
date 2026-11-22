export type RelationToPost = 'poster' | 'decision-maker' | 'hiring' | 'engineering' | 'mentioned';

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
  /** How this person is connected to the post (from the backend), or null when unknown. */
  relationToPost?: RelationToPost | null;
  notes?: string;
  createdBy?: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}
