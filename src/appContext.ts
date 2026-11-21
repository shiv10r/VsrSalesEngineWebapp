import type { BaseCtx } from './hooks/useBaseController';
import type { PageHelpers } from './components/pageHelpers';

export type AppCtx = BaseCtx & PageHelpers;
