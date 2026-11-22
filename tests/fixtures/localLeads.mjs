export const options = {
  districts: ['Gautam Buddh Nagar', 'Ghaziabad', 'Lucknow', 'Kanpur Nagar', 'Varanasi', 'Azamgarh'],
  categories: ['Healthcare', 'Education & coaching', 'Restaurants & cafes', 'Retail', 'Real estate', 'Hotels & travel', 'MSME & manufacturing', 'Services', 'Other'],
  statuses: ['New', 'Contacted', 'Interested', 'Won', 'Lost'],
};

const base = {
  address: '', phone: '', website: '', hasWebsite: false, rating: null, reviewCount: null,
  source: 'CSV import', sourceLabel: 'Lucknow clinics', status: 'New', notes: '',
  createdBy: 'sales@vsrsalesengine.com', createdAtUtc: '2026-11-22T10:00:00Z', updatedAtUtc: '2026-11-22T10:00:00Z',
};

export const leads = [
  {
    ...base, id: 'LL-1', businessName: 'Sharma Dental Clinic', category: 'Healthcare',
    categoryReason: 'Name contains "dental" and "clinic"', district: 'Lucknow', address: 'Hazratganj',
    phone: '98765 43210', website: '', hasWebsite: false, rating: 4.5, reviewCount: 120,
  },
  {
    ...base, id: 'LL-2', businessName: 'Bright Future Coaching', category: 'Education & coaching',
    categoryReason: 'Name contains "coaching"', district: 'Gautam Buddh Nagar', phone: '011234',
    website: 'brightfuture.example', hasWebsite: true, status: 'Contacted', notes: 'Asked for a quote',
  },
  {
    ...base, id: 'LL-3', businessName: 'Evil Co', category: 'Other', categoryReason: '', district: 'Varanasi',
    website: 'javascript:alert(1)', hasWebsite: true,
  },
];

export const page = { items: leads, total: 3, page: 1, pageSize: 25 };

export const summary = {
  total: 3,
  noWebsite: 1,
  byDistrict: [
    { district: 'Lucknow', count: 2 }, { district: 'Gautam Buddh Nagar', count: 1 },
  ],
  byCategory: [
    { category: 'Healthcare', count: 2 }, { category: 'Education & coaching', count: 1 },
  ],
  grid: [
    { district: 'Lucknow', category: 'Healthcare', count: 2 },
    { district: 'Gautam Buddh Nagar', category: 'Education & coaching', count: 1 },
  ],
};

export const emptySummary = { total: 0, noWebsite: 0, byDistrict: [], byCategory: [], grid: [] };
export const emptyPage = { items: [], total: 0, page: 1, pageSize: 25 };
