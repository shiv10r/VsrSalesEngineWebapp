import type { HeatmapCell, HeatmapData, HeatmapWindow } from '../types/agents';

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const HOURS = Array.from({ length: 24 }, (_, h) => h);
export const WINDOWS: HeatmapWindow[] = [7, 28, 90];
export const STEPS = 4; // intensity steps above empty (0 = no leads)

/** Shift windows in IST, as segments of the 0-24h axis (the night shift wraps midnight, so it is two segments). */
export const SHIFT_BANDS = [
  { label: 'Night shift', start: 0, end: 6 },
  { label: 'Morning shift', start: 6, end: 14 },
  { label: 'Day shift', start: 14, end: 22 },
  { label: 'Night shift', start: 22, end: 24 },
] as const;

export interface Matrix {
  leads: number[][]; // [day 0..6][hour 0..23]
  runs: number[][];
  max: number;
}

export interface Slot {
  dayOfWeek: number;
  hour: number;
  newLeads: number;
  runs: number;
}

const grid = () => Array.from({ length: 7 }, () => Array<number>(24).fill(0));
const validCell = (c: HeatmapCell) =>
  Number.isInteger(c.dayOfWeek) && c.dayOfWeek >= 0 && c.dayOfWeek <= 6 &&
  Number.isInteger(c.hour) && c.hour >= 0 && c.hour <= 23;

/** Sparse cells -> dense 7x24 matrices. Out-of-range cells are ignored, duplicate cells are summed. */
export function buildMatrix(cells: HeatmapCell[]): Matrix {
  const leads = grid();
  const runs = grid();
  let max = 0;
  for (const c of cells) {
    if (!validCell(c)) continue;
    leads[c.dayOfWeek][c.hour] += Math.max(0, c.newLeads);
    runs[c.dayOfWeek][c.hour] += Math.max(0, c.runs);
    max = Math.max(max, leads[c.dayOfWeek][c.hour]);
  }
  return { leads, runs, max };
}

/** 0 = empty, 1..4 = quartile of the busiest cell. Any non-zero value is at least step 1. */
export function intensityStep(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(STEPS, Math.max(1, Math.ceil((value / max) * STEPS)));
}

/** Slots with leads, busiest first (ties: earlier weekday, then earlier hour). */
export function topSlots(cells: HeatmapCell[], limit = 5): Slot[] {
  const { leads, runs } = buildMatrix(cells);
  const slots: Slot[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (leads[d][h] > 0) slots.push({ dayOfWeek: d, hour: h, newLeads: leads[d][h], runs: runs[d][h] });
    }
  }
  slots.sort((a, b) => b.newLeads - a.newLeads || a.dayOfWeek - b.dayOfWeek || a.hour - b.hour);
  return slots.slice(0, limit);
}

export function busiestSlot(cells: HeatmapCell[]): Slot | null {
  return topSlots(cells, 1)[0] ?? null;
}

export function tzAbbrev(timezone: string): string {
  return timezone === 'Asia/Kolkata' ? 'IST' : timezone;
}

const pad = (h: number) => String(h).padStart(2, '0');
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function slotLabel(day: number, hour: number, timezone: string): string {
  return `${DAY_LABELS[day]} ${pad(hour)}:00 ${tzAbbrev(timezone)}`;
}

/** Cell tooltip, e.g. "Tue 14:00 IST - 6 new leads in 2 runs". */
export function cellTitle(day: number, hour: number, leads: number, runs: number, timezone: string): string {
  const where = slotLabel(day, hour, timezone);
  if (leads <= 0) return `${where} - no new leads`;
  return `${where} - ${plural(leads, 'new lead', 'new leads')} in ${plural(runs, 'run', 'runs')}`;
}

export function caption(totalNewLeads: number, days: number): string {
  return `${plural(totalNewLeads, 'new lead', 'new leads')} in the last ${days} days`;
}

/** Text alternative for the grid (role="img"). */
export function summaryLabel(data: HeatmapData): string {
  const tz = tzAbbrev(data.timezone);
  const head = `Heat map of new leads by weekday and hour (${tz}), last ${data.days} days.`;
  const best = busiestSlot(data.cells);
  if (!best) return `${head} No leads recorded yet.`;
  return `${head} Busiest slot: ${slotLabel(best.dayOfWeek, best.hour, data.timezone)} with ${plural(best.newLeads, 'new lead', 'new leads')}.`;
}
