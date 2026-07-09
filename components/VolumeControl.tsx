'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  return (
    <div className="flex items-center gap-3 p-3 w-full bg-card rounded-xl border border-border shadow-xs">
      {volume === 0 ? (
        <VolumeX size={20} className="text-muted" />
      ) : (
        <Volume2 size={20} className="text-muted" />
      )}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-24 h-2 bg-card-hover rounded-lg appearance-none cursor-pointer accent-primary"
        aria-label="Volume"
      />
      <span className="text-sm text-muted w-10 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
