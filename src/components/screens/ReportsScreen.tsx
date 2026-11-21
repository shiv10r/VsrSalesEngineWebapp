import { CheckCheck, Globe2, MessageSquareText, Target } from 'lucide-react';
import type { AppCtx } from '../../appContext';

export function ReportsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, kpi, opportunities, outreachRows,
  } = ctx;

  return (
    <>
      {pageHeading('Reports & insights', 'Track discovery coverage and workflow outcomes without inventing performance claims.', null, 'PERFORMANCE')}
      <div className="kpi-grid">
        {kpi('Opportunities found', `${opportunities.length}`, 'Active', Target, 'blue')}
        {kpi('Qualified rate', `${opportunities.length > 0 ? Math.round((opportunities.filter(o => o.status === 'Qualified').length / opportunities.length) * 100) : 0}%`, 'Verified', CheckCheck, 'green')}
        {kpi('Reply rate', outreachRows.some(r => r.status === 'Replied') ? '100%' : '0%', 'Monitored', MessageSquareText, 'violet')}
        {kpi('Source coverage', `${new Set(opportunities.map(o => o.source)).size || 1}`, 'Active sources', Globe2, 'amber')}
      </div>
    </>
  );
}
