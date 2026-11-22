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
    note?: string | null;
  }[];
  summary?: string;
}
