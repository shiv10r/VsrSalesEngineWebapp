export function LocalLeadsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading local leads">
      <div className="ll-strip">
        {[0, 1, 2, 3].map(i => <div key={i} className="ag-skel" style={{ height: 76 }} />)}
      </div>
      <div className="ag-skel" style={{ height: 180, marginBottom: 14 }} />
      <div className="ag-skel" style={{ height: 260 }} />
    </div>
  );
}

export function LocalLeadsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="ag-panel ag-state" role="alert">
      <h3>Can't reach the local leads service</h3>
      <p>The backend didn't respond. Nothing is shown here until it does, so no number on this page is a guess.</p>
      <button type="button" className="btn primary" onClick={onRetry}>Try again</button>
    </div>
  );
}

export const NO_MATCH_MESSAGE =
  'No saved leads match. This page searches leads you saved. Use Find on Google Maps to search live, or import a CSV.';

export function LocalLeadsEmpty({ filtered, canWrite, onImport, onClear, onFindOnMaps }: {
  filtered: boolean;
  canWrite: boolean;
  onImport: () => void;
  onClear: () => void;
  /** Switches to the Google Maps panel, prefilled with the current search text. */
  onFindOnMaps?: () => void;
}) {
  if (filtered) {
    return (
      <div className="ag-state">
        <h3>No leads match these filters</h3>
        <p>{NO_MATCH_MESSAGE}</p>
        <div className="ms-fallbacks">
          {onFindOnMaps && <button type="button" className="btn primary" onClick={onFindOnMaps}>Find on Google Maps</button>}
          <button type="button" className="btn secondary" onClick={onClear}>Clear filters</button>
        </div>
      </div>
    );
  }
  return (
    <div className="ag-state">
      <h3>No local leads yet</h3>
      <p>
        Import a CSV of businesses (columns such as name, category, district, phone, website, rating) or add a lead by
        hand. Each lead is sorted into a category and a district so you can see where they cluster.
      </p>
      {canWrite
        ? <button type="button" className="btn primary" onClick={onImport}>Import a CSV</button>
        : <p>Sign in to import or add leads.</p>}
    </div>
  );
}
