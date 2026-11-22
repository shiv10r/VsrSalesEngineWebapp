import {
  CalendarClock, Check, Clock3, Globe2, Search, ShieldCheck, Sparkles, Zap,
} from 'lucide-react';
import { Button } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function DiscoverScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, go, query, setQuery, setSourceFilters, sourceFilters, isRunningDiscovery, sources,
    handleRunDiscovery,
  } = ctx;

  return (
    <>
      {pageHeading('Discover opportunities', 'Search public sources manually or configure a repeatable discovery run.', <Button icon={Clock3} onClick={() => go('Schedules')}>View schedules</Button>, 'OPPORTUNITY DISCOVERY')}
      <div className="discovery-layout">
        <div className="discovery-main">
          <section className="panel panel-pad">
            <div className="section-title-row">
              <div><h2>Build a search</h2><p>Start narrow, inspect the evidence, then save the search if it is useful.</p></div>
              <span className="step-chip">STEP 01</span>
            </div>
            <label className="field-label">What are you looking for?</label>
            <div className="big-input">
              <Search size={18} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. .NET developer, React contractor, software delivery project" />
              <button onClick={() => { setQuery(''); setSourceFilters([]); }}>Clear</button>
            </div>
            <div className="field-grid">
              <label className="field-label">Location or market<input placeholder="Uttar Pradesh, India" defaultValue="Uttar Pradesh, India" /></label>
              <label className="field-label">Opportunity type
                <select defaultValue="All relevant types">
                  <option>All relevant types</option>
                  <option>Individual developer roles</option>
                  <option>Project / consulting work</option>
                  <option>Procurement / vendor opportunities</option>
                </select>
              </label>
              <label className="field-label">Date published
                <select defaultValue="Last 7 days">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </label>
              <label className="field-label">Keywords to exclude<input placeholder="internship, unpaid..." /></label>
            </div>
            <div className="divider-line" />
            <div className="section-title-row">
              <div><h3>Choose sources</h3><p>Only sources that are switched on under Sources can be read.</p></div>
              <span className="selected-count">{sourceFilters.length} selected</span>
            </div>
            <div className="source-choice-grid">
              {sources.length === 0 && <p className="muted-cell">No sources are registered yet, or the server cannot be reached.</p>}
              {sources.filter(x => x.category !== 'Social').map(x => ({ name: x.name, desc: x.description, tag: x.policyStatus === 'Active' ? 'On' : 'Off', icon: x.policyStatus === 'Active' ? Zap : Globe2 })).map(s => (
                <button
                  key={s.name}
                  className={`source-choice ${sourceFilters.includes(s.name) ? 'checked' : ''}`}
                  onClick={() => setSourceFilters(prev => prev.includes(s.name) ? prev.filter(x => x !== s.name) : [...prev, s.name])}
                >
                  <span className="source-choice-icon"><s.icon size={18} /></span>
                  <span><strong>{s.name}</strong><small>{s.desc}</small><em>{s.tag}</em></span>
                  <span className={`check-box ${sourceFilters.includes(s.name) ? 'is-checked' : ''}`}>{sourceFilters.includes(s.name) && <Check size={13} />}</span>
                </button>
              ))}
            </div>
            <div className="form-footer">
              <span><ShieldCheck size={15} /> Platform access rules are respected.</span>
              <Button
                variant="primary"
                icon={Search}
                disabled={isRunningDiscovery}
                onClick={handleRunDiscovery}
              >
                {isRunningDiscovery ? 'Running discovery...' : 'Run discovery'}
              </Button>
            </div>
          </section>
        </div>
        <aside className="discovery-side">
          <section className="panel panel-pad">
            <div className="panel-heading"><div><h3>Run mode</h3><p>Choose how discovery starts</p></div></div>
            <div className="mode-option selected"><div className="radio-dot" /><div><strong>Run once now</strong><small>Manual, on-demand search</small></div><Zap size={17} /></div>
            <button className="mode-option" onClick={() => go('Schedules')}><div className="radio-empty" /><div><strong>Schedule automatically</strong><small>Run daily or weekly</small></div><CalendarClock size={17} /></button>
            <div className="tip-card"><Sparkles size={17} /><div><strong>Keep search evidence</strong><p>Each result retains source URL, date found, snippet, and retrieval status for later validation.</p></div></div>
          </section>
        </aside>
      </div>
    </>
  );
}
