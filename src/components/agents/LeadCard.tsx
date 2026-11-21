import type { AgentLead } from '../../types/agents';
import { leadReasonsPreview, safeUrl } from '../../utils/agentFormat';
import { ScoreRing } from './ScoreRing';

interface Props {
  lead: AgentLead;
  canOpen: boolean;
  onOpen: (opportunityId: string) => void;
}

export function LeadCard({ lead, canOpen, onOpen }: Props) {
  const { shown, extra } = leadReasonsPreview(lead.reasons);
  const href = safeUrl(lead.url);
  return (
    <div className="ag-lead">
      <ScoreRing score={lead.score} />
      <div className="ag-lead-main">
        <div className="ag-lead-co">{lead.company}</div>
        <div className="ag-lead-title">{lead.title}</div>
        <div className="ag-chips">
          <span className="ag-chip src">{lead.source}</span>
          {shown.map(r => <span key={r} className="ag-chip">{r}</span>)}
          {extra > 0 && <span className="ag-chip">+{extra} more</span>}
        </div>
        {((canOpen && lead.opportunityId) || href) && (
          <div className="ag-lead-actions">
            {canOpen && lead.opportunityId && (
              <button type="button" className="ag-link" onClick={() => onOpen(lead.opportunityId as string)}>Open lead</button>
            )}
            {href && <a className="ag-link" href={href} target="_blank" rel="noopener noreferrer">View posting ↗</a>}
          </div>
        )}
      </div>
    </div>
  );
}
