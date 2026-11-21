import type { LocalLeadSummary } from '../../types/localLeads';
import { percent, topOf } from '../../utils/localLeadsFormat';

/** Four numbers, all straight from the summary endpoint. */
export function SummaryStrip({ summary }: { summary: LocalLeadSummary }) {
  const topDistrict = topOf(summary.byDistrict);
  const topCategory = topOf(summary.byCategory);
  const cards: { label: string; value: string; hint: string }[] = [
    { label: 'Local leads', value: summary.total.toLocaleString('en-IN'), hint: 'in your list' },
    {
      label: 'Without a website',
      value: summary.noWebsite.toLocaleString('en-IN'),
      hint: summary.total > 0 ? `${percent(summary.noWebsite, summary.total)}% of leads` : 'no leads yet',
    },
    {
      label: 'Top district',
      value: topDistrict ? topDistrict.district : '—',
      hint: topDistrict ? `${topDistrict.count.toLocaleString('en-IN')} leads` : 'no leads yet',
    },
    {
      label: 'Top category',
      value: topCategory ? topCategory.category : '—',
      hint: topCategory ? `${topCategory.count.toLocaleString('en-IN')} leads` : 'no leads yet',
    },
  ];
  return (
    <div className="ll-strip" role="group" aria-label="Local leads summary">
      {cards.map(c => (
        <div key={c.label} className="ll-stat">
          <span className="ll-stat-label">{c.label}</span>
          <strong className="ll-stat-value">{c.value}</strong>
          <span className="ll-stat-hint">{c.hint}</span>
        </div>
      ))}
    </div>
  );
}
