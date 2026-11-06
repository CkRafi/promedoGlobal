import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { COUNTRY_CODES, CountryCode } from '../data/countryCodes';

interface CountryCodeSelectProps {
  id?: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  id = 'select-country-code',
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alphabetically sorted list of countries
  const sortedCountries = useMemo(() => {
    return [...COUNTRY_CODES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Find active selected country
  const selectedCountry = useMemo(() => {
    return (
      sortedCountries.find(c => c.code === value) ||
      sortedCountries.find(c => c.code === '+971') ||
      sortedCountries[0]
    );
  }, [sortedCountries, value]);

  // Filter countries alphabetically based on search query
  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedCountries;

    const normalizedDigits = query.replace(/^\+/, '');

    return sortedCountries.filter(c => {
      const matchName = c.name.toLowerCase().includes(query);
      const matchCode = c.code.toLowerCase().includes(query) || c.code.replace(/^\+/, '').startsWith(normalizedDigits);
      const matchIso = c.iso.toLowerCase() === query;
      return matchName || matchCode || matchIso;
    });
  }, [sortedCountries, searchQuery]);

  // Handle outside clicks to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (country: CountryCode) => {
    onChange(country.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden native select to preserve DOM selector compatibility and form data */}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {sortedCountries.map(c => (
          <option key={`${c.iso}-${c.code}`} value={c.code}>
            {c.flag} {c.code} ({c.name})
          </option>
        ))}
      </select>

      {/* Searchable Trigger Button */}
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full h-[50px] px-3 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200 focus:border-[#3853A4] focus:ring-2 focus:ring-[#3853A4]/20 transition-all outline-none flex items-center justify-between gap-1.5 cursor-pointer text-left"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select Country Code"
      >
        <span className="flex items-center gap-1.5 truncate text-xs sm:text-sm font-bold text-gray-800">
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#3853A4]' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 top-[calc(100%+6px)] w-[260px] sm:w-[280px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Header */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full h-9 pl-8 pr-7 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#3853A4] focus:ring-2 focus:ring-[#3853A4]/20 text-xs font-medium text-gray-800 outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Alphabetical Country List */}
          <div className="max-h-[220px] overflow-y-auto space-y-0.5 overscroll-contain pr-1 custom-scrollbar">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No matching country found
              </div>
            ) : (
              filteredCountries.map(country => {
                const isSelected = country.code === value && country.name === selectedCountry.name;
                return (
                  <button
                    key={`${country.iso}-${country.code}`}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#3853A4]/10 text-[#3853A4] font-bold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                      <span className="text-base leading-none shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-[#3853A4]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {country.code}
                      </span>
                      {isSelected && <Check size={12} className="text-[#3853A4]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
