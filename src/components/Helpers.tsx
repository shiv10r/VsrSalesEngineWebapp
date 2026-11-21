import { Toggle } from './ui/Primitives';

export function SettingRow({ title, desc, children }: any) {
  return (
    <div className="setting-row">
      <div className="setting-copy"><strong>{title}</strong><p>{desc}</p></div>
      <div className="setting-action">{children}</div>
    </div>
  );
}

export function ActivityList({ items }: { items: any[] }) {
  return (
    <div className="activity-list">
      {items.map((it, i) => (
        <div className="activity-row" key={i}>
          <div className={`activity-icon ${it.color}`}><it.icon size={16} /></div>
          <div className="activity-info"><strong>{it.title}</strong><p>{it.detail}</p></div>
          <span className="activity-time">{it.time}</span>
        </div>
      ))}
    </div>
  );
}

export function ScheduleMini({ scheduled, onToggle }: any) {
  return (
    <div className="schedule-mini-list">
      {[{ key: 'daily', title: 'Daily opportunity discovery', time: 'Tomorrow, 8:30 AM' },
        { key: 'followup', title: 'Follow-up reminder digest', time: 'Tomorrow, 10:00 AM' }].map(s => (
        <div className="schedule-mini-item" key={s.key}>
          <div><strong>{s.title}</strong><small>{s.time}</small></div>
          <Toggle checked={!!scheduled[s.key]} onChange={(v: boolean) => onToggle((p: any) => ({ ...p, [s.key]: v }))} label={`Toggle ${s.title}`} />
        </div>
      ))}
    </div>
  );
}

export function LineChart() {
  return (
    <div className="chart-placeholder">
      <svg viewBox="0 0 400 120" className="chart-svg">
        <path d="M 0 100 Q 100 20 200 80 T 400 30" fill="none" stroke="#286BE8" strokeWidth="2.5" />
        <path d="M 0 110 Q 100 60 200 90 T 400 70" fill="none" stroke="#159E7E" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}
