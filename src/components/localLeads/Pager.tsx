import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pageCount } from '../../utils/localLeadsFormat';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

export function Pager({ page, pageSize, total, onPage }: Props) {
  const pages = pageCount(total, pageSize);
  if (total <= pageSize) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  return (
    <nav className="ll-pager" aria-label="Local leads pages">
      <span>{first}–{last} of {total.toLocaleString('en-IN')}</span>
      <div>
        <button type="button" className="btn secondary sm" disabled={page <= 1} onClick={() => onPage(page - 1)}
          aria-label="Previous page"><ChevronLeft size={14} aria-hidden="true" /> Prev</button>
        <span className="ll-page-no" aria-current="page">Page {page} of {pages}</span>
        <button type="button" className="btn secondary sm" disabled={page >= pages} onClick={() => onPage(page + 1)}
          aria-label="Next page">Next <ChevronRight size={14} aria-hidden="true" /></button>
      </div>
    </nav>
  );
}
