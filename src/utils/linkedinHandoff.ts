import type { Contact, Opportunity, RelationToPost } from '../types';

/**
 * Manual LinkedIn handoff. Nothing here contacts LinkedIn: we build a search link the person
 * clicks and a note they copy and send themselves. We never automate LinkedIn.
 */

/** One place for who we are in a note. Swap for real sender settings if the app gains them. */
export const SENDER_NAME = 'VSR Technologies';
export const CONNECTION_NOTE_LIMIT = 300; // LinkedIn's connection note limit
export const FOLLOW_UP_LIMIT = 600;
export const REQUESTED_STATUS = 'LinkedIn requested';
export const NOT_CONTACTED_STATUS = 'Not contacted';
export const LINKEDIN_CAPTION = 'You send this yourself on LinkedIn. We never automate LinkedIn.';

const SEARCH = 'https://www.linkedin.com/search/results';

export const peopleSearchUrl = (name: string, company: string) =>
  `${SEARCH}/people/?keywords=${encodeURIComponent(`${name} ${company}`.trim())}`;

export const companySearchUrl = (company: string) =>
  `${SEARCH}/companies/?keywords=${encodeURIComponent(company.trim())}`;

/**
 * Length in UTF-16 units. An emoji counts as 2, so this never under-counts and the limits hold
 * however LinkedIn counts characters.
 */
export const textLength = (s: string) => s.length;

/** Shorten to at most `max` units, never splitting an emoji, ending with an ellipsis when cut. */
export function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  if (max <= 1) {
    const first = Array.from(t)[0] ?? '';
    return first.length <= max ? first : '';
  }
  let out = '';
  for (const ch of t) {
    if (out.length + ch.length > max - 1) break;
    out += ch;
  }
  return out.trimEnd() + '…';
}

/** How a person is connected to the post, in the order we list them. */
export const RELATIONS: RelationToPost[] = ['poster', 'hiring', 'decision-maker', 'engineering', 'mentioned'];

export const RELATION_LABEL: Record<RelationToPost, string> = {
  poster: 'Posted this',
  hiring: 'Hiring',
  'decision-maker': 'Decision-maker',
  engineering: 'Engineering',
  mentioned: 'Mentioned in post',
};

/** Accept only the relationships we know; anything else is treated as unknown (null). */
export const toRelation = (value: unknown): RelationToPost | null =>
  RELATIONS.includes(value as RelationToPost) ? (value as RelationToPost) : null;

/** A poster listed only by a username (for example a Hacker News handle), not a full name. */
export const isHandle = (c: Pick<Contact, 'name' | 'relationToPost'>) =>
  c.relationToPost === 'poster' && c.name.trim() !== '' && !/\s/.test(c.name.trim());

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

/** Greeting. A handle is not a first name, so it gets a plain "Hello,". */
function greeting(contact: Pick<Contact, 'name' | 'relationToPost'>): string {
  const first = firstName(contact.name);
  return first && !isHandle(contact) ? `Hi ${first},` : 'Hello,';
}

/**
 * Build text no longer than `max`. If it is too long, shorten the role title first, then the
 * company name, and only as a last resort the whole text. The template words never change.
 */
function fit(max: number, build: (company: string, role?: string) => string, company: string, role?: string): string {
  let c = company.trim();
  let r = role?.trim() || undefined;
  let text = build(c, r);
  if (textLength(text) <= max) return text;

  if (r) {
    r = truncate(r, Math.max(8, textLength(r) - (textLength(text) - max)));
    text = build(c, r);
    if (textLength(text) <= max) return text;
  }
  c = truncate(c, Math.max(6, textLength(c) - (textLength(text) - max)));
  text = build(c, r);
  return textLength(text) <= max ? text : truncate(text, max);
}

/** The sentence that says why we are writing. Facts come only from the post, the company and the opening. */
function reason(relation: RelationToPost | null | undefined, c: string, r: string | undefined, style: 'note' | 'follow'): string {
  const tail = style === 'note' ? '.' : ', which is why I got in touch.';
  let clause: string;
  switch (relation) {
    case 'poster':
      clause = `I saw your post about ${r ?? c}`;
      break;
    case 'hiring':
      clause = r ? `I saw ${c} is hiring for ${r}` : `I saw ${c} is hiring`;
      break;
    case 'decision-maker':
      clause = r ? `I came across ${c} and the ${r} opening` : `I came across ${c}`;
      break;
    case 'engineering':
      clause = r ? `I saw your team is hiring for ${r}` : `I saw your team at ${c} is hiring`;
      break;
    case 'mentioned':
      clause = r ? `I saw your name in the ${c} posting for ${r}` : `I saw your name in the ${c} posting`;
      break;
    default:
      clause = r ? `I saw ${c} is hiring for ${r}` : style === 'note' ? `I came across ${c} and wanted to reach out` : `I came across ${c}`;
  }
  return clause + tail;
}

export interface NoteInput {
  /** The person. Only name and relationToPost are used. */
  contact: Pick<Contact, 'name' | 'company' | 'relationToPost'>;
  /** Title of a real opening at this company. Leave empty when there is none. */
  roleTitle?: string;
  sender?: string;
}

/** Connection request note, at most 300 characters. Uses only the data passed in. */
export function buildConnectionNote({ contact, roleTitle, sender = SENDER_NAME }: NoteInput): string {
  return fit(CONNECTION_NOTE_LIMIT, (c, r) =>
    `${greeting(contact)} ${reason(contact.relationToPost, c, r, 'note')} I'm with ${sender} and would like to connect if you're open to it.`,
  contact.company, roleTitle);
}

/** Follow-up message after they accept, at most 600 characters. Uses only the data passed in. */
export function buildFollowUp({ contact, roleTitle, sender = SENDER_NAME }: NoteInput): string {
  return fit(FOLLOW_UP_LIMIT, (c, r) =>
    `${greeting(contact)} thanks for connecting. ${reason(contact.relationToPost, c, r, 'follow')} `
    + `If it would help, I can send a short note on how ${sender} might support that work, `
    + 'or you can point me to whoever looks after it on your side. No pressure either way. '
    + `Best regards, ${sender}`,
  contact.company, roleTitle);
}

const DECISION_MAKER = /\b(founder|co-?founder|owner|ceo|cto|cio|coo|cpo|chief|president|principal|managing\s+director|director|head\s+of|vp|vice\s+president|partner)\b/i;
/** Role-title guess, used only to break ties when sorting. The chip comes from relationToPost. */
export const isDecisionMaker = (role: string) => DECISION_MAKER.test(role || '');

export const normalizeCompany = (s: string) => (s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const rank = (c: Contact) => {
  const i = RELATIONS.indexOf(c.relationToPost as RelationToPost);
  return i === -1 ? RELATIONS.length : i;
};

/** People at this company: poster first, then hiring, decision-maker, engineering, mentioned. */
export function contactsForCompany(contacts: Contact[], company: string): Contact[] {
  const key = normalizeCompany(company);
  if (!key) return [];
  return contacts
    .filter((c) => normalizeCompany(c.company) === key)
    .sort((a, b) => rank(a) - rank(b)
      || Number(isDecisionMaker(b.role)) - Number(isDecisionMaker(a.role))
      || a.name.localeCompare(b.name));
}

/** Title of a real opportunity at this company, or undefined. Never guessed. */
export function openingFor(opportunities: Opportunity[], company: string): string | undefined {
  const key = normalizeCompany(company);
  if (!key) return undefined;
  return opportunities.find((o) => normalizeCompany(o.company) === key && o.title)?.title;
}

/** Reason the handoff must not be offered, or null. Opt-outs and policy blocks are respected. */
export function handoffBlockedReason(c: Contact): string | null {
  if (c.qualificationStatus === 'OptedOut' || c.status === 'Do not contact') return 'Opted out: do not contact.';
  if (c.qualificationStatus === 'BlockedByPolicy') return 'Blocked by policy: do not contact.';
  return null;
}

export const isRequested = (c: Contact) => c.status === REQUESTED_STATUS;

/** Only plain web links are shown, so a stored value can never become a script link. */
export { safeHttpUrl } from './safeUrl';
