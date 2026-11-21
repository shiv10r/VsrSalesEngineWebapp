import {
  Activity, Bot, CalendarClock, ChartNoAxesCombined, FileCheck2, Globe2, LayoutDashboard,
  MapPin, MessageSquareText, Search, Send, Settings, Target, Users,
} from 'lucide-react';

export const navGroups = [
  { title: 'WORKSPACE', items: [
    ['Dashboard', LayoutDashboard], ['Opportunities', Target], ['Local Leads', MapPin], ['Discover', Search],
    ['Outreach', Send], ['Campaigns', MessageSquareText], ['Contacts', Users]
  ]},
  { title: 'AUTOMATION', items: [
    ['Agents', Bot], ['Schedules', CalendarClock], ['Sources', Globe2], ['Activity log', Activity]
  ]},
  { title: 'INSIGHTS & CONTROL', items: [
    ['Reports', ChartNoAxesCombined], ['Vendor readiness', FileCheck2], ['Settings', Settings]
  ]}
];
