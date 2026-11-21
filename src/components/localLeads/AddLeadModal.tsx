import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { LocalLead, LocalLeadOptions, NewLocalLead, WriteResult } from '../../types/localLeads';
import { isValidWebsite } from '../../utils/localLeadsFormat';

interface Props {
  options: LocalLeadOptions;
  onClose: () => void;
  onSubmit: (body: NewLocalLead) => Promise<WriteResult<LocalLead>>;
}

const EMPTY = {
  businessName: '', district: '', category: '', phone: '', website: '', address: '', rating: '', reviewCount: '', notes: '',
};
type Form = typeof EMPTY;

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (!f.businessName.trim()) errors.businessName = 'Enter the business name.';
  if (!f.district) errors.district = 'Choose a district.';
  if (!isValidWebsite(f.website)) errors.website = 'Enter a web address such as example.com.';
  if (f.rating.trim() !== '' && !(Number(f.rating) >= 0 && Number(f.rating) <= 5)) errors.rating = 'Rating is a number from 0 to 5.';
  if (f.reviewCount.trim() !== '' && !/^\d+$/.test(f.reviewCount.trim())) errors.reviewCount = 'Reviews is a whole number.';
  return errors;
}

export function AddLeadModal({ options, onClose, onSubmit }: Props) {
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, true, onClose);

  const set = (key: keyof Form) => (e: { target: { value: string } }) => setF(prev => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    setServerError('');
    const body: NewLocalLead = { businessName: f.businessName.trim(), district: f.district };
    if (f.category) body.category = f.category;
    for (const k of ['phone', 'website', 'address', 'notes'] as const) if (f[k].trim()) body[k] = f[k].trim();
    if (f.rating.trim()) body.rating = Number(f.rating);
    if (f.reviewCount.trim()) body.reviewCount = parseInt(f.reviewCount, 10);
    const res = await onSubmit(body);
    setBusy(false);
    if (res.ok) onClose();
    else setServerError(res.message);
  };

  const field = (key: keyof Form, label: string, input: React.ReactNode) => (
    <div className="ll-field">
      <label htmlFor={`ll-add-${key}`}>{label}</label>
      {input}
      {errors[key] && <span className="ll-err" id={`ll-add-${key}-err`} role="alert">{errors[key]}</span>}
    </div>
  );
  const text = (key: keyof Form, extra: Record<string, unknown> = {}) => (
    <input id={`ll-add-${key}`} value={f[key]} onChange={set(key)} aria-invalid={Boolean(errors[key]) || undefined}
      aria-describedby={errors[key] ? `ll-add-${key}-err` : undefined} {...extra} />
  );

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="modal-box modal-card" role="dialog" aria-modal="true" aria-labelledby="ll-add-title"
        tabIndex={-1} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 id="ll-add-title">Add a local lead</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body ll-form">
            {serverError && <div className="ll-alert" role="alert">{serverError}</div>}
            {field('businessName', 'Business name *', text('businessName', { maxLength: 120, autoFocus: true }))}
            <div className="ll-two">
              {field('district', 'District *', (
                <select id="ll-add-district" value={f.district} onChange={set('district')}
                  aria-invalid={Boolean(errors.district) || undefined}>
                  <option value="">Choose a district</option>
                  {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ))}
              {field('category', 'Category', (
                <select id="ll-add-category" value={f.category} onChange={set('category')}>
                  <option value="">Detect from the name</option>
                  {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ))}
            </div>
            <div className="ll-two">
              {field('phone', 'Phone', text('phone', { type: 'tel', maxLength: 30 }))}
              {field('website', 'Website', text('website', { maxLength: 200, placeholder: 'example.com' }))}
            </div>
            {field('address', 'Address', text('address', { maxLength: 250 }))}
            <div className="ll-two">
              {field('rating', 'Rating (0-5)', text('rating', { inputMode: 'decimal' }))}
              {field('reviewCount', 'Reviews', text('reviewCount', { inputMode: 'numeric' }))}
            </div>
            {field('notes', 'Notes', (
              <textarea id="ll-add-notes" rows={3} maxLength={1000} value={f.notes} onChange={set('notes')} />
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Adding…' : 'Add lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
