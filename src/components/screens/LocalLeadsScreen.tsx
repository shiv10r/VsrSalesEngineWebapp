import { Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import '../../styles/agents.css';
import '../../styles/local-leads.css';
import '../../styles/maps-search.css';
import type { AppCtx } from '../../appContext';
import { useGoogleMapsSearch } from '../../hooks/useGoogleMapsSearch';
import type { LocalLead } from '../../types/localLeads';
import { AddLeadModal } from '../localLeads/AddLeadModal';
import { DistrictCategoryGrid } from '../localLeads/DistrictCategoryGrid';
import { FilterBar } from '../localLeads/FilterBar';
import { ImportCsvModal } from '../localLeads/ImportCsvModal';
import { LeadsTable } from '../localLeads/LeadsTable';
import { MapsSearchPanel } from '../localLeads/MapsSearchPanel';
import { LocalLeadsEmpty, LocalLeadsError, LocalLeadsSkeleton } from '../localLeads/LocalLeadsStates';
import { Pager } from '../localLeads/Pager';
import { SummaryStrip } from '../localLeads/SummaryStrip';

type Tab = 'saved' | 'maps';

const GUEST_REASON = "Guests can't change leads. Sign in to edit.";

export function LocalLeadsScreen({ ctx }: { ctx: AppCtx }) {
  const { pageHeading, localLeads: s } = ctx;
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('saved');
  const maps = useGoogleMapsSearch({ active: tab === 'maps', guest: s.readOnly, notify: ctx.notify, onSaved: s.reload });

  const findOnMaps = () => {
    // Carry the search box text, and the district and category filters, over to the Google Maps form.
    maps.patchForm({ query: s.searchInput.trim(), district: s.filters.district, category: s.filters.category });
    setTab('maps');
  };

  const heading = pageHeading(
    'Local Leads',
    'Local businesses in Uttar Pradesh, sorted by district and category.',
    (
      <div className="ll-actions">
        <button type="button" className="btn secondary" disabled={s.readOnly}
          title={s.readOnly ? GUEST_REASON : undefined} onClick={() => setImportOpen(true)}>
          <Upload size={15} aria-hidden="true" /><span>Import CSV</span>
        </button>
        <button type="button" className="btn primary" disabled={s.readOnly}
          title={s.readOnly ? GUEST_REASON : undefined} onClick={() => setAddOpen(true)}>
          <Plus size={15} aria-hidden="true" /><span>Add lead</span>
        </button>
      </div>
    ),
    'WORKSPACE',
  );

  if (s.loadState === 'loading' && !s.summary) return <>{heading}<LocalLeadsSkeleton /></>;
  if (!s.summary || !s.options || !s.list) return <>{heading}<LocalLeadsError onRetry={s.retry} /></>;

  const { summary, options, list, filters } = s;
  const filtered = Boolean(filters.district || filters.category || filters.status || filters.noWebsite || filters.q);

  const confirmDelete = (lead: LocalLead) => {
    if (window.confirm(`Delete ${lead.businessName}? This can't be undone.`)) void s.remove(lead);
  };

  return (
    <>
      {heading}
      {s.readOnly && (
        <div className="ll-banner" role="note">Guests can view local leads but can't import, add or edit them. Sign in to do that.</div>
      )}
      <div className="ms-tabs" role="tablist" aria-label="Local leads views">
        <button type="button" role="tab" className="ms-tab" aria-selected={tab === 'saved'} onClick={() => setTab('saved')}>
          Saved leads
        </button>
        <button type="button" role="tab" className="ms-tab" aria-selected={tab === 'maps'} onClick={() => setTab('maps')}>
          Find on Google Maps
        </button>
      </div>
      {tab === 'maps' && <MapsSearchPanel options={options} maps={maps} />}
      {tab === 'saved' && <>
      <SummaryStrip summary={summary} />
      <DistrictCategoryGrid summary={summary} categories={options.categories}
        selected={{ district: filters.district, category: filters.category }} onPick={s.pickCell} />
      <FilterBar options={options} filters={filters} searchInput={s.searchInput} onSearch={s.setSearchInput}
        onChange={s.setFilter} onClear={s.clearFilters} />

      <section className="ag-panel" aria-label="Local leads list">
        <div className="ag-panel-h">
          <h2>Leads</h2>
          <span>{list.total.toLocaleString('en-IN')} {filtered ? 'match' : 'in total'}</span>
        </div>
        {list.items.length === 0 ? (
          <LocalLeadsEmpty filtered={filtered} canWrite={!s.readOnly} onImport={() => setImportOpen(true)}
            onClear={s.clearFilters} onFindOnMaps={findOnMaps} />
        ) : (
          <LeadsTable items={list.items} statuses={options.statuses} readOnly={s.readOnly} busyId={s.busyId}
            onStatus={(lead, status) => void s.update(lead, { status })}
            onNotes={(lead, notes) => s.update(lead, { notes })} onDelete={confirmDelete}
            live={maps.live} onShowLive={maps.showLive} onHideLive={maps.hideLive} />
        )}
        <Pager page={list.page} pageSize={list.pageSize} total={list.total} onPage={s.setPage} />
      </section>

      <p className="ll-note-line">Sources are CSV imports, manual entries and Google Maps results you saved. Categories are assigned by simple keyword rules, not AI.</p>
      </>}

      {addOpen && <AddLeadModal options={options} onClose={() => setAddOpen(false)} onSubmit={s.add} />}
      {importOpen && <ImportCsvModal options={options} onClose={() => setImportOpen(false)} onImport={s.importRows} />}
    </>
  );
}
