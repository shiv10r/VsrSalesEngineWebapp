import type { ImportResult } from '../../types/localLeads';

interface Props {
  result: ImportResult;
  /** Rows dropped in the browser before upload (no business name). */
  skipped: { row: number; message: string }[];
}

export function ImportResultView({ result, skipped }: Props) {
  const problems = [
    ...skipped.map(s => ({ row: s.row, message: `${s.message} (not uploaded)` })),
    ...result.errors,
  ].sort((a, b) => a.row - b.row);

  return (
    <div role="status" aria-live="polite">
      <div className="ll-strip ll-result">
        <div className="ll-stat"><span className="ll-stat-label">Imported</span><strong className="ll-stat-value">{result.imported}</strong></div>
        <div className="ll-stat"><span className="ll-stat-label">Already in your list</span><strong className="ll-stat-value">{result.duplicates}</strong></div>
        <div className="ll-stat"><span className="ll-stat-label">Skipped by the server</span><strong className="ll-stat-value">{result.skipped}</strong></div>
      </div>
      {problems.length > 0 && (
        <>
          <h4 className="ll-h4">Rows that need a look</h4>
          <ul className="ll-errors">
            {problems.slice(0, 50).map((p, i) => <li key={`${p.row}-${i}`}>Row {p.row}: {p.message}</li>)}
          </ul>
          {problems.length > 50 && <p className="ll-muted">…and {problems.length - 50} more.</p>}
        </>
      )}
    </div>
  );
}
