/**
 * The one place that decides whether a value from the API may become a link.
 * Only absolute http(s) URLs pass; anything else (javascript:, data:, relative, garbage) gives null,
 * and the caller shows the value as plain text. Links built with it also use rel="noopener noreferrer".
 */
export function safeHttpUrl(url: string | null | undefined): string | null {
  const raw = (url ?? '').trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

/** For user-typed websites: a bare domain gets https:// first, then the same http(s)-only rule applies. */
export function safeWebsiteUrl(url: string | null | undefined): string | null {
  const raw = (url ?? '').trim();
  if (!raw) return null;
  return safeHttpUrl(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
}
