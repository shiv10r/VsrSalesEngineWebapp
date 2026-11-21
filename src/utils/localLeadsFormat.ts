import type { LocalLeadSummary } from '../types/localLeads';
import { intensityStep } from './heatmapFormat';

export interface DistrictCategoryGridData {
  districts: string[];
  categories: string[];
  counts: Record<string, number>;
  max: number;
}

export const cellKey = (district: string, category: string) => `${district}|${category}`;

/** Rows = districts that have leads (busiest first). Columns = the known categories, plus any the data adds. */
export function buildGrid(summary: LocalLeadSummary, knownCategories: string[]): DistrictCategoryGridData {
  const counts: Record<string, number> = {};
  let max = 0;
  const seenCategories = new Set(knownCategories);
  for (const c of summary.grid) {
    if (c.count <= 0) continue;
    const key = cellKey(c.district, c.category);
    counts[key] = (counts[key] ?? 0) + c.count;
    max = Math.max(max, counts[key]);
    seenCategories.add(c.category);
  }
  const districts = [...summary.byDistrict]
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count || a.district.localeCompare(b.district))
    .map(d => d.district);
  return { districts, categories: [...seenCategories], counts, max };
}

export const gridStep = (count: number, max: number) => intensityStep(count, max);

export const cellLabel = (district: string, category: string, count: number) =>
  `${district}, ${category}: ${count} lead${count === 1 ? '' : 's'}`;

export function topOf<T extends { count: number }>(items: T[]): T | null {
  return items.reduce<T | null>((best, it) => (it.count > 0 && (!best || it.count > best.count) ? it : best), null);
}

/** Only http(s) links are ever rendered as links. A bare domain gets https://. */
export function safeWebsiteHref(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export function websiteLabel(url: string): string {
  const href = safeWebsiteHref(url);
  if (!href) return url.trim();
  return new URL(href).hostname.replace(/^www\./, '');
}

export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 6 ? `tel:${digits}` : null;
}

export function formatRating(rating: number | null, reviews: number | null): string {
  if (rating === null) return '—';
  return reviews === null ? rating.toFixed(1) : `${rating.toFixed(1)} (${reviews.toLocaleString('en-IN')})`;
}

export const pageCount = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

export const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export function isValidWebsite(value: string): boolean {
  return value.trim() === '' || safeWebsiteHref(value) !== null;
}
