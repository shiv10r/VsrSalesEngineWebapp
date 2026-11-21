import { X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { ImportResult, ImportRow, LocalLeadOptions, WriteResult } from '../../types/localLeads';
import { MAX_IMPORT_ROWS, fieldLabel, mapColumns, parseCsv, toImportRows } from '../../utils/csvParse';
import { ImportResultView } from './ImportResultView';

interface Props {
  options: LocalLeadOptions;
  onClose: () => void;
  onImport: (sourceLabel: string, rows: ImportRow[]) => Promise<WriteResult<ImportResult>>;
}

const MAX_FILE_BYTES = 2_000_000;

export function ImportCsvModal({ options, onClose, onImport }: Props) {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [defaultDistrict, setDefaultDistrict] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, true, onClose);

  // The file is read and parsed in the browser; only the cleaned rows are sent when you confirm.
  const parsed = useMemo(() => {
    const table = parseCsv(text);
    if (table.length === 0) return null;
    const map = mapColumns(table[0]);
    return { map, ...toImportRows(table, map, defaultDistrict), hasName: map.mapping.businessName !== undefined };
  }, [text, defaultDistrict]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setProblem('That file is larger than 2 MB. Split it into smaller files.'); return; }
    setProblem('');
    setText(await file.text());
    if (!label.trim()) setLabel(file.name.replace(/\.[^.]+$/, ''));
  };

  const missingDistrict = parsed ? parsed.rows.filter(r => !r.district).length : 0;
  const canImport = Boolean(parsed && parsed.hasName && parsed.rows.length > 0 && label.trim() && !busy);

  const submit = async () => {
    if (!parsed || !canImport) return;
    setBusy(true);
    setProblem('');
    const res = await onImport(label.trim(), parsed.rows);
    setBusy(false);
    if (res.ok) setResult(res.value);
    else setProblem(res.message);
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className="modal-box modal-card" role="dialog" aria-modal="true" aria-labelledby="ll-imp-title"
        tabIndex={-1} style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <h3 id="ll-imp-title">Import local leads from a CSV</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="modal-body ll-form">
          {result ? <ImportResultView result={result} skipped={parsed?.skipped ?? []} /> : (
            <>
              {problem && <div className="ll-alert" role="alert">{problem}</div>}
              <p className="ll-muted">
                Use a list you are allowed to use. The file stays in your browser until you confirm. Up to {MAX_IMPORT_ROWS} rows.
                Columns we recognise: name, category, district, address, phone, website, rating, reviews.
              </p>
              <div className="ll-field">
                <label htmlFor="ll-imp-file">CSV file</label>
                <input id="ll-imp-file" type="file" accept=".csv,.txt,text/csv" onChange={e => void onFile(e.target.files?.[0])} />
              </div>
              <div className="ll-field">
                <label htmlFor="ll-imp-text">…or paste the rows (first line = column names)</label>
                <textarea id="ll-imp-text" rows={4} value={text} onChange={e => setText(e.target.value)}
                  placeholder={'name,category,district,phone,website\nSharma Dental Clinic,Clinic,Lucknow,9876543210,'} />
              </div>
              {parsed && !parsed.hasName && (
                <div className="ll-alert" role="alert">No business-name column found. Name one of the columns "name" or "business name".</div>
              )}
              {parsed && parsed.hasName && (
                <>
                  <div className="ll-detected" aria-label="Detected columns">
                    {parsed.map.detected.map(d => (
                      <span key={d.field} className="ll-chip">{d.header} → {fieldLabel(d.field)}</span>
                    ))}
                    {parsed.map.unmapped.length > 0 && (
                      <span className="ll-muted">Ignored: {parsed.map.unmapped.join(', ')}</span>
                    )}
                  </div>
                  <div className="ll-two">
                    <div className="ll-field">
                      <label htmlFor="ll-imp-label">Source label *</label>
                      <input id="ll-imp-label" value={label} maxLength={80} onChange={e => setLabel(e.target.value)}
                        placeholder="e.g. Lucknow clinics list, Nov 2026" />
                    </div>
                    <div className="ll-field">
                      <label htmlFor="ll-imp-district">District for rows without one</label>
                      <select id="ll-imp-district" value={defaultDistrict} onChange={e => setDefaultDistrict(e.target.value)}>
                        <option value="">None</option>
                        {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <p className="ll-muted" role="status">
                    {parsed.rows.length} row{parsed.rows.length === 1 ? '' : 's'} ready
                    {parsed.skipped.length > 0 ? `, ${parsed.skipped.length} skipped (no business name)` : ''}
                    {parsed.truncated ? `, only the first ${MAX_IMPORT_ROWS} will be sent` : ''}
                    {missingDistrict > 0 ? `. ${missingDistrict} have no district.` : '.'}
                  </p>
                  <div className="ll-scroll">
                    <table className="ll-table ll-preview">
                      <caption className="sr-only">Preview of the first 10 rows</caption>
                      <thead><tr><th>Business</th><th>Category</th><th>District</th><th>Phone</th><th>Website</th></tr></thead>
                      <tbody>
                        {parsed.rows.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td>{r.businessName}</td><td>{r.category ?? '—'}</td><td>{r.district ?? '—'}</td>
                            <td>{r.phone ?? '—'}</td><td>{r.website ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {result
            ? <button type="button" className="btn primary" onClick={onClose}>Done</button>
            : (
              <>
                <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
                <button type="button" className="btn primary" disabled={!canImport} onClick={() => void submit()}>
                  {busy ? 'Importing…' : `Import ${parsed ? parsed.rows.length : 0} leads`}
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
