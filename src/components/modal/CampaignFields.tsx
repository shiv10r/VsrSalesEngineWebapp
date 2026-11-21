
import type { ModalForm } from './useModalForm';

export function CampaignFields({ form }: { form: ModalForm }) {
  const {
    name, setName, secondary, setSecondary,
  } = form;

  return (
    <>
      <div className="form-section-divider">Campaign Parameters</div>
      <div className="form-group">
        <label className="form-label"><span>Campaign Name <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. .NET API Modernization" />
      </div>
      <div className="form-group">
        <label className="form-label"><span>Target Audience <span className="form-label-required">*</span></span></label>
        <input className="form-input" value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="e.g. Healthcare CTOs · India + Global" />
      </div>
    </>
  );
}
