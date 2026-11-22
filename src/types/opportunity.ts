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
  status: 'New' | 'Needs review' | 'Qualified' | 'Contacted' | 'Interested' | 'Archived' | string;
  fit: 'High' | 'Medium' | 'Low' | 'Unrated' | string;
  type: 'Individual developer' | 'Company/vendor' | 'Direct project' | string;
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
  sourceUrl?: string;
  evidenceSnippet?: string;
}
