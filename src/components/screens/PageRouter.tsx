import { DashboardScreen } from './DashboardScreen';
import { AgentsScreen } from './AgentsScreen';
import { LocalLeadsScreen } from './LocalLeadsScreen';
import { OpportunitiesScreen } from './OpportunitiesScreen';
import { DiscoverScreen } from './DiscoverScreen';
import { SearchResultsScreen } from './SearchResultsScreen';
import { ContactsScreen } from './ContactsScreen';
import { SchedulesScreen } from './SchedulesScreen';
import { SourcesScreen } from './SourcesScreen';
import { ActivityLogScreen } from './ActivityLogScreen';
import { SettingsScreen } from './SettingsScreen';
import type { AppCtx } from '../../appContext';

export function PageRouter({ ctx }: { ctx: AppCtx }) {
  switch (ctx.page) {
    case 'Dashboard':
      return <DashboardScreen ctx={ctx} />;
    case 'Opportunities':
      return <OpportunitiesScreen ctx={ctx} />;
    case 'Local Leads':
      return <LocalLeadsScreen ctx={ctx} />;
    case 'Discover':
      return <DiscoverScreen ctx={ctx} />;
    case 'Search results':
      return <SearchResultsScreen ctx={ctx} />;
    case 'Contacts':
      return <ContactsScreen ctx={ctx} />;
    case 'Agents':
      return <AgentsScreen ctx={ctx} />;
    case 'Schedules':
      return <SchedulesScreen ctx={ctx} />;
    case 'Sources':
      return <SourcesScreen ctx={ctx} />;
    case 'Activity log':
      return <ActivityLogScreen ctx={ctx} />;
    case 'Settings':
      return <SettingsScreen ctx={ctx} />;
    default:
      return null;
  }
}
