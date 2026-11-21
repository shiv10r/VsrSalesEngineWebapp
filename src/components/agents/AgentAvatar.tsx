import { agentColor, initialOf } from '../../utils/agentFormat';
import type { AgentStatus } from '../../types/agents';

interface Props {
  id: string;
  name: string;
  status?: AgentStatus;
  small?: boolean;
}

export function AgentAvatar({ id, name, status, small }: Props) {
  return (
    <span className={`ag-avatar${small ? ' sm' : ''}`} style={{ background: agentColor(id) }} aria-hidden="true">
      {initialOf(name)}
      {status && <i className={`ag-dot ${status}`} />}
    </span>
  );
}
