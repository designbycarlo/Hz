import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RadioStation, PlaybackState } from '@/types/radio';

interface RadioStore {
  // State
  currentStation: RadioStation | null;
  playbackState: PlaybackState;
  volume: number;
  favorites: RadioStation[];
  availableStations: RadioStation[];
  userCountry: string | null;
  isLoading: boolean;
  error: string | null;
  autoplay: boolean;
  
  // Actions
  setCurrentStation: (station: RadioStation | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setVolume: (volume: number) => void;
  addFavorite: (station: RadioStation) => void;
  removeFavorite: (stationUuid: string) => void;
  setAvailableStations: (stations: RadioStation[]) => void;
  setUserCountry: (country: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFavorite: (station: RadioStation) => void;
  isFavorite: (stationUuid: string) => boolean;
  clearError: () => void;
  setAutoplay: (autoplay: boolean) => void;
}

export const useRadioStore = create<RadioStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStation: null,
      playbackState: 'stopped',
      volume: 0.75,
      favorites: [],
      availableStations: [],
      userCountry: null,
      isLoading: false,
      error: null,
      autoplay: true,

      // Actions
      setCurrentStation: (station) => set({ currentStation: station }),
      
      setPlaybackState: (state) => set({ playbackState: state }),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      addFavorite: (station) => set((state) => ({
        favorites: [...state.favorites, station],
      })),
      
      removeFavorite: (stationUuid) => set((state) => ({
        favorites: state.favorites.filter((s) => s.stationuuid !== stationUuid),
      })),
      
      setAvailableStations: (stations) => set({ availableStations: stations }),
      
      setUserCountry: (country) => set({ userCountry: country }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      toggleFavorite: (station) => {
        const { favorites, addFavorite, removeFavorite } = get();
        const exists = favorites.some((s) => s.stationuuid === station.stationuuid);
        
        if (exists) {
          removeFavorite(station.stationuuid);
        } else {
          addFavorite(station);
        }
      },
      
      isFavorite: (stationUuid) => {
        const { favorites } = get();
        return favorites.some((s) => s.stationuuid === stationUuid);
      },
      
      clearError: () => set({ error: null }),

      setAutoplay: (autoplay) => set({ autoplay }),
    }),
    {
      name: 'radio-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        volume: state.volume,
        userCountry: state.userCountry,
        autoplay: state.autoplay,
      }),
    }
  )
);
