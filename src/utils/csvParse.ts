import type { ImportRow } from '../types/localLeads';

export const MAX_IMPORT_ROWS = 2000;

export type ImportField =
  | 'businessName' | 'category' | 'district' | 'address' | 'phone' | 'website' | 'rating' | 'reviewCount';

/** Header names accepted for each field, compared lower-case with separators turned into single spaces. */
export const FIELD_ALIASES: Record<ImportField, string[]> = {
  businessName: ['name', 'business', 'business name', 'company', 'company name', 'shop', 'shop name'],
  category: ['category', 'type', 'business type', 'industry'],
  district: ['district', 'city', 'town', 'location'],
  address: ['address', 'full address', 'street'],
  phone: ['phone', 'mobile', 'contact', 'phone number', 'mobile number', 'contact number', 'tel'],
  website: ['website', 'url', 'site', 'web', 'web site', 'website url'],
  rating: ['rating', 'stars', 'score'],
  reviewCount: ['reviews', 'review count', 'no of reviews', 'total reviews', 'user ratings total'],
};

const FIELD_LABELS: Record<ImportField, string> = {
  businessName: 'Business name', category: 'Category', district: 'District', address: 'Address',
  phone: 'Phone', website: 'Website', rating: 'Rating', reviewCount: 'Reviews',
};
export const fieldLabel = (f: ImportField) => FIELD_LABELS[f];

export function normalizeHeader(h: string): string {
  return h.replace(/^﻿/, '').toLowerCase().replace(/[_\-.]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Picks the delimiter that appears most often (outside quotes) in the first non-empty line. */
export function detectDelimiter(text: string): ',' | ';' | '\t' {
  const line = text.split(/\r?\n/).find(l => l.trim() !== '') ?? '';
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch]++;
  }
  if (counts[';'] > counts[','] && counts[';'] >= counts['\t']) return ';';
  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t';
  return ',';
}

/** Small RFC-4180 style parser: quoted fields, doubled quotes, CRLF, comma/semicolon/tab. Blank lines are dropped. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, '');
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  const endField = () => { row.push(field); field = ''; };
  const endRow = () => {
    endField();
    if (row.some(cell => cell.trim() !== '')) rows.push(row.map(c => c.trim()));
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === delimiter) endField();
    else if (ch === '\n') endRow();
    else if (ch === '\r') { if (text[i + 1] === '\n') i++; endRow(); }
    else field += ch;
  }
  if (field !== '' || row.length > 0) endRow();
  return rows;
}

export interface ColumnMap {
  mapping: Partial<Record<ImportField, number>>;
  detected: { field: ImportField; header: string }[];
  unmapped: string[];
}

export function mapColumns(headers: string[]): ColumnMap {
  const mapping: Partial<Record<ImportField, number>> = {};
  const detected: ColumnMap['detected'] = [];
  const used = new Set<number>();
  const normalized = headers.map(normalizeHeader);
  (Object.keys(FIELD_ALIASES) as ImportField[]).forEach(field => {
    const index = normalized.findIndex((h, i) => !used.has(i) && FIELD_ALIASES[field].includes(h));
    if (index >= 0) {
      mapping[field] = index;
      used.add(index);
      detected.push({ field, header: headers[index] });
    }
  });
  const unmapped = headers.filter((h, i) => !used.has(i) && h.trim() !== '');
  return { mapping, detected, unmapped };
}

const clean = (v: string | undefined) => (v ?? '').trim();

function parseRating(v: string): number | undefined {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 && n <= 5 ? n : undefined;
}

function parseCount(v: string): number | undefined {
  const digits = v.replace(/[^\d]/g, '');
  return digits === '' ? undefined : Math.min(parseInt(digits, 10), 10_000_000);
}

export interface ParsedImport {
  rows: ImportRow[];
  skipped: { row: number; message: string }[];
  truncated: boolean;
}

/** Row numbers are spreadsheet row numbers: the header is row 1, so the first lead is row 2. */
export function toImportRows(table: string[][], map: ColumnMap, defaultDistrict = ''): ParsedImport {
  const rows: ImportRow[] = [];
  const skipped: ParsedImport['skipped'] = [];
  const get = (cells: string[], f: ImportField) => (map.mapping[f] === undefined ? '' : clean(cells[map.mapping[f]!]));
  let truncated = false;

  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const businessName = get(cells, 'businessName');
    if (!businessName) { skipped.push({ row: i + 1, message: 'Missing business name' }); continue; }
    if (rows.length >= MAX_IMPORT_ROWS) { truncated = true; break; }

    const row: ImportRow = { businessName };
    const district = get(cells, 'district') || defaultDistrict;
    if (district) row.district = district;
    for (const f of ['category', 'address', 'phone', 'website'] as const) {
      const v = get(cells, f);
      if (v) row[f] = v;
    }
    const rating = parseRating(get(cells, 'rating'));
    if (rating !== undefined) row.rating = rating;
    const reviews = parseCount(get(cells, 'reviewCount'));
    if (reviews !== undefined) row.reviewCount = reviews;
    rows.push(row);
  }
  return { rows, skipped, truncated };
}
