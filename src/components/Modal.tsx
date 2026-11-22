import { Plus, X } from 'lucide-react';
import { ContactFields } from './modal/ContactFields';
import { OpportunityFields } from './modal/OpportunityFields';
import { ScheduleFields } from './modal/ScheduleFields';
import { useModalForm } from './modal/useModalForm';
import { Button } from './ui/Primitives';

export function Modal({ modal, onClose, onCreate }: any) {
  const form = useModalForm();
  const {
    name, secondary, contactRole, contactEmail, source, location, fit, type,
    sourceUrl, channelBasis, contactNotes, evidenceSnippet, frequency,
    runCap, quietStart, quietEnd, timezone,
  } = form;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div>
            <h3>
              {modal.type === 'contact' ? 'Add Contact' :
               modal.type === 'opportunity' ? 'Add Opportunity' :
               modal.type === 'schedule' ? 'New Automation Schedule' : 'Information'}
            </h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={16} /></button>
        </div>
        <div className="modal-body">
          {modal.type === 'schedule' && <ScheduleFields form={form} />}

          {modal.type === 'contact' && <ContactFields form={form} />}

          {modal.type === 'opportunity' && <OpportunityFields form={form} />}

          {modal.type === 'help' && (
            <p style={{ lineHeight: 1.6, color: 'var(--text)' }}>
              Welcome to VSR Sales Engine. Use the left navigation to find local business leads, review job-posting opportunities, keep contacts and schedule the lead-finding agents.
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
              source,
              location,
              fit,
              opportunityType: type,
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
              <Plus size={14} style={{ marginRight: '6px' }} /> Create {modal.type === 'opportunity' ? 'Opportunity' : modal.type === 'contact' ? 'Contact' : 'Schedule'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
