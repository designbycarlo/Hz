'use client';

import { RadioStation } from '@/types/radio';
import { useRadioStore } from '@/stores/radioStore';
import { Heart, Trash2 } from 'lucide-react';

interface FavoritesProps {
  onStationSelect: (station: RadioStation) => void;
}

export default function Favorites({ onStationSelect }: FavoritesProps) {
  const { favorites, removeFavorite, currentStation } = useRadioStore();

  if (favorites.length === 0) {
    return (
      <div className="w-full max-w-md p-4 bg-card rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Favorites</h3>
        <p className="text-sm text-muted">No favorites yet</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md max-h-64 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Favorites</h3>
      <div className="space-y-2">
        {favorites.map((station) => {
          const isSelected = currentStation?.stationuuid === station.stationuuid;

          return (
            <div
              key={station.stationuuid}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-card-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 min-w-0"
                  onClick={() => onStationSelect(station)}
                >
                  <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-foreground'}`}>
                    {station.name}
                  </p>
                  <p className={`text-sm truncate ${isSelected ? 'text-gray-200' : 'text-muted'}`}>
                    {station.country}
                  </p>
                </div>
                <button
                  onClick={() => removeFavorite(station.stationuuid)}
                  className={`ml-2 p-1 rounded-full transition-colors ${
                    isSelected 
                      ? 'text-gray-200 hover:text-white' 
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
