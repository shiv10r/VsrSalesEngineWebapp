
import type { ModalForm } from './useModalForm';

export function ScheduleFields({ form }: { form: ModalForm }) {
  const {
    name, setName, secondary, setSecondary, frequency, setFrequency, runCap, setRunCap,
    quietStart, setQuietStart, quietEnd, setQuietEnd, timezone, setTimezone,
  } = form;

  return (
    <>
      <div className="form-section-divider">Schedule Configuration</div>
      <div className="form-group">
        <label className="form-label"><span>Schedule Name <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Careers & Feeds Scan" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Automated recurring discovery for .NET positions" />
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select className="form-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
            <option value="Daily">Daily</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Run Cap (Requests/Run)</label>
          <input className="form-input" type="number" value={runCap} onChange={e => setRunCap(Number(e.target.value))} min={5} max={500} />
        </div>
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Quiet Hours Start</label>
          <input className="form-input" value={quietStart} onChange={e => setQuietStart(e.target.value)} placeholder="22:00" />
        </div>
        <div className="form-group">
          <label className="form-label">Quiet Hours End</label>
          <input className="form-input" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} placeholder="06:00" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Timezone</label>
        <input className="form-input" value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="UTC" />
      </div>
    </>
  );
}
