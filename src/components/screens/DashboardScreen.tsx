import {
  CalendarClock, ChevronRight, MapPin, Plus, RefreshCw, Search, Target, Users,
} from 'lucide-react';
import { Button } from '../ui/Primitives';
import { DashboardAgentPanel } from '../agents/DashboardAgentPanel';
import { LeadHeatmap } from '../agents/LeadHeatmap';
import type { AppCtx } from '../../appContext';

export function DashboardScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, go, notify, setModal, kpi, opportunities, contacts,
    activeTab, setActiveTab, opportunitiesTable, schedules,
  } = ctx;

  const counts = new Map<string, number>();
  opportunities.forEach(o => counts.set(o.source, (counts.get(o.source) || 0) + 1));
  const bySource = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      {pageHeading('Dashboard', 'Your stored leads, contacts and schedules at a glance.', (
        <>
          <Button icon={RefreshCw} onClick={() => { go('Discover'); notify('Ready to configure a discovery run'); }}>Run discovery</Button>
          <Button variant="primary" icon={MapPin} onClick={() => go('Local Leads')}>Find local leads</Button>
        </>
      ), 'YOUR WORKSPACE')}
      <DashboardAgentPanel ctx={ctx} />
      <LeadHeatmap />
      <div className="kpi-grid">
        {kpi('Opportunities found', `${opportunities.length}`, Target, 'blue')}
        {kpi('Contacts', `${contacts.length}`, Users, 'amber')}
        {kpi('Schedules on', `${schedules.filter(sc => sc.isEnabled).length}`, CalendarClock, 'green')}
      </div>
      <div className="dashboard-grid">
        <section className="panel source-panel">
          <div className="panel-heading">
            <div><h2>Opportunities by source</h2><p>Counted from the opportunities stored on the server</p></div>
            <button className="text-link" onClick={() => go('Sources')}>Manage sources</button>
          </div>
          <div className="donut-legend">
            {bySource.length === 0 && <span>No opportunities stored yet.</span>}
            {bySource.map(([name, count]) => (
              <span key={name}><i className="legend-dot blue-dot" />{name} <b>{count}</b></span>
            ))}
          </div>
        </section>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div><h2>Sales workspace</h2><p>Latest opportunities and scheduled activity</p></div>
          <button className="text-link" onClick={() => go('Opportunities')}>View all opportunities <ChevronRight size={14} /></button>
        </div>
        <div className="tabs">
          {['Recent opportunities', 'Scheduled runs'].map(t => (
            <button className={activeTab === t ? 'selected' : ''} onClick={() => setActiveTab(t)} key={t}>{t}</button>
          ))}
        </div>
        {activeTab !== 'Scheduled runs' ? opportunitiesTable(opportunities.slice(0, 4), true) : (
           schedules.length === 0
             ? <p className="muted-cell">No schedules found.</p>
             : <div className="activity-list">{schedules.map(sc => (
                 <div className="activity-row" key={sc.id}><div className="activity-info"><strong>{sc.name}</strong><p>{sc.isEnabled ? 'On' : 'Off'}</p></div><span className="activity-time">{sc.isEnabled ? `Next: ${new Date(sc.nextRunAtUtc).toLocaleString()}` : 'Not running'}</span></div>
               ))}</div>
         )}
      </section>
      <div className="bottom-grid">
        <section className="panel panel-pad">
          <div className="panel-heading"><div><h2>Quick actions</h2><p>Get started without automation setup</p></div></div>
          <div className="quick-grid">
            <button onClick={() => go('Discover')}><div className="quick-icon blue"><Search size={18} /></div><strong>Find opportunities</strong><small>Search selected sources</small></button>
            <button onClick={() => setModal({ type: 'opportunity' })}><div className="quick-icon green"><Plus size={18} /></div><strong>Add manually</strong><small>Log a lead or project</small></button>
            <button onClick={() => go('Local Leads')}><div className="quick-icon violet"><MapPin size={18} /></div><strong>Local leads</strong><small>Businesses in Uttar Pradesh</small></button>
            <button onClick={() => go('Schedules')}><div className="quick-icon amber"><CalendarClock size={18} /></div><strong>Set a schedule</strong><small>Recurring discovery</small></button>
          </div>
        </section>
      </div>
    </>
  );
}
