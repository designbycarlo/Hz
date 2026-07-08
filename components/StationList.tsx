'use client';

import { RadioStation } from '@/types/radio';
import { useRadioStore } from '@/stores/radioStore';
import { Heart } from 'lucide-react';

interface StationListProps {
  stations: RadioStation[];
  onStationSelect: (station: RadioStation) => void;
}

export default function StationList({ stations, onStationSelect }: StationListProps) {
  const { currentStation, toggleFavorite, isFavorite } = useRadioStore();

  return (
    <div className="w-full max-w-md max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Stations</h3>
      <div className="space-y-2">
        {stations.map((station) => {
          const isSelected = currentStation?.stationuuid === station.stationuuid;
          const isFav = isFavorite(station.stationuuid);

          return (
            <div
              key={station.stationuuid}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-card-hover'
              }`}
              onClick={() => onStationSelect(station)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-foreground'}`}>
                    {station.name}
                  </p>
                  <p className={`text-sm truncate ${isSelected ? 'text-gray-200' : 'text-muted'}`}>
                    {station.country} • {station.tags}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(station);
                  }}
                  className={`ml-2 p-1 rounded-full transition-colors ${
                    isFav 
                      ? 'text-red-500 hover:text-red-600' 
                      : isSelected 
                        ? 'text-gray-200 hover:text-white' 
                        : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
