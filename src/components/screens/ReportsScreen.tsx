import { CheckCheck, Globe2, MessageSquareText, Target } from 'lucide-react';
import type { AppCtx } from '../../appContext';

export function ReportsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, kpi, opportunities, outreachRows,
  } = ctx;

  const qualified = opportunities.filter(o => o.status === 'Qualified').length;
  const replies = outreachRows.filter(r => r.status === 'Replied').length;

  return (
    <>
      {pageHeading('Reports & insights', 'Track discovery coverage and workflow outcomes without inventing performance claims.', null, 'PERFORMANCE')}
      <div className="kpi-grid">
        {kpi('Opportunities found', `${opportunities.length}`, Target, 'blue')}
        {kpi('Qualified', `${qualified}`, CheckCheck, 'green', opportunities.length > 0 ? `${Math.round((qualified / opportunities.length) * 100)}% of opportunities` : 'No opportunities yet')}
        {kpi('Replies', `${replies}`, MessageSquareText, 'violet')}
        {kpi('Sources with results', `${new Set(opportunities.map(o => o.source)).size}`, Globe2, 'amber')}
      </div>
    </>
  );
}
