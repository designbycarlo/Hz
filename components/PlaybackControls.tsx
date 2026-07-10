'use client';

import { Play, Pause, Square, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}

export default function PlaybackControls({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop,
  onPrevious,
  onNext,
  disabled = false 
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
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
        className="p-4 rounded-full bg-card border-2 border-primary text-primary hover:bg-card-hover shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button
        onClick={onStop}
        disabled={disabled}
        className="p-4 rounded-full bg-card border border-border hover:bg-card-hover text-foreground shadow-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Stop"
      >
        <Square size={24} />
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
  );
}
