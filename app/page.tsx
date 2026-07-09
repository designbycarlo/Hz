'use client';

import { useEffect, useState } from 'react';
import { useRadioStore } from '@/stores/radioStore';
import { getAudioManager } from '@/lib/audio';
import { detectLocation } from '@/lib/location';
import RadioDial from '@/components/RadioDial';
import StationList from '@/components/StationList';
import NowPlaying from '@/components/NowPlaying';
import VolumeControl from '@/components/VolumeControl';
import PlaybackControls from '@/components/PlaybackControls';
import Favorites from '@/components/Favorites';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('color-theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-lg bg-card border border-border text-foreground hover:bg-card-hover transition-colors duration-300"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function Home() {
  const {
    currentStation,
    playbackState,
    volume,
    availableStations,
    userCountry,
    isLoading,
    error,
    setCurrentStation,
    setPlaybackState,
    setVolume,
    setAvailableStations,
    setUserCountry,
    setIsLoading,
    setError,
    clearError,
  } = useRadioStore();

  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      clearError();

      const location = await detectLocation();
      setUserCountry(location.countryCode);

      let response = await fetch(`/api/stations?country=${location.countryCode}&limit=50`);
      let stations;
      
      if (!response.ok) {
        console.warn('Country-specific fetch failed, falling back to top stations');
        response = await fetch(`/api/stations?limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
      }
      
      stations = await response.json();
      setAvailableStations(stations);

      if (stations.length > 0) {
        setCurrentStation(stations[0]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize radio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSelect = async (station: typeof currentStation) => {
    if (!station) return;

    try {
      setIsLoading(true);
      clearError();
      setCurrentStation(station);
      setPlaybackState('loading');

      const audioManager = getAudioManager();
      await audioManager.play(station, volume);
      setPlaybackState('playing');
    } catch (err) {
      console.error('Playback error:', err);
      setPlaybackState('error');
      setError('Failed to play station. Please try another.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStation = () => {
    if (availableStations.length === 0) return;
    const currentIndex = currentStation 
      ? availableStations.findIndex(s => s.stationuuid === currentStation.stationuuid)
      : -1;
    const newIndex = currentIndex <= 0 ? availableStations.length - 1 : currentIndex - 1;
    handleStationSelect(availableStations[newIndex]);
  };

  const handleNextStation = () => {
    if (availableStations.length === 0) return;
    const currentIndex = currentStation 
      ? availableStations.findIndex(s => s.stationuuid === currentStation.stationuuid)
      : -1;
    const newIndex = currentIndex >= availableStations.length - 1 ? 0 : currentIndex + 1;
    handleStationSelect(availableStations[newIndex]);
  };

  const handlePlay = async () => {
    if (!currentStation) return;

    try {
      setIsLoading(true);
      clearError();
      setPlaybackState('loading');

      const audioManager = getAudioManager();
      await audioManager.play(currentStation, volume);
      setPlaybackState('playing');
    } catch (err) {
      console.error('Play error:', err);
      setPlaybackState('error');
      setError('Failed to play. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    const audioManager = getAudioManager();
    audioManager.pause();
    setPlaybackState('paused');
  };

  const handleStop = () => {
    const audioManager = getAudioManager();
    audioManager.stop();
    setPlaybackState('stopped');
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const audioManager = getAudioManager();
    audioManager.setVolume(newVolume);
  };

  const isPlaying = playbackState === 'playing';
  const isDisabled = isLoading || playbackState === 'loading';

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-4xl mx-auto px-6 py-4 flex justify-end">
        <div className="flex items-center gap-3">
          {userCountry && (
            <span className="text-sm text-muted">
              📍 {userCountry}
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {error && (
          <div className="w-[433px] max-w-full mx-auto mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-500 hover:text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-6">
            <NowPlaying station={currentStation} isPlaying={isPlaying} />

            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              onPrevious={handlePreviousStation}
              onNext={handleNextStation}
              disabled={isDisabled || !currentStation}
            />

            <VolumeControl
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="flex w-full gap-2">
              <button
                onClick={() => setShowFavorites(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                  !showFavorites
                    ? 'bg-primary text-white dark:text-zinc-950 shadow-sm'
                    : 'bg-card hover:bg-card-hover text-foreground border border-border'
                }`}
              >
                Stations
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                  showFavorites
                    ? 'bg-primary text-white dark:text-zinc-950 shadow-sm'
                    : 'bg-card hover:bg-card-hover text-foreground border border-border'
                }`}
              >
                Favorites
              </button>
            </div>

            {showFavorites ? (
              <Favorites onStationSelect={handleStationSelect} />
            ) : (
              <StationList
                stations={availableStations}
                onStationSelect={handleStationSelect}
              />
            )}
          </div>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-foreground">Loading...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
