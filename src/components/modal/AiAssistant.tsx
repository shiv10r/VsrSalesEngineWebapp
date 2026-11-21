import { Sparkles } from 'lucide-react';
import type { ModalForm } from './useModalForm';

export function AiAssistant({ form, modal }: { form: ModalForm; modal: any }) {
  const {
    aiPrompt, setAiPrompt, handleAiAutoFill, isAiLoading, samplePrompts,
  } = form;

  return (
    <div className="ai-form-assistant">
      <div className="ai-assistant-header">
        <span className="ai-assistant-badge">
          <Sparkles size={12} /> Gemini 2.5 Flash Form Assistant
        </span>
        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Auto-generates structured fields</span>
      </div>
      <div className="ai-assistant-row">
        <input
          className="ai-assistant-input"
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder={
            modal.type === 'opportunity' ? 'Describe opportunity or paste job snippet...' :
            modal.type === 'contact' ? 'Paste email signature, directory text or card info...' :
            modal.type === 'campaign' ? 'Describe campaign target market or pitch goal...' :
            'Describe your requirements...'
          }
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiAutoFill(); } }}
        />
        <button
          type="button"
          className="ai-assistant-btn"
          onClick={() => handleAiAutoFill()}
          disabled={isAiLoading || !aiPrompt.trim()}
        >
          <Sparkles size={13} /> {isAiLoading ? 'Synthesizing...' : 'AI Auto-Fill'}
        </button>
      </div>
      {samplePrompts.length > 0 && (
        <div className="ai-prompt-samples">
          <span className="ai-sample-label">Try sample:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-sample-chip"
              onClick={() => {
                setAiPrompt(p);
                handleAiAutoFill(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
