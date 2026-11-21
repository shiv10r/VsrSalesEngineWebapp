import { Bookmark, CheckCircle2 } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function SearchResultsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, go, notify, lastRunResult, opportunities, opportunitiesTable,
  } = ctx;

  return (
    <>
      {pageHeading('Search results', 'Review illustrative matches and their source evidence before qualifying them.', (
        <>
          <Button onClick={() => go('Discover')}>Edit search</Button>
          <Button variant="primary" icon={Bookmark} onClick={() => notify('Search profile saved in session.')}>Save search</Button>
        </>
      ), 'DISCOVERY RUN')}
      <div className="run-status">
        <div className="run-icon"><CheckCircle2 size={18} /></div>
        <div>
          <strong>{lastRunResult ? `Run ${lastRunResult.runId} completed` : 'Search run completed'}</strong>
          <p>
            {lastRunResult
              ? `${lastRunResult.newMatchesCount} new matches · ${lastRunResult.duplicateCount} duplicate(s) evaluated · ${lastRunResult.evaluatedCount} total candidates`
              : `${opportunities.length} matches · Source evidence recorded`}
          </p>
        </div>
        <Pill type="green">{lastRunResult?.status || 'Completed'}</Pill>
      </div>

      {lastRunResult && lastRunResult.sourceMetrics && (
        <div className="metric-strip" style={{ display: 'flex', gap: '10px', margin: '14px 0', flexWrap: 'wrap' }}>
          {lastRunResult.sourceMetrics.map((sm, i) => (
            <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 14px', flex: '1', minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>{sm.sourceName}</strong>
                <Pill type={sm.status === 'Success' ? 'green' : sm.status === 'PolicyRestricted' ? 'amber' : 'neutral'}>
                  {sm.status}
                </Pill>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                Fetched: <b>{sm.recordsFetched}</b> · New: <b>{sm.newMatches}</b>
                {sm.rejectedByPolicy > 0 && <span style={{ color: '#d97706', marginLeft: '6px' }}>Policy restricted</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="panel table-panel">
        <div className="panel-heading"><div><h2>Potential matches</h2><p>Validate opening details and contact channels before outreach.</p></div></div>
        {opportunitiesTable()}
      </section>
    </>
  );
}
