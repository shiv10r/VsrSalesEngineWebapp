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
