import { DashboardScreen } from './DashboardScreen';
import { AgentsScreen } from './AgentsScreen';
import { OpportunitiesScreen } from './OpportunitiesScreen';
import { DiscoverScreen } from './DiscoverScreen';
import { SearchResultsScreen } from './SearchResultsScreen';
import { OutreachScreen } from './OutreachScreen';
import { CampaignsScreen } from './CampaignsScreen';
import { ContactsScreen } from './ContactsScreen';
import { SchedulesScreen } from './SchedulesScreen';
import { SourcesScreen } from './SourcesScreen';
import { VendorReadinessScreen } from './VendorReadinessScreen';
import { ActivityLogScreen } from './ActivityLogScreen';
import { ReportsScreen } from './ReportsScreen';
import { SettingsScreen } from './SettingsScreen';
import type { AppCtx } from '../../appContext';

export function PageRouter({ ctx }: { ctx: AppCtx }) {
  switch (ctx.page) {
    case 'Dashboard':
      return <DashboardScreen ctx={ctx} />;
    case 'Opportunities':
      return <OpportunitiesScreen ctx={ctx} />;
    case 'Discover':
      return <DiscoverScreen ctx={ctx} />;
    case 'Search results':
      return <SearchResultsScreen ctx={ctx} />;
    case 'Outreach':
      return <OutreachScreen ctx={ctx} />;
    case 'Campaigns':
      return <CampaignsScreen ctx={ctx} />;
    case 'Contacts':
      return <ContactsScreen ctx={ctx} />;
    case 'Agents':
      return <AgentsScreen ctx={ctx} />;
    case 'Schedules':
      return <SchedulesScreen ctx={ctx} />;
    case 'Sources':
      return <SourcesScreen ctx={ctx} />;
    case 'Vendor readiness':
      return <VendorReadinessScreen ctx={ctx} />;
    case 'Activity log':
      return <ActivityLogScreen ctx={ctx} />;
    case 'Reports':
      return <ReportsScreen ctx={ctx} />;
    case 'Settings':
      return <SettingsScreen ctx={ctx} />;
    default:
      return null;
  }
}
