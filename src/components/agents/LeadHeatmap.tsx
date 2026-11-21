import { useHeatmap } from '../../hooks/useHeatmap';
import { LeadHeatmapView } from './LeadHeatmapView';

/** "When leads arrive" card for the Dashboard: loads its own data, so it works wherever it is placed. */
export function LeadHeatmap() {
  const { days, setDays, data, loadState, retry } = useHeatmap(28);
  return <LeadHeatmapView data={data} loadState={loadState} days={days} onDaysChange={setDays} onRetry={retry} />;
}
