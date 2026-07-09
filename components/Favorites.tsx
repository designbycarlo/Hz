'use client';

import { RadioStation } from '@/types/radio';
import { useRadioStore } from '@/stores/radioStore';
import { Trash2 } from 'lucide-react';

interface FavoritesProps {
  onStationSelect: (station: RadioStation) => void;
}

export default function Favorites({ onStationSelect }: FavoritesProps) {
  const { favorites, removeFavorite, currentStation } = useRadioStore();

  if (favorites.length === 0) {
    return (
      <div className="w-full max-w-md p-4 bg-card rounded-2xl border border-border shadow-xs">
        <p className="text-sm text-muted">No favorites yet</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {favorites.map((station) => {
          const isSelected = currentStation?.stationuuid === station.stationuuid;

          return (
            <div
              key={station.stationuuid}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                isSelected 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-card border-border hover:bg-card-hover hover:border-border-strong hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => onStationSelect(station)}
                >
                  <p className={`font-medium truncate ${isSelected ? 'text-white dark:text-zinc-950' : 'text-foreground'}`}>
                    {station.name}
                  </p>
                  <p className={`text-sm truncate ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-muted'}`}>
                    {station.country}
                  </p>
                </div>
                <button
                  onClick={() => removeFavorite(station.stationuuid)}
                  className={`ml-2 p-1 rounded-full transition-colors ${
                    isSelected 
                      ? 'text-zinc-300 hover:text-zinc-950 dark:text-zinc-700 dark:hover:text-zinc-950' 
                      : 'text-muted hover:text-red-500'
                  }`}
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
