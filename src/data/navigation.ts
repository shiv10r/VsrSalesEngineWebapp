import {
  Activity, Bot, CalendarClock, Globe2, LayoutDashboard,
  MapPin, Search, Settings, Target, Users,
} from 'lucide-react';

export const navGroups = [
  { title: 'WORKSPACE', items: [
    ['Dashboard', LayoutDashboard], ['Opportunities', Target], ['Local Leads', MapPin], ['Discover', Search],
    ['Contacts', Users]
  ]},
  { title: 'AUTOMATION', items: [
    ['Agents', Bot], ['Schedules', CalendarClock], ['Sources', Globe2], ['Activity log', Activity]
  ]},
  { title: 'CONTROL', items: [
    ['Settings', Settings]
  ]}
];
