export function statusTone(status: string) {
  if (['New', 'Qualified', 'Interested'].includes(status)) return status === 'New' ? 'blue' : 'green';
  if (status === 'Needs review') return 'violet';
  return 'neutral';
}
