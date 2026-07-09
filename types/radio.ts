export interface RawStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved?: string;
  country?: string;
  countrycode?: string;
  favicon?: string;
  tags?: string;
  bitrate?: number;
  homepage?: string;
  language?: string;
  state?: string;
}

export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  country: string;
  countrycode: string;
  favicon: string;
  tags: string;
  bitrate: number;
  homepage?: string;
  language?: string;
  state?: string;
}

export interface RadioState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  favorites: RadioStation[];
  availableStations: RadioStation[];
  userCountry: string | null;
  isLoading: boolean;
  error: string | null;
}

export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'loading' | 'error';
