import { X } from 'lucide-react';
import { useState } from 'react';
import { addTags, removeTag } from '../../../utils/agentSettingsForm';

interface Props {
  id: string;
  label: string;
  help: string;
  tags: string[];
  readOnly: boolean;
  onChange: (next: string[]) => void;
}

/** Type a keyword and press Enter or comma to add it; Backspace on an empty box removes the last one. */
export function TagInput({ id, label, help, tags, readOnly, onChange }: Props) {
  const [text, setText] = useState('');

  const commit = () => {
    if (text.trim() === '') return;
    onChange(addTags(tags, text));
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && text === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="as-tags">
      <label className="as-label" htmlFor={id}>{label}</label>
      <div className="as-tagbox">
        {tags.map(tag => (
          <span className="as-tag" key={tag}>
            {tag}
            {!readOnly && (
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(removeTag(tags, tag))}>
                <X size={11} aria-hidden="true" />
              </button>
            )}
          </span>
        ))}
        {!readOnly && (
          <input
            id={id}
            value={text}
            placeholder={tags.length === 0 ? 'Type a keyword, press Enter' : 'Add another'}
            aria-describedby={`${id}-help`}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commit}
          />
        )}
      </div>
      <p id={`${id}-help`} className="as-help">{help}</p>
    </div>
  );
}
