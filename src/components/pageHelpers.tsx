import {
  ChevronRight, ExternalLink, Filter, Search,
  SlidersHorizontal, Trash2,
} from 'lucide-react';
import { Button, EmptyHint, Pill } from './ui/Primitives';
import { Opportunity } from '../types';
import { statusTone } from '../utils/statusTone';
import type { BaseCtx } from '../hooks/useBaseController';

export function makePageHelpers(ctx: BaseCtx) {
  const { query, setQuery, statusFilter, setStatusFilter, sourceFilter, setSourceFilter, opportunities, filteredOpportunities, setDetail, handleDeleteOpportunity } = ctx;

  function pageHeading(title: string, subtitle: string, actions: any = null, eyebrow: any = null) {
    return (
      <div className="page-heading">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="heading-actions">{actions}</div>
      </div>
    );
  }

  function kpi(title: string, value: string, Icon: any, tone: string = 'blue', foot?: string) {
    return (
      <div className="kpi-card" key={title}>
        <div className={`kpi-icon ${tone}`}><Icon size={18} /></div>
        <div className="kpi-content">
          <div className="kpi-title">{title}</div>
          <div className="kpi-value">{value}</div>
          {foot && <div className="kpi-foot"><span>{foot}</span></div>}
        </div>
      </div>
    );
  }

  function tableControls(showSource: boolean = true) {
    return (
      <div className="table-controls">
        <label className="table-search">
          <Search size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search records..." />
        </label>
        <div className="control-right">
          <div className="select-wrap">
            <Filter size={14} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All statuses</option>
              {['New', 'Needs review', 'Qualified', 'Contacted', 'Interested'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {showSource && (
            <div className="select-wrap">
              <SlidersHorizontal size={14} />
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                <option>All sources</option>
                {Array.from(new Set(opportunities.map(o => o.source))).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <Button small onClick={() => { setQuery(''); setStatusFilter('All statuses'); setSourceFilter('All sources'); }}>Reset</Button>
        </div>
      </div>
    );
  }

  function opportunitiesTable(rows: Opportunity[] = filteredOpportunities, compact: boolean = false) {
    return (
      <div className={`table-wrap ${compact ? 'compact' : ''}`}>
        <table>
          <thead>
            <tr>
              <th>COMPANY / OPPORTUNITY</th>
              <th>SOURCE</th>
              <th>LOCATION</th>
              <th>FIT</th>
              <th>STATUS</th>
              <th>FOUND</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id}>
                <td>
                  <div className="company-cell">
                    <div className={`company-logo logo-${o.company.length % 5}`}>
                      {o.company.split(' ').map(p => p[0]).join('').slice(0, 2)}
                    </div>
                    <div><strong>{o.company}</strong><small>{o.title}</small></div>
                  </div>
                </td>
                <td>
                  <span className="source-cell">
                    <span className="source-mini">
                      {o.source.includes('Hacker') ? 'HN' : o.source.includes('We Work') ? 'WWR' : o.source.includes('Remotive') ? 'RMT' : o.source.includes('Jobicy') ? 'JBC' : o.source.includes('LinkedIn') ? 'in' : o.source.includes('board') ? 'JB' : o.source.includes('careers') ? 'WE' : o.source.includes('procurement') ? 'GOV' : '⚡'}
                    </span>
                    {o.source}
                  </span>
                </td>
                <td className="muted-cell">{o.location}</td>
                <td><Pill type={o.fit === 'High' ? 'green' : o.fit === 'Medium' ? 'blue' : 'neutral'}>{o.fit}</Pill></td>
                <td>
                  <Pill type={statusTone(o.status)} dot>{o.status}</Pill>
                </td>
                <td className="muted-cell">{o.found}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {o.sourceUrl && (
                      <a href={o.sourceUrl} target="_blank" rel="noopener noreferrer" className="row-more" title="Open live external posting" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button className="row-more" onClick={() => setDetail(o)} title="View details"><ChevronRight size={16} /></button>
                    <button className="row-delete" onClick={(e) => { e.stopPropagation(); handleDeleteOpportunity(o.id); }} title="Delete opportunity"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <EmptyHint
            title="No matching opportunities"
            description="Try changing your search or filters."
            icon={Search}
            action="Clear filters"
            onAction={() => { setQuery(''); setStatusFilter('All statuses'); setSourceFilter('All sources'); }}
          />
        )}
      </div>
    );
  }

  return { pageHeading, kpi, tableControls, opportunitiesTable };
}

export type PageHelpers = ReturnType<typeof makePageHelpers>;
