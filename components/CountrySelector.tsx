'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Globe, ChevronDown, Search, X } from 'lucide-react';

interface Country {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

interface CountrySelectorProps {
  selectedCountry: string | null;
  onCountryChange: (code: string, name: string) => void;
}

export default function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCountries() {
      try {
        const response = await fetch('https://de1.api.radio-browser.info/json/countries');
        if (!response.ok) throw new Error('Failed to fetch countries');
        const data = await response.json();
        if (!cancelled) {
          const sorted = data
            .filter((c: Country) => c.iso_3166_1 && c.name)
            .sort((a: Country, b: Country) => b.stationcount - a.stationcount);
          setCountries(sorted);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        if (!cancelled) setLoading(false);
      }
    }
    fetchCountries();
    return () => { cancelled = true; };
  }, []);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    const query = searchQuery.trim().toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.iso_3166_1.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return !prev;
    });
  }, []);

  const handleSelect = useCallback((code: string, name: string) => {
    onCountryChange(code, name);
    setIsOpen(false);
  }, [onCountryChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-label="Select country"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-card-hover transition-all duration-300 text-sm"
      >
        <Globe size={16} className="text-muted" />
        <span className="max-w-[100px] truncate">{selectedCountry || 'Country'}</span>
        <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 scrollbar-hide">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries…"
                aria-label="Search countries"
                className="w-full pl-8 pr-8 py-1.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted hover:text-foreground hover:bg-card-hover transition-colors duration-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="p-4 text-center text-muted text-sm">Loading countries...</div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-muted text-sm">No countries found</div>
            ) : (
              <ul className="py-1">
                {filteredCountries.map((country) => (
                  <li key={country.iso_3166_1}>
                    <button
                      onClick={() => handleSelect(country.iso_3166_1, country.name)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-card-hover transition-colors duration-200 flex items-center justify-between ${
                        selectedCountry === country.iso_3166_1
                          ? 'text-primary bg-card-hover'
                          : 'text-foreground'
                      }`}
                    >
                      <span className="truncate">{country.name}</span>
                      <span className="text-xs text-muted ml-2">{country.stationcount}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
