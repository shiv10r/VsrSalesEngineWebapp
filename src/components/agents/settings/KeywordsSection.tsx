import type { AgentSettingsState } from '../../../hooks/useAgentSettings';
import { TagInput } from './TagInput';

export function KeywordsSection({ s }: { s: AgentSettingsState }) {
  const { target, excluded } = s.draft!.keywords;
  return (
    <section className="as-section" aria-labelledby="as-kw-h">
      <h3 id="as-kw-h">Keywords</h3>
      <TagInput
        id="as-kw-target" label="Look for" readOnly={s.readOnly} tags={target}
        help="Postings that mention these score higher."
        onChange={list => s.setKeywords('target', list)}
      />
      <TagInput
        id="as-kw-excluded" label="Skip" readOnly={s.readOnly} tags={excluded}
        help="Postings that mention these are dropped by the filter."
        onChange={list => s.setKeywords('excluded', list)}
      />
    </section>
  );
}
