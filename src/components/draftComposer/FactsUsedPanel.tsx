
import type { DraftComposerState } from './useDraftComposer';

export function FactsUsedPanel({ state }: { state: DraftComposerState }) {
  const {
    factsUsed,
  } = state;

  return (
    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
        VERIFIED SOURCE FACTS EMBEDDED:
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {factsUsed.map((fact, idx) => (
          <span
            key={idx}
            style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontWeight: 500 }}
          >
            ✓ {fact}
          </span>
        ))}
      </div>
    </div>
  );
}
