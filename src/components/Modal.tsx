import { Plus, Sparkles, X } from 'lucide-react';
import { AiAssistant } from './modal/AiAssistant';
import { CampaignFields } from './modal/CampaignFields';
import { ContactFields } from './modal/ContactFields';
import { OpportunityFields } from './modal/OpportunityFields';
import { ScheduleFields } from './modal/ScheduleFields';
import { useModalForm } from './modal/useModalForm';
import { Button } from './ui/Primitives';

export function Modal({ modal, onClose, onNotify, onCreate }: any) {
  const form = useModalForm(modal, onNotify);
  const {
    name, secondary, contactRole, contactEmail, source, location, fit, type, docs,
    vendorRequirementNotes, sourceUrl, channelBasis, contactNotes, evidenceSnippet, frequency,
    runCap, quietStart, quietEnd, timezone,
  } = form;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <div className="ai-assistant-badge" style={{ marginBottom: '4px' }}>
              <Sparkles size={11} /> Smart Form System
            </div>
            <h3>
              {modal.type === 'campaign' ? 'Create Sales Campaign' :
               modal.type === 'contact' ? 'Add Contact' :
               modal.type === 'opportunity' ? 'Add Opportunity' :
               modal.type === 'schedule' ? 'New Automation Schedule' : 'Information'}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={16} /></button>
        </div>
        <div className="modal-body">
          {modal.type !== 'help' && <AiAssistant form={form} modal={modal} />}

          {modal.type === 'campaign' && <CampaignFields form={form} />}

          {modal.type === 'schedule' && <ScheduleFields form={form} />}

          {modal.type === 'contact' && <ContactFields form={form} />}

          {modal.type === 'opportunity' && <OpportunityFields form={form} />}

          {modal.type === 'help' && (
            <p style={{ lineHeight: 1.6, color: 'var(--text)' }}>
              Welcome to VSR Sales Engine. Use the left navigation to explore opportunities, build automated discovery runs, draft compliance-verified outreach, and verify vendor readiness documentation.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cancel</Button>
          {modal.type !== 'help' && (
            <Button variant="primary" onClick={() => onCreate({
              type: modal.type,
              name,
              company: modal.type === 'contact' ? secondary : name,
              role: contactRole,
              email: contactEmail,
              title: secondary,
              audience: secondary,
              source,
              location,
              fit,
              opportunityType: type,
              docs,
              vendorRequirementNotes,
              sourceUrl,
              channelBasis,
              notes: contactNotes,
              evidenceSnippet,
              frequency,
              runCap,
              quietHoursStart: quietStart,
              quietHoursEnd: quietEnd,
              timezone,
            })}>
              <Plus size={14} style={{ marginRight: '6px' }} /> Create {modal.type === 'opportunity' ? 'Opportunity' : modal.type === 'contact' ? 'Contact' : modal.type === 'campaign' ? 'Campaign' : 'Schedule'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
