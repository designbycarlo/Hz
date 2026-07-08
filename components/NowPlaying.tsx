'use client';

import { RadioStation } from '@/types/radio';
import { Play, Pause, Radio } from 'lucide-react';

interface NowPlayingProps {
  station: RadioStation | null;
  isPlaying: boolean;
}

export default function NowPlaying({ station, isPlaying }: NowPlayingProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
      {station?.favicon ? (
        <img
          src={station.favicon}
          alt={station.name}
          className="w-16 h-16 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-card-hover flex items-center justify-center">
          <Radio size={32} className="text-muted" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-foreground truncate">
          {station?.name || 'No station selected'}
        </h2>
        <p className="text-sm text-muted truncate">
          {station?.country || ''}
          {station?.tags && ` • ${station.tags}`}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {isPlaying ? (
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            <span className="text-sm text-muted">Paused</span>
          )}
        </div>
      </div>
    </div>
  );
}
