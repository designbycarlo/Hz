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
import { Radio } from 'lucide-react';

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

      const response = await fetch(`/api/stations?country=${location.countryCode}&limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch stations');
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Radio size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Megaplan Radio</h1>
          </div>
          {userCountry && (
            <p className="text-sm text-muted">
              📍 {userCountry}
            </p>
          )}
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-500 hover:text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center gap-6">
            <RadioDial
              stations={availableStations}
              currentStation={currentStation}
              onStationSelect={handleStationSelect}
            />

            <NowPlaying station={currentStation} isPlaying={isPlaying} />

            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onStop={handleStop}
              disabled={isDisabled || !currentStation}
            />

            <VolumeControl
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFavorites(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !showFavorites
                    ? 'bg-primary text-white'
                    : 'bg-card hover:bg-card-hover text-foreground'
                }`}
              >
                Stations
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showFavorites
                    ? 'bg-primary text-white'
                    : 'bg-card hover:bg-card-hover text-foreground'
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
      </div>
    </div>
  );
}
