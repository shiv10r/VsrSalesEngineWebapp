import { ApiCore } from './http';
import { createAuthApi } from './auth';
import { createOpportunitiesApi } from './opportunities';
import { createSourcesApi } from './sources';
import { createContactsApi } from './contacts';
import { createOutreachApi } from './outreach';
import { createCampaignsApi } from './campaigns';
import { createSchedulesApi } from './schedules';
import { createReliabilityApi } from './reliability';
import { createAiApi } from './ai';

const core = new ApiCore();

export const api = {
  setToken: (token: string | null) => core.setToken(token),
  getToken: () => core.getToken(),
  ...createAuthApi(core),
  ...createOpportunitiesApi(core),
  ...createSourcesApi(core),
  ...createContactsApi(core),
  ...createOutreachApi(core),
  ...createCampaignsApi(core),
  ...createSchedulesApi(core),
  ...createReliabilityApi(core),
  ...createAiApi(core),
};

export type Api = typeof api;
