import '../../styles/linkedin.css';
import type { RelationToPost } from '../../types';
import { RELATION_LABEL } from '../../utils/linkedinHandoff';

/** Small chip saying how a person is connected to the post. Nothing when unknown. */
export function RelationChip({ relation }: { relation?: RelationToPost | null }) {
  if (!relation) return null;
  return <span className={`li-badge li-rel-${relation}`}>{RELATION_LABEL[relation]}</span>;
}
