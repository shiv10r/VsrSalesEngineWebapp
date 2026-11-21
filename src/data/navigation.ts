import {
  Activity, CalendarClock, ChartNoAxesCombined, FileCheck2, Globe2, LayoutDashboard,
  MessageSquareText, Search, Send, Settings, Target, Users,
} from 'lucide-react';

export const navGroups = [
  { title: 'WORKSPACE', items: [
    ['Dashboard', LayoutDashboard], ['Opportunities', Target], ['Discover', Search],
    ['Outreach', Send], ['Campaigns', MessageSquareText], ['Contacts', Users]
  ]},
  { title: 'AUTOMATION', items: [
    ['Schedules', CalendarClock], ['Sources', Globe2], ['Activity log', Activity]
  ]},
  { title: 'INSIGHTS & CONTROL', items: [
    ['Reports', ChartNoAxesCombined], ['Vendor readiness', FileCheck2], ['Settings', Settings]
  ]}
];
