export function statusTone(status: string) {
  if (['New', 'Qualified', 'Interested'].includes(status)) return status === 'New' ? 'blue' : 'green';
  if (['Needs review', 'Readiness hold'].includes(status)) return status === 'Readiness hold' ? 'amber' : 'violet';
  return 'neutral';
}
