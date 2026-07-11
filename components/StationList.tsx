'use client';

import { useEffect, useRef } from 'react';
import { RadioStation } from '@/types/radio';
import { useRadioStore } from '@/stores/radioStore';
import { Heart } from 'lucide-react';

interface StationListProps {
  stations: RadioStation[];
  onStationSelect: (station: RadioStation) => void;
}

export default function StationList({ stations, onStationSelect }: StationListProps) {
  const { currentStation, toggleFavorite, isFavorite } = useRadioStore();
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStation && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStation?.stationuuid]);

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {stations.map((station) => {
          const isSelected = currentStation?.stationuuid === station.stationuuid;
          const isFav = isFavorite(station.stationuuid);

          return (
            <div
              key={station.stationuuid}
              ref={isSelected ? selectedRef : undefined}
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                isSelected 
                  ? 'bg-card border-primary text-primary shadow-xs' 
                  : 'bg-card border-border hover:bg-card-hover hover:border-border-strong hover:shadow-xs'
              }`}
              onClick={() => onStationSelect(station)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-foreground">
                    {station.name}
                  </p>
                  <p className={`text-sm truncate ${isSelected ? 'text-primary/70' : 'text-muted'}`}>
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
      {stations.length === 0 && (
        <div className="w-full max-w-md p-4 bg-card rounded-2xl border border-border shadow-xs">
          <p className="text-sm text-muted">No stations found</p>
        </div>
      )}
    </div>
  );
}
