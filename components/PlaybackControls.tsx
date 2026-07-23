'use client';

import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  autoplay?: boolean;
  onAutoplayToggle?: (autoplay: boolean) => void;
}

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  disabled = false,
  autoplay = true,
  onAutoplayToggle,
}: PlaybackControlsProps) {
  return (
    <div className="grid grid-cols-3 items-center w-full">
      <div className="flex flex-col items-center gap-1 justify-self-start">
        <button
          role="switch"
          aria-checked={autoplay}
          aria-label="Toggle autoplay on launch"
          onClick={() => onAutoplayToggle?.(!autoplay)}
          className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${
            autoplay ? 'bg-primary' : 'bg-border'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white dark:bg-zinc-950 shadow-xs transition-transform duration-300 ${
              autoplay ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm text-muted leading-none">Auto</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        {onPrevious && (
          <button
            onClick={onPrevious}
            disabled={disabled}
            className="p-4 rounded-full bg-card border border-border hover:bg-card-hover text-foreground shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous station"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          className="p-4 rounded-full bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        {onNext && (
          <button
            onClick={onNext}
            disabled={disabled}
            className="p-4 rounded-full bg-card border border-border hover:bg-card-hover text-foreground shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next station"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div />
    </div>
  );
}
