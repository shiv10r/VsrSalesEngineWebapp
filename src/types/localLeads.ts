export type LocalLeadStatus = 'New' | 'Contacted' | 'Interested' | 'Won' | 'Lost';

export interface LocalLead {
  id: string;
  businessName: string;
  category: string;
  categoryReason: string;
  district: string;
  address: string;
  phone: string;
  website: string;
  hasWebsite: boolean;
  rating: number | null;
  reviewCount: number | null;
  source: 'CSV import' | 'Manual';
  sourceLabel: string;
  status: LocalLeadStatus;
  notes: string;
  createdBy: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface LocalLeadOptions {
  districts: string[];
  categories: string[];
  statuses: string[];
}

export interface LocalLeadPage {
  items: LocalLead[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LocalLeadSummary {
  total: number;
  noWebsite: number;
  byDistrict: { district: string; count: number }[];
  byCategory: { category: string; count: number }[];
  /** Non-zero cells only. */
  grid: { district: string; category: string; count: number }[];
}

export interface LocalLeadQuery {
  district?: string;
  category?: string;
  status?: string;
  hasWebsite?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface NewLocalLead {
  businessName: string;
  district: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
}

export interface LocalLeadPatch {
  status?: LocalLeadStatus;
  notes?: string;
  category?: string;
  district?: string;
  phone?: string;
  website?: string;
}

export interface ImportRow {
  businessName: string;
  district?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export type WriteFailure = {
  ok: false;
  reason: 'forbidden' | 'notFound' | 'validation' | 'error';
  message: string;
  errors?: { row?: number; field?: string; message: string }[];
};
export type WriteResult<T> = { ok: true; value: T } | WriteFailure;

export type LocalLeadsLoadState = 'loading' | 'ready' | 'error';
