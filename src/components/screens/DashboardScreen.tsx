import {
  CalendarClock, ChevronRight, MessageSquareText, Plus, RefreshCw, Search, Send, ShieldAlert,
  Target, Users,
} from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import { DashboardAgentPanel } from '../agents/DashboardAgentPanel';
import { LeadHeatmap } from '../agents/LeadHeatmap';
import type { AppCtx } from '../../appContext';

export function DashboardScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, go, notify, setModal, kpi, opportunities, outreachRows, campaigns, contacts,
    activeTab, setActiveTab, opportunitiesTable, schedules,
  } = ctx;

  const counts = new Map<string, number>();
  opportunities.forEach(o => counts.set(o.source, (counts.get(o.source) || 0) + 1));
  const bySource = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      {pageHeading('Dashboard', 'Your stored leads, outreach and schedules at a glance.', (
        <>
          <Button icon={RefreshCw} onClick={() => { go('Discover'); notify('Ready to configure a discovery run'); }}>Run discovery</Button>
          <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>New campaign</Button>
        </>
      ), 'YOUR WORKSPACE')}
      <DashboardAgentPanel ctx={ctx} />
      <LeadHeatmap />
      <div className="kpi-grid">
        {kpi('Opportunities found', `${opportunities.length}`, Target, 'blue')}
        {kpi('Outreach drafts', `${outreachRows.length}`, Send, 'violet')}
        {kpi('Active campaigns', `${campaigns.filter(c => c.status === 'Active').length}`, MessageSquareText, 'green')}
        {kpi('Contacts', `${contacts.length}`, Users, 'amber')}
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
          <div><h2>Sales workspace</h2><p>Latest opportunities, outreach and scheduled activity</p></div>
          <button className="text-link" onClick={() => go('Opportunities')}>View all opportunities <ChevronRight size={14} /></button>
        </div>
        <div className="tabs">
          {['Recent opportunities', 'Outreach activity', 'Scheduled runs'].map(t => (
            <button className={activeTab === t ? 'selected' : ''} onClick={() => setActiveTab(t)} key={t}>{t}</button>
          ))}
        </div>
        {activeTab === 'Recent opportunities' ? opportunitiesTable(opportunities.slice(0, 4), true) :
         activeTab === 'Outreach activity' ? (
           outreachRows.length === 0
             ? <p className="muted-cell">No outreach drafts yet.</p>
             : <div className="activity-list">{outreachRows.slice(0, 5).map((r, i) => (
                 <div className="activity-row" key={i}><div className="activity-info"><strong>{r.company}</strong><p>{r.subject}</p></div><span className="activity-time">{r.status}</span></div>
               ))}</div>
         ) : (
           schedules.length === 0
             ? <p className="muted-cell">No schedules found.</p>
             : <div className="activity-list">{schedules.map(sc => (
                 <div className="activity-row" key={sc.id}><div className="activity-info"><strong>{sc.name}</strong><p>{sc.isEnabled ? 'On' : 'Off'}</p></div><span className="activity-time">{sc.isEnabled ? `Next: ${new Date(sc.nextRunAtUtc).toLocaleString()}` : 'Not running'}</span></div>
               ))}</div>
         )}
      </section>
      <div className="bottom-grid">
        <section className="panel panel-pad">
          <div className="panel-heading"><div><h2>Readiness review</h2><p>Separate from opportunity qualification</p></div><Pill type="amber">{opportunities.filter(o => o.docs).length} need review</Pill></div>
          <div className="readiness-callout">
            <div className="callout-icon"><ShieldAlert size={18} /></div>
            <div>
              <strong>Vendor documents are not assumed</strong>
              <p>Keep interested work visible while requirements such as GST, insurance or vendor onboarding are tracked separately.</p>
              <button className="text-link" onClick={() => go('Vendor readiness')}>Open readiness queue <ChevronRight size={14} /></button>
            </div>
          </div>
        </section>
        <section className="panel panel-pad">
          <div className="panel-heading"><div><h2>Quick actions</h2><p>Get started without automation setup</p></div></div>
          <div className="quick-grid">
            <button onClick={() => go('Discover')}><div className="quick-icon blue"><Search size={18} /></div><strong>Find opportunities</strong><small>Search selected sources</small></button>
            <button onClick={() => setModal({ type: 'opportunity' })}><div className="quick-icon green"><Plus size={18} /></div><strong>Add manually</strong><small>Log a lead or project</small></button>
            <button onClick={() => go('Outreach')}><div className="quick-icon violet"><Send size={18} /></div><strong>Review outreach</strong><small>Drafts and replies</small></button>
            <button onClick={() => go('Schedules')}><div className="quick-icon amber"><CalendarClock size={18} /></div><strong>Set a schedule</strong><small>Recurring discovery</small></button>
          </div>
        </section>
      </div>
    </>
  );
}
