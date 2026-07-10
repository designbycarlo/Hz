'use client';

import { useEffect, useState, useCallback, useSyncExternalStore, useRef } from 'react';
import { useRadioStore } from '@/stores/radioStore';
import { getAudioManager } from '@/lib/audio';
import { detectLocation } from '@/lib/location';
import StationList from '@/components/StationList';
import NowPlaying from '@/components/NowPlaying';
import VolumeControl from '@/components/VolumeControl';
import PlaybackControls from '@/components/PlaybackControls';
import Favorites from '@/components/Favorites';
import { Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const isDark = useSyncExternalStore(
    (callback) => {
      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains('dark'),
    () => false
  );

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('color-theme', next ? 'dark' : 'light');
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
  const scanRetryRef = useRef(0);

  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const location = await detectLocation();
      setUserCountry(location.countryCode);

      let response = await fetch(`/api/stations?country=${location.countryCode}&limit=50`);

      if (!response.ok) {
        console.warn('Country-specific fetch failed, falling back to top stations');
        response = await fetch(`/api/stations?limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
      }

      const stations = await response.json();
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
  }, [setIsLoading, clearError, setUserCountry, setAvailableStations, setCurrentStation, setError]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

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
      scanRetryRef.current = 0;
    } catch (err) {
      console.error('Playback error:', err);
      setPlaybackState('error');
      scanRetryRef.current += 1;

      if (scanRetryRef.current > availableStations.length) {
        scanRetryRef.current = 0;
        setError('Failed to play station.');
        return;
      }

      setError('Failed to play station. Scanning...');

      const currentIndex = station
        ? availableStations.findIndex(s => s.stationuuid === station.stationuuid)
        : -1;
      const nextIndex = currentIndex >= availableStations.length - 1 ? 0 : currentIndex + 1;
      const nextStation = availableStations[nextIndex];

      if (nextStation) {
        setTimeout(() => handleStationSelect(nextStation), 1000);
      } else {
        scanRetryRef.current = 0;
        setError('Failed to play station.');
      }
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
      scanRetryRef.current = 0;
    } catch (err) {
      console.error('Play error:', err);
      setPlaybackState('error');
      scanRetryRef.current += 1;

      if (scanRetryRef.current > availableStations.length) {
        scanRetryRef.current = 0;
        setError('Failed to play station.');
        return;
      }

      setError('Failed to play station. Scanning...');

      const currentIndex = currentStation
        ? availableStations.findIndex(s => s.stationuuid === currentStation.stationuuid)
        : -1;
      const nextIndex = currentIndex >= availableStations.length - 1 ? 0 : currentIndex + 1;
      const nextStation = availableStations[nextIndex];

      if (nextStation) {
        setTimeout(() => handleStationSelect(nextStation), 1000);
      } else {
        scanRetryRef.current = 0;
        setError('Failed to play station.');
      }
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

  const statusLine = error
    ? { type: 'error' as const, message: error }
    : isLoading || playbackState === 'loading'
      ? { type: 'success' as const, message: 'Loading station…' }
      : playbackState === 'playing'
        ? { type: 'success' as const, message: 'Now playing' }
        : playbackState === 'paused'
          ? { type: 'success' as const, message: 'Paused' }
          : null;

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <header className="md:max-w-md mx-auto px-6 py-3 flex justify-end w-full">
        <div className="flex items-center gap-3">
          {userCountry && (
            <span className="text-sm text-muted">
              📍 {userCountry}
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <div className="md:max-w-md mx-auto w-full px-6 py-6 h-full flex flex-col">

          {statusLine && (
            <div
              role={statusLine.type === 'error' ? 'alert' : 'status'}
              className="w-full max-w-md mx-auto"
            >
              <div
                className={`h-1 w-full rounded-full ${
                  statusLine.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
              <p
                className={`mt-1 text-xs text-center ${
                  statusLine.type === 'error' ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {statusLine.message}
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-6 flex-1 min-h-0">
            <div className="flex flex-col items-center gap-5 w-full md:max-w-md">
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

            <div className="flex flex-col items-center gap-5 w-full md:max-w-md flex-1 min-h-0">
              <div className="flex w-full gap-2">
                <button
                  onClick={() => setShowFavorites(false)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    !showFavorites
                      ? 'border border-primary text-primary bg-card shadow-xs'
                      : 'bg-card hover:bg-card-hover text-foreground border border-border'
                  }`}
                >
                  Stations
                </button>
                <button
                  onClick={() => setShowFavorites(true)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    showFavorites
                      ? 'border border-primary text-primary bg-card shadow-xs'
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
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
