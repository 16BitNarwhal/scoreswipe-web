'use client';

import { Search, SortAsc } from 'lucide-react';
import { useId } from 'react';

interface SpotlightSearchProps {
  value: string;
  onChange: (value: string) => void;
  sort: 'recent' | 'alpha';
  onSortChange: (value: 'recent' | 'alpha') => void;
}

export const SpotlightSearch = ({ value, onChange, sort, onSortChange }: SpotlightSearchProps) => {
  const inputId = useId();

  return (
    <div className="rounded-3xl border border-brand-100 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Search className="h-5 w-5 text-brand-300" />
          <label htmlFor={inputId} className="sr-only">
            Search scores
          </label>
          <input
            id={inputId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search scores"
            className="w-full bg-transparent text-brand-500 placeholder:text-brand-300 focus:outline-none"
            type="search"
          />
        </div>
        <div className="flex items-center gap-3 md:w-auto">
          <SortAsc className="h-5 w-5 text-brand-300" />
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as 'recent' | 'alpha')}
            className="rounded-full border border-brand-100 bg-white px-4 py-2 text-sm text-brand-400"
          >
            <option value="recent">Recently updated</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>
  );
};
