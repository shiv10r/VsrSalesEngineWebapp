import '../../styles/linkedin.css';
import type { Contact } from '../../types';
import { LinkedInHandoff } from './LinkedInHandoff';
import { RelationChip } from './RelationChip';
import { LINKEDIN_CAPTION, companySearchUrl, contactsForCompany, isHandle } from '../../utils/linkedinHandoff';

interface Props {
  company: string;
  contacts: Contact[];
  openingTitle?: string;
  guest: boolean;
  onNotify: (msg: string) => void;
  onMarkRequested: (contact: Contact, requested: boolean) => Promise<void> | void;
}

/** Everyone connected to the post, with manual LinkedIn handoff controls (lead detail drawer). */
export function LinkedInSection({ company, contacts, openingTitle, guest, onNotify, onMarkRequested }: Props) {
  const people = contactsForCompany(contacts, company);

  return (
    <section className="li-section" aria-label="LinkedIn handoff">
      <h4>People connected to this post</h4>

      {people.length === 0 && (
        <p className="li-empty">
          No one connected to this post was found on the company site or in the post.{' '}
          <a href={companySearchUrl(company)} target="_blank" rel="noopener noreferrer">Search LinkedIn manually</a>.
        </p>
      )}

      {people.map((p) => (
        <div className="li-person" key={p.id || p.email}>
          <div className="li-person-head">
            <strong>{isHandle(p) ? `@${p.name.trim().replace(/^@/, '')}` : p.name}</strong>
            {p.role && <span className="li-role">{p.role}</span>}
            <RelationChip relation={p.relationToPost} />
          </div>
          <LinkedInHandoff contact={p} openingTitle={openingTitle} guest={guest} onNotify={onNotify} onMarkRequested={onMarkRequested} />
        </div>
      ))}

      {guest && people.length > 0 && <p className="li-hint">Guests can't change contacts. Sign in to mark a request.</p>}
      <p className="li-caption">{LINKEDIN_CAPTION}</p>
    </section>
  );
}
