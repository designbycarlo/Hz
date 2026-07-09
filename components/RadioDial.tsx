'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RadioStation } from '@/types/radio';

interface RadioDialProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  onStationSelect: (station: RadioStation) => void;
}

export default function RadioDial({ stations, currentStation, onStationSelect }: RadioDialProps) {
  const currentIndex = currentStation 
    ? stations.findIndex(s => s.stationuuid === currentStation.stationuuid)
    : -1;

  const handlePrevious = () => {
    if (stations.length === 0) return;
    const newIndex = currentIndex <= 0 ? stations.length - 1 : currentIndex - 1;
    onStationSelect(stations[newIndex]);
  };

  const handleNext = () => {
    if (stations.length === 0) return;
    const newIndex = currentIndex >= stations.length - 1 ? 0 : currentIndex + 1;
    onStationSelect(stations[newIndex]);
  };

  if (stations.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-48 rounded-2xl bg-card border border-border">
        <p className="text-muted">No stations available</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 w-full">
      <button
        onClick={handlePrevious}
        disabled={stations.length === 0}
        className="p-4 rounded-full bg-card border border-border hover:bg-card-hover hover:border-primary text-foreground shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous station"
      >
        <ChevronLeft size={32} className="text-foreground" />
      </button>

      <div className="flex-1 max-w-md text-center">
        {currentStation ? (
          <>
            <p className="text-lg font-medium tracking-tight text-foreground truncate">
              {currentStation.name}
            </p>
            <p className="text-sm text-muted mt-1">
              {currentStation.country}
            </p>
            <p className="text-xs text-muted mt-1">
              {currentIndex + 1} / {stations.length}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Select a station</p>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={stations.length === 0}
        className="p-4 rounded-full bg-card border border-border hover:bg-card-hover hover:border-primary text-foreground shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next station"
      >
        <ChevronRight size={32} className="text-foreground" />
      </button>
    </div>
  );
}
