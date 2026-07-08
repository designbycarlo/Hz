'use client';

import { Play, Pause, Square } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function PlaybackControls({ 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop, 
  disabled = false 
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="p-4 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button
        onClick={onStop}
        disabled={disabled}
        className="p-4 rounded-full bg-card hover:bg-card-hover text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Stop"
      >
        <Square size={24} />
      </button>
    </div>
  );
}
