import { Pencil } from 'lucide-react';
import { useState } from 'react';

interface Props {
  name: string;
  notes: string;
  readOnly: boolean;
  busy: boolean;
  onSave: (notes: string) => Promise<boolean>;
}

/** Shows the note; signed-in users can edit it in place. */
export function NoteCell({ name, notes, readOnly, busy, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);

  const open = () => { setDraft(notes); setEditing(true); };
  const save = async () => {
    if (draft.trim() === notes.trim()) { setEditing(false); return; }
    if (await onSave(draft.trim())) setEditing(false);
  };

  if (editing) {
    return (
      <div className="ll-note-edit">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          maxLength={1000}
          aria-label={`Notes for ${name}`}
          autoFocus
          onKeyDown={e => { if (e.key === 'Escape') setEditing(false); }}
        />
        <div className="ll-note-actions">
          <button type="button" className="btn primary sm" disabled={busy} onClick={() => void save()}>Save</button>
          <button type="button" className="btn secondary sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ll-note">
      <span className={notes ? 'll-note-text' : 'll-muted'}>{notes || 'No notes'}</span>
      {!readOnly && (
        <button type="button" className="ll-icon" onClick={open} aria-label={`Edit notes for ${name}`} title="Edit notes">
          <Pencil size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
