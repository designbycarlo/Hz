'use client';

import { useEffect, useState, useCallback, useSyncExternalStore, useRef, useMemo } from 'react';
import { useRadioStore } from '@/stores/radioStore';
import { getAudioManager } from '@/lib/audio';
import { detectLocation } from '@/lib/location';
import StationList from '@/components/StationList';
import NowPlaying from '@/components/NowPlaying';
import VolumeControl from '@/components/VolumeControl';
import PlaybackControls from '@/components/PlaybackControls';
import Favorites from '@/components/Favorites';
import { Sun, Moon, Search, X } from 'lucide-react';
import CountrySelector from '@/components/CountrySelector';

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
    favorites,
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
  const [searchQuery, setSearchQuery] = useState('');
  const scanRetryRef = useRef(0);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);

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

  const handleStationSelectRef = useRef<(station: typeof currentStation) => void>(() => {});

  const scanToNextStation = useCallback((failedStation: typeof currentStation) => {
    scanRetryRef.current += 1;

    if (scanRetryRef.current > availableStations.length) {
      scanRetryRef.current = 0;
      setError('Failed to play station.');
      setPlaybackState('error');
      return;
    }

    setError('Failed to play station. Scanning...');

    const currentIndex = failedStation
      ? availableStations.findIndex(s => s.stationuuid === failedStation.stationuuid)
      : -1;
    const nextIndex = currentIndex >= availableStations.length - 1 ? 0 : currentIndex + 1;
    const nextStation = availableStations[nextIndex];

    if (nextStation) {
      setTimeout(() => handleStationSelectRef.current(nextStation), 1000);
    } else {
      scanRetryRef.current = 0;
      setError('Failed to play station.');
      setPlaybackState('error');
    }
  }, [availableStations, setError, setPlaybackState]);

  const handleStationSelect = async (station: typeof currentStation) => {
    if (!station) return;

    setSearchQuery('');
    cancelledRef.current = false;

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    try {
      setIsLoading(true);
      clearError();
      scanRetryRef.current = 0;
      setCurrentStation(station);
      setUserCountry(station.countrycode);
      setPlaybackState('loading');

      const audioManager = getAudioManager();
      audioManager.setVolume(volume);

      loadTimeoutRef.current = setTimeout(() => {
        cancelledRef.current = true;
        loadTimeoutRef.current = null;
        setPlaybackState('error');
        setError('Station loading timeout. Scanning...');
        const audioManager = getAudioManager();
        audioManager.stop();
        scanToNextStation(station);
      }, 10000);

      await audioManager.play(station, volume);
      setPlaybackState('playing');
      scanRetryRef.current = 0;
    } catch (err) {
      if (cancelledRef.current) return;
      console.error('Playback error:', err);
      setPlaybackState('error');
      scanToNextStation(station);
    } finally {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleStationSelectRef.current = handleStationSelect;
  }, [handleStationSelect]);

  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const handlePreviousStation = () => {
    setSearchQuery('');
    const list = showFavorites ? favorites : availableStations;
    if (list.length === 0) return;
    const currentIndex = currentStation 
      ? list.findIndex(s => s.stationuuid === currentStation.stationuuid)
      : -1;
    const newIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    handleStationSelect(list[newIndex]);
  };

  const handleNextStation = () => {
    setSearchQuery('');
    const list = showFavorites ? favorites : availableStations;
    if (list.length === 0) return;
    const currentIndex = currentStation 
      ? list.findIndex(s => s.stationuuid === currentStation.stationuuid)
      : -1;
    const newIndex = currentIndex >= list.length - 1 ? 0 : currentIndex + 1;
    handleStationSelect(list[newIndex]);
  };

  useEffect(() => {
    const audioManager = getAudioManager();
    audioManager.setMediaSessionActions({
      onPrevious: handlePreviousStation,
      onNext: handleNextStation,
    });

    const handleAudioError = () => {
      if (playbackState === 'playing' || playbackState === 'loading') {
        scanToNextStation(currentStation);
      }
    };
    const offError = audioManager.onError(handleAudioError);

    return () => offError();
  }, [handlePreviousStation, handleNextStation, scanToNextStation, currentStation, playbackState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'MediaTrackPrevious') {
        e.preventDefault();
        handlePreviousStation();
      } else if (e.key === 'ArrowRight' || e.key === 'MediaTrackNext') {
        e.preventDefault();
        handleNextStation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePreviousStation, handleNextStation]);

  const handlePlay = async () => {
    if (!currentStation) return;

    setSearchQuery('');
    try {
      setIsLoading(true);
      clearError();
      setPlaybackState('loading');

      const audioManager = getAudioManager();
      audioManager.setVolume(volume);
      await audioManager.play(currentStation, volume);
      setPlaybackState('playing');
      scanRetryRef.current = 0;
    } catch (err) {
      console.error('Play error:', err);
      setPlaybackState('error');
      scanToNextStation(currentStation);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    const audioManager = getAudioManager();
    audioManager.pause();
    setPlaybackState('paused');
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const audioManager = getAudioManager();
    audioManager.setVolume(newVolume);
  };

  const handleCountryChange = useCallback(async (code: string) => {
    setShowFavorites(false);
    setUserCountry(code);
    setIsLoading(true);
    clearError();

    try {
      let response = await fetch(`/api/stations?country=${code}&limit=50`);

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
      console.error('Country change error:', err);
      setError('Failed to load stations for selected country.');
    } finally {
      setIsLoading(false);
    }
  }, [setUserCountry, setIsLoading, clearError, setAvailableStations, setCurrentStation, setError]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const stationMatchesQuery = (station: {
    name: string;
    country: string;
    tags: string;
    language?: string;
    state?: string;
  }) =>
    !normalizedQuery ||
    station.name.toLowerCase().includes(normalizedQuery) ||
    station.country.toLowerCase().includes(normalizedQuery) ||
    station.tags.toLowerCase().includes(normalizedQuery) ||
    station.language?.toLowerCase().includes(normalizedQuery) ||
    !!station.state?.toLowerCase().includes(normalizedQuery);

  const filteredStations = useMemo(
    () => availableStations.filter(stationMatchesQuery),
    [availableStations, normalizedQuery]
  );

  const isPlaying = playbackState === 'playing';
  const isDisabled = isLoading || playbackState === 'loading';
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <header className="md:max-w-md mx-auto px-6 py-3 flex items-center justify-between gap-3 w-full">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations…"
            aria-label="Search stations"
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-primary transition-colors duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted hover:text-foreground hover:bg-card-hover transition-colors duration-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <CountrySelector
            selectedCountry={userCountry}
            onCountryChange={handleCountryChange}
          />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <div className="md:max-w-md mx-auto w-full px-6 py-6 h-full flex flex-col">

          <div className="flex flex-col items-center gap-6 flex-1 min-h-0">
            <div className="flex flex-col items-center gap-5 w-full md:max-w-md">
              <NowPlaying station={currentStation} isPlaying={isPlaying} error={error} />

              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
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
                <Favorites
                  searchQuery={searchQuery}
                  onStationSelect={handleStationSelect}
                />
              ) : (
                <StationList
                  stations={filteredStations}
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
