'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useRef } from 'react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const prevVolumeRef = useRef(volume);

  const handleIconClick = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      onVolumeChange(0);
    } else if (prevVolumeRef.current > 0) {
      onVolumeChange(prevVolumeRef.current);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 w-full md:max-w-md mx-auto bg-card rounded-xl border border-border shadow-xs">
      <button
        onClick={handleIconClick}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        className="p-0 bg-transparent border-none cursor-pointer text-muted hover:text-foreground transition-colors"
      >
        {volume === 0 ? (
          <VolumeX size={20} />
        ) : (
          <Volume2 size={20} />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-card-hover rounded-lg appearance-none cursor-pointer accent-primary"
        aria-label="Volume"
      />
    </div>
  );
}
