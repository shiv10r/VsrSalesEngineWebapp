import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import '../../styles/linkedin.css';
import type { Contact } from '../../types';
import { copyText } from '../../utils/clipboard';
import {
  CONNECTION_NOTE_LIMIT, FOLLOW_UP_LIMIT, buildConnectionNote, buildFollowUp, handoffBlockedReason,
  isHandle, isRequested, peopleSearchUrl, safeHttpUrl, textLength,
} from '../../utils/linkedinHandoff';
import { RelationChip } from './RelationChip';

interface Props {
  contact: Contact;
  /** Title of a real opening at this company, if we have one. */
  openingTitle?: string;
  guest: boolean;
  compact?: boolean;
  onNotify: (msg: string) => void;
  onMarkRequested: (contact: Contact, requested: boolean) => Promise<void> | void;
}

export function LinkedInHandoff({ contact, openingTitle, guest, compact = false, onNotify, onMarkRequested }: Props) {
  const [busy, setBusy] = useState(false);
  const blocked = handoffBlockedReason(contact);
  if (blocked) return <p className="li-blocked">{blocked}</p>;

  const input = { contact, roleTitle: openingTitle };
  const note = buildConnectionNote(input);
  const requested = isRequested(contact);
  const handle = isHandle(contact);
  const postUrl = contact.relationToPost === 'poster' ? safeHttpUrl(contact.sourceUrl) : undefined;
  const guestReason = "Guests can't change contacts. Sign in to edit.";

  const copy = async (text: string, label: string) => {
    const ok = await copyText(text);
    onNotify(ok ? `${label} copied (${textLength(text)} characters). Paste it on LinkedIn.` : `Couldn't copy ${label.toLowerCase()}. Open the preview and copy it by hand.`);
  };

  const toggle = async (next: boolean) => {
    setBusy(true);
    try {
      await onMarkRequested(contact, next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`li-handoff${compact ? ' li-compact' : ''}`}>
      {compact && <RelationChip relation={contact.relationToPost} />}
      {handle && (
        <p className="li-handle">This is a username from the post, not a confirmed name. The LinkedIn search is a best guess.</p>
      )}
      <div className="li-actions">
        <a className="li-btn li-link" href={peopleSearchUrl(contact.name, contact.company)} target="_blank" rel="noopener noreferrer">
          Find on LinkedIn <ExternalLink size={12} aria-hidden="true" />
        </a>
        {postUrl && !compact && (
          <a className="li-btn li-link" href={postUrl} target="_blank" rel="noopener noreferrer">
            View original post <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
        <button type="button" className="li-btn" onClick={() => copy(note, 'Connection note')}>Copy connection note</button>
        {!compact && (
          <button type="button" className="li-btn" onClick={() => copy(buildFollowUp(input), 'Follow-up message')}>Copy follow-up message</button>
        )}
        <label className="li-requested" title={guest ? guestReason : undefined}>
          <input type="checkbox" checked={requested} disabled={guest || busy} onChange={(e) => toggle(e.target.checked)} />
          <span>Mark as requested</span>
        </label>
      </div>
      {!compact && (
        <details className="li-preview">
          <summary>Preview notes ({textLength(note)}/{CONNECTION_NOTE_LIMIT} and up to {FOLLOW_UP_LIMIT} characters)</summary>
          <p><strong>Connection note:</strong> {note}</p>
          <p><strong>Follow-up:</strong> {buildFollowUp(input)}</p>
        </details>
      )}
    </div>
  );
}
