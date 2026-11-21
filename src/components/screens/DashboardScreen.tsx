import {
  Activity, CalendarClock, ChevronRight, MessageSquareText, MoreHorizontal, Plus, RefreshCw,
  Search, Send, ShieldAlert, Target, Users,
} from 'lucide-react';
import { ActivityList, LineChart, ScheduleMini } from '../Helpers';
import { Button, Pill } from '../ui/Primitives';
import { seedActivities } from '../../data/seeds';
import { DashboardAgentPanel } from '../agents/DashboardAgentPanel';
import type { AppCtx } from '../../appContext';

export function DashboardScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, go, notify, setModal, kpi, opportunities, outreachRows, campaigns, contacts,
    activeTab, setActiveTab, opportunitiesTable, scheduled, setScheduled,
  } = ctx;

  return (
    <>
      {pageHeading('Good morning, team', 'Here’s your sales activity at a glance.', (
        <>
          <Button icon={RefreshCw} onClick={() => { go('Discover'); notify('Ready to configure a discovery run'); }}>Run discovery</Button>
          <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'campaign' })}>New campaign</Button>
        </>
      ), 'YOUR WORKSPACE')}
      <div className="notice-inline" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.06)' }}>
        <Activity size={15} style={{ color: '#10b981' }} />
        <span>Live Sales Pipeline active — Real-time telemetry, synchronized opportunity ingestion, and fail-closed compliance guard.</span>
        <button onClick={() => go('Settings')}>Environment settings</button>
      </div>
      <DashboardAgentPanel ctx={ctx} />
      <div className="kpi-grid">
        {kpi('Opportunities found', `${opportunities.length}`, 'Active', Target, 'blue')}
        {kpi('Outreach prepared', `${outreachRows.length}`, 'Active', Send, 'violet')}
        {kpi('Active campaigns', `${campaigns.length}`, 'Active', MessageSquareText, 'green')}
        {kpi('Verified contacts', `${contacts.length}`, 'Active', Users, 'amber')}
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div><h2>Opportunity discovery</h2><p>Results found by day</p></div>
            <div className="range-select">
              <select defaultValue="7 days"><option>7 days</option><option>30 days</option><option>90 days</option></select>
              <MoreHorizontal size={18} />
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot blue-dot" /> Company careers</span>
            <span><i className="legend-dot green-dot" /> Job boards</span>
            <span><i className="legend-dot violet-dot" /> Direct research</span>
          </div>
          <LineChart />
        </section>
        <section className="panel source-panel">
          <div className="panel-heading">
            <div><h2>Opportunities by source</h2><p>Illustrative source mix</p></div>
            <button className="text-link" onClick={() => go('Sources')}>Manage sources</button>
          </div>
          <div className="donut-row">
            <div className="donut-chart"><div><strong>{opportunities.length}</strong><span>Total</span></div></div>
            <div className="donut-legend">
              <span><i className="legend-dot blue-dot" />Company careers <b>{Math.round((opportunities.filter(o => o.source === 'Company careers').length / (opportunities.length || 1)) * 100)}%</b></span>
              {opportunities.some(o => o.source === 'Public job boards') && <span><i className="legend-dot green-dot" />Public job boards <b>{Math.round((opportunities.filter(o => o.source === 'Public job boards').length / (opportunities.length || 1)) * 100)}%</b></span>}
              {opportunities.some(o => o.source === 'Direct research') && <span><i className="legend-dot violet-dot" />Direct research <b>{Math.round((opportunities.filter(o => o.source === 'Direct research').length / (opportunities.length || 1)) * 100)}%</b></span>}
            </div>
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
         activeTab === 'Outreach activity' ? <ActivityList items={seedActivities.slice(0, 3)} /> :
         <ScheduleMini scheduled={scheduled} onToggle={setScheduled} />}
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
