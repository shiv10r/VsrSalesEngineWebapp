import { Download, Filter, Info, Plus, Zap } from 'lucide-react';
import { Button } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function OpportunitiesScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, handleRunDiscovery, isRunningDiscovery, notify, setModal, opportunities,
    tableControls, opportunitiesTable,
  } = ctx;

  return (
    <>
      {pageHeading('Opportunities', 'Review, qualify, and track sales opportunities from every configured source.', (
        <>
          <Button
            variant="primary"
            icon={Zap}
            onClick={handleRunDiscovery}
            disabled={isRunningDiscovery}
          >
            {isRunningDiscovery ? 'Fetching live leads...' : '⚡ Fetch Real Live Contract Leads'}
          </Button>
          <Button icon={Download} onClick={() => notify('CSV export is a prototype action.')}>Export</Button>
          <Button icon={Plus} onClick={() => setModal({ type: 'opportunity' })}>Add manually</Button>
        </>
      ), 'PIPELINE')}
      <div className="summary-strip">
        <div><span>All opportunities</span><strong>{opportunities.length}</strong></div>
        <div><span>New to review</span><strong>{opportunities.filter(o => ['New', 'Needs review'].includes(o.status)).length}</strong></div>
        <div><span>Qualified</span><strong>{opportunities.filter(o => o.status === 'Qualified').length}</strong></div>
        <div><span>Readiness hold</span><strong>{opportunities.filter(o => o.docs).length}</strong></div>
        <div className="strip-note"><Info size={14} />Readiness is tracked separately from sales fit.</div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div><h2>All opportunities</h2><p>Latest discovery results and manually added leads</p></div>
          <Button small icon={Filter} onClick={() => notify('Filters active.')}>Filter list</Button>
        </div>
        {tableControls(true)}
        {opportunitiesTable()}
      </section>
    </>
  );
}
