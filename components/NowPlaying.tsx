'use client';

import { RadioStation } from '@/types/radio';

interface NowPlayingProps {
  station: RadioStation | null;
  isPlaying: boolean;
  error?: string | null;
}

export default function NowPlaying({ station, isPlaying, error }: NowPlayingProps) {
  return (
    <div className="flex items-stretch gap-4 p-4 w-full bg-card rounded-2xl border border-border shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">
          {station?.name || 'No station selected'}
        </h2>
        <p className="text-sm text-muted truncate">
          {station?.country || ''}
          {station?.tags && ` • ${station.tags}`}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
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
      {error ? (
        <div
          role="alert"
          aria-label={error}
          className="w-1 rounded-full bg-red-500"
        />
      ) : isPlaying ? (
        <div aria-hidden className="w-1 rounded-full bg-[#2CFF05]" />
      ) : null}
    </div>
  );
}
