import { Search } from 'lucide-react';
import { Campaign, Contact, Opportunity } from '../types';

export const seedOpportunities: Opportunity[] = [
  {
    id: 'OP-1001',
    company: 'Northstar Digital',
    title: 'Senior .NET / React Engineer',
    source: 'Company careers',
    location: 'Remote · India',
    found: 'Today, 10:42 AM',
    status: 'Qualified',
    fit: 'High',
    type: 'Direct project',
    docs: true,
    sourceUrl: 'https://example.com/careers/northstar',
    evidenceSnippet: 'Looking for full-stack .NET and React platform engineering support.'
  }
];

export const seedContacts: Contact[] = [
  {
    id: 'CNT-1001',
    name: 'Maya Patel',
    company: 'Northstar Digital',
    role: 'Engineering Manager',
    email: 'maya.patel@example.com',
    source: 'Company website',
    sourceUrl: 'https://example.com/careers/northstar',
    channelBasis: 'ExplicitBusinessContact',
    status: 'Verified',
    qualificationStatus: 'Verified',
    isRoleAccount: false
  }
];

export const seedCampaigns: Campaign[] = [
  {
    id: 'CMP-1001',
    name: '.NET Modernization Outreach',
    audience: '.NET & Cloud Engineering',
    sent: 24,
    replies: 5,
    status: 'Active',
    next: 'Today, 2:30 PM',
    mode: 'ApprovalRequired',
    senderName: 'VSR Outreach Lead',
    senderEmail: 'outreach@vsrtechnologies.com',
    senderAddress: '100 Enterprise Way, Suite 400, Austin TX 78701',
    dailySendLimit: 25
  }
];

export const seedActivities = [
  {
    icon: Search,
    color: 'blue',
    title: 'Discovery run completed',
    detail: 'Company careers · 1 high-fit match verified',
    time: '10:42 AM',
    state: 'success'
  }
];
