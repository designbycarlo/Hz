'use client';

import { useState, useEffect } from 'react';
import { RadioStation } from '@/types/radio';

interface RadioDialProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  onStationSelect: (station: RadioStation) => void;
}

export default function RadioDial({ stations, currentStation, onStationSelect }: RadioDialProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = currentStation 
    ? stations.findIndex(s => s.stationuuid === currentStation.stationuuid)
    : -1;

  useEffect(() => {
    if (currentIndex >= 0) {
      const anglePerStation = 360 / stations.length;
      const targetRotation = currentIndex * anglePerStation;
      setRotation(-targetRotation);
    }
  }, [currentIndex, stations.length]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || stations.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    const anglePerStation = 360 / stations.length;
    const stationIndex = Math.round(angle / anglePerStation) % stations.length;
    
    if (stationIndex >= 0 && stationIndex < stations.length) {
      onStationSelect(stations[stationIndex]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (stations.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left - centerX;
    const y = touch.clientY - rect.top - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    const anglePerStation = 360 / stations.length;
    const stationIndex = Math.round(angle / anglePerStation) % stations.length;
    
    if (stationIndex >= 0 && stationIndex < stations.length) {
      onStationSelect(stations[stationIndex]);
    }
  };

  if (stations.length === 0) {
    return (
      <div className="flex items-center justify-center w-80 h-80 rounded-full bg-card border-2 border-border">
        <p className="text-muted">No stations available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-80 h-80 rounded-full bg-card border-2 border-border cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Dial indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-8 bg-primary rounded-full" />
      
      {/* Rotating dial */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {stations.map((station, index) => {
          const anglePerStation = 360 / stations.length;
          const angle = index * anglePerStation;
          const radius = 120;
          const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
          const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

          const isSelected = currentStation?.stationuuid === station.stationuuid;

          return (
            <div
              key={station.stationuuid}
              className={`absolute w-3 h-3 rounded-full transition-all duration-200 ${
                isSelected ? 'bg-primary scale-125' : 'bg-muted hover:bg-primary'
              }`}
              style={{
                left: `calc(50% + ${x}px - 6px)`,
                top: `calc(50% + ${y}px - 6px)`,
              }}
              title={station.name}
            />
          );
        })}
      </div>

      {/* Center display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {currentStation ? (
            <>
              <p className="text-sm font-medium text-foreground truncate max-w-32">
                {currentStation.name}
              </p>
              <p className="text-xs text-muted mt-1">
                {currentStation.country}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Select a station</p>
          )}
        </div>
      </div>
    </div>
  );
}
