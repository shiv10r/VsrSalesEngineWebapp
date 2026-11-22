/** Pure helpers for the sidebar, kept apart from the component so they can be tested directly. */

/** Two-letter initials from an email or name: "sales.team@x.com" -> "ST", "maya" -> "MA". */
export function initialsFrom(value: string | null | undefined): string {
  const text = (value ?? '').trim();
  if (!text) return 'VS';
  const local = text.split('@')[0];
  const parts = local.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] ?? text).slice(0, 2).toUpperCase();
}

/** Badge shown beside a nav item, or null when there is nothing worth showing. */
export function navBadge(label: string, counts: { opportunities: number }): string | null {
  if (label === 'Opportunities' && counts.opportunities > 0) {
    return counts.opportunities > 999 ? '999+' : String(counts.opportunities);
  }
  return null;
}

export function sessionLabel(guest: boolean): string {
  return guest ? 'Guest (read-only)' : 'Signed in';
}
