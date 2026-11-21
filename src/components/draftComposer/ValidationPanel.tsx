import { ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { DraftValidationResult } from '../../types';

export function ValidationPanel({ validation }: { validation: DraftValidationResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {validation.prohibitedClaims.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 6, background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem' }}>
          <ShieldCheck size={16} color="#059669" />
          <span><strong>Truthfulness Guard Passed:</strong> No fabricated claims, false guarantees, or unverified claims detected.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 12px', borderRadius: 6, background: '#fef2f2', color: '#991b1b', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <ShieldAlert size={16} color="#dc2626" />
            Prohibited Claims Detected:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validation.prohibitedClaims.map((claim, idx) => (
              <li key={idx}>{claim}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.missingVariables.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 6, background: '#fffbeb', color: '#92400e', fontSize: '0.78rem' }}>
          <TriangleAlert size={16} color="#d97706" />
          <span><strong>Unresolved Placeholders:</strong> {validation.missingVariables.map(v => `{{${v}}}`).join(', ')}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
        <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasUnsubscribeMechanism ? '#ecfdf5' : '#fef2f2', color: validation.hasUnsubscribeMechanism ? '#065f46' : '#991b1b' }}>
          {validation.hasUnsubscribeMechanism ? '✓ Opt-Out Instructions Present' : '✗ Missing Opt-Out Footer'}
        </span>
        <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasPhysicalAddress ? '#ecfdf5' : '#fef2f2', color: validation.hasPhysicalAddress ? '#065f46' : '#991b1b' }}>
          {validation.hasPhysicalAddress ? '✓ Physical Business Address Present' : '✗ Missing Business Address'}
        </span>
        <span style={{ padding: '3px 8px', borderRadius: 4, background: validation.hasSenderIdentity ? '#ecfdf5' : '#fef2f2', color: validation.hasSenderIdentity ? '#065f46' : '#991b1b' }}>
          {validation.hasSenderIdentity ? '✓ Commercial Sender Identity Clear' : '✗ Missing Sender Identity'}
        </span>
      </div>
    </div>
  );
}
