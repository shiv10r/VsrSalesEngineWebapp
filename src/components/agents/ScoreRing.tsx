import { scoreTone } from '../../utils/agentFormat';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score }: { score: number | null }) {
  const tone = scoreTone(score);
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <div className={`ag-ring ${tone}`} role="img" aria-label={score == null ? 'Not scored yet' : `Fit score ${score} out of 100`}>
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle className="track" cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" />
        <circle className="bar" cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)} />
      </svg>
      <span>{score == null ? '–' : score}</span>
    </div>
  );
}
