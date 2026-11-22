import { Search, X } from 'lucide-react';
import type { LocalLeadFilters } from '../../hooks/useLocalLeads';
import type { LocalLeadOptions } from '../../types/localLeads';

interface Props {
  options: LocalLeadOptions;
  filters: LocalLeadFilters;
  searchInput: string;
  onSearch: (value: string) => void;
  onChange: (patch: Partial<LocalLeadFilters>) => void;
  onClear: () => void;
}

export function FilterBar({ options, filters, searchInput, onSearch, onChange, onClear }: Props) {
  const active = filters.district || filters.category || filters.status || filters.noWebsite || searchInput;
  return (
    <div className="ll-filters" role="search" aria-label="Filter local leads">
      <label className="ll-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="search"
          value={searchInput}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search business, phone or address"
          aria-label="Search local leads"
        />
      </label>
      <select aria-label="District" value={filters.district} onChange={e => onChange({ district: e.target.value })}>
        <option value="">All districts</option>
        {options.districts.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select aria-label="Category" value={filters.category} onChange={e => onChange({ category: e.target.value })}>
        <option value="">All categories</option>
        {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select aria-label="Status" value={filters.status} onChange={e => onChange({ status: e.target.value })}>
        <option value="">All statuses</option>
        {options.statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <label className="ll-check">
        <input type="checkbox" checked={filters.noWebsite} onChange={e => onChange({ noWebsite: e.target.checked })} />
        <span>No website only</span>
      </label>
      {active && (
        <button type="button" className="ll-clear" onClick={onClear}>
          <X size={13} aria-hidden="true" /> Clear filters
        </button>
      )}
    </div>
  );
}
