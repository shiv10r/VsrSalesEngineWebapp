import { ApiCore } from './http';
import { createAuthApi } from './auth';
import { createOpportunitiesApi } from './opportunities';
import { createSourcesApi } from './sources';
import { createContactsApi } from './contacts';
import { createSchedulesApi } from './schedules';
import { createAgentsApi } from './agents';
import { createLocalLeadsApi } from './localLeads';

const core = new ApiCore();

export const api = {
  setToken: (token: string | null) => core.setToken(token),
  getToken: () => core.getToken(),
  ...createAuthApi(core),
  ...createOpportunitiesApi(core),
  ...createSourcesApi(core),
  ...createContactsApi(core),
  ...createSchedulesApi(core),
  ...createAgentsApi(core),
  ...createLocalLeadsApi(core),
};

export type Api = typeof api;
