'use client';

import { useLayoutEffect, useRef } from 'react';
import { RadioStation } from '@/types/radio';
import { useRadioStore } from '@/stores/radioStore';
import { Trash2 } from 'lucide-react';

interface FavoritesProps {
  onStationSelect: (station: RadioStation) => void;
  searchQuery?: string;
}

export default function Favorites({ onStationSelect, searchQuery = '' }: FavoritesProps) {
  const { favorites, removeFavorite, currentStation } = useRadioStore();
  const selectedRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleFavorites = normalizedQuery
    ? favorites.filter(
        (station) =>
          station.name.toLowerCase().includes(normalizedQuery) ||
          station.country.toLowerCase().includes(normalizedQuery) ||
          station.tags.toLowerCase().includes(normalizedQuery) ||
          station.language?.toLowerCase().includes(normalizedQuery) ||
          !!station.state?.toLowerCase().includes(normalizedQuery)
      )
    : favorites;

  useLayoutEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      selectedRef.current.focus({ preventScroll: true });
    }
  }, [currentStation?.stationuuid]);

  if (favorites.length === 0) {
    return (
      <div className="w-full max-w-md p-4 bg-card rounded-2xl border border-border shadow-xs">
        <p className="text-sm text-muted">No favorites yet</p>
      </div>
    );
  }

  if (visibleFavorites.length === 0) {
    return (
      <div className="w-full max-w-md p-4 bg-card rounded-2xl border border-border shadow-xs">
        <p className="text-sm text-muted">No favorites match “{searchQuery}”.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {visibleFavorites.map((station) => {
          const isSelected = currentStation?.stationuuid === station.stationuuid;

          return (
            <div
              key={station.stationuuid}
              ref={isSelected ? selectedRef : undefined}
              tabIndex={isSelected ? -1 : undefined}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 outline-none ${
                isSelected
                  ? 'bg-card border-primary text-primary shadow-xs'
                  : 'bg-card border-border hover:bg-card-hover hover:border-border-strong hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => onStationSelect(station)}
                >
                  <p className="font-medium truncate text-foreground">
                    {station.name}
                  </p>
                  <p className={`text-sm truncate ${isSelected ? 'text-primary/70' : 'text-muted'}`}>
                    {station.country}
                  </p>
                </div>
                <button
                  onClick={() => removeFavorite(station.stationuuid)}
                  className="ml-2 p-1 rounded-full transition-colors text-muted hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
