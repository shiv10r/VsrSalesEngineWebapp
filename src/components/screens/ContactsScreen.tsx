import { Mail, Plus, Trash2 } from 'lucide-react';
import { Button, Pill } from '../ui/Primitives';
import type { AppCtx } from '../../appContext';

export function ContactsScreen({ ctx }: { ctx: AppCtx }) {
  const {
    pageHeading, setModal, contacts, handleQualifyContact, handleDeleteContact,
  } = ctx;

  return (
    <>
      {pageHeading('Contacts', 'Keep people, source evidence, communication preference and do-not-contact status together.', <Button variant="primary" icon={Plus} onClick={() => setModal({ type: 'contact' })}>Add contact</Button>, 'RELATIONSHIP MANAGEMENT')}
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>CONTACT</th><th>COMPANY</th><th>ROLE</th><th>EMAIL / CHANNEL</th><th>SOURCE & PROVENANCE</th><th>QUALIFICATION</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id || c.email}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.isRoleAccount && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--red-600, #dc2626)', background: 'var(--red-50, #fef2f2)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>Role account</span>}
                  </td>
                  <td>{c.company}</td>
                  <td className="muted-cell">{c.role}</td>
                  <td><span className="email-cell"><Mail size={13} />{c.email}</span></td>
                  <td className="muted-cell">
                    <div>{c.source}</div>
                    {c.sourceUrl && (
                      <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                        Source link
                      </a>
                    )}
                    {c.channelBasis && <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{c.channelBasis}</div>}
                  </td>
                  <td>
                    <Pill type={c.qualificationStatus === 'Verified' ? 'green' : c.qualificationStatus === 'BlockedByPolicy' || c.qualificationStatus === 'OptedOut' ? 'red' : 'neutral'}>
                      {c.qualificationStatus || 'Unverified'}
                    </Pill>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {c.qualificationStatus !== 'Verified' && (
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer' }}
                          onClick={() => handleQualifyContact(c.id, 'Verified', 'Ready for outreach')}
                        >
                          Verify
                        </button>
                      )}
                      {c.qualificationStatus !== 'OptedOut' && (
                        <button
                          className="btn btn-sm btn-outline"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}
                          onClick={() => handleQualifyContact(c.id, 'OptedOut', 'Do not contact', 'Opted out by user')}
                        >
                          Opt Out
                        </button>
                      )}
                      <button
                        className="row-delete"
                        title="Delete contact"
                        onClick={() => handleDeleteContact(c.id)}
                        style={{ marginLeft: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
