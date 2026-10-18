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

export interface Opportunity {
  id: string;
  company: string;
  title: string;
  source: string;
  location: string;
  found: string;
  status: 'New' | 'Needs review' | 'Qualified' | 'Contacted' | 'Readiness hold' | 'Interested' | string;
  fit: 'High' | 'Medium' | 'Low' | 'Unrated' | string;
  type: 'Individual developer' | 'Company/vendor' | 'Direct project' | string;
  docs: boolean;
  sourceUrl?: string;
  evidenceSnippet?: string;
}

export interface Contact {
  name: string;
  company: string;
  role: string;
  email: string;
  source: string;
  status: 'Not contacted' | 'Replied' | 'Follow-up due' | 'Do not contact' | string;
}

export interface Campaign {
  name: string;
  audience: string;
  sent: number;
  replies: number;
  status: 'Active' | 'Paused' | 'Draft' | 'Completed' | string;
  next: string;
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
