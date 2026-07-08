import { RadioStation } from '@/types/radio';

const API_BASE_URL = 'https://de1.api.radio-browser.info/json';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: RadioStation[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(endpoint: string, params: Record<string, string>): string {
  return `${endpoint}:${JSON.stringify(params)}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export async function fetchStationsByCountry(
  countryCode: string,
  limit: number = 100
): Promise<RadioStation[]> {
  const cacheKey = getCacheKey('bycountrycode', { countryCode, limit: limit.toString() });
  
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/stations/search?countrycode=${countryCode}&limit=${limit}&order=clickcount&reverse=true`,
      {
        next: { revalidate: CACHE_DURATION / 1000 }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const stations: RadioStation[] = data.map((station: any) => ({
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url_resolved || station.url,
      country: station.country,
      countrycode: station.countrycode,
      favicon: station.favicon || '',
      tags: station.tags || '',
      bitrate: station.bitrate || 128,
      homepage: station.homepage,
      language: station.language,
      state: station.state,
    }));

    cache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error('Error fetching stations by country:', error);
    throw error;
  }
}

export async function searchStations(
  query: string,
  countryCode?: string,
  limit: number = 50
): Promise<RadioStation[]> {
  const cacheKey = getCacheKey('search', { query, countryCode: countryCode || '', limit: limit.toString() });
  
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      name: query,
      limit: limit.toString(),
      order: 'clickcount',
      reverse: 'true',
    });

    if (countryCode) {
      params.append('countrycode', countryCode);
    }

    const response = await fetch(`${API_BASE_URL}/stations/search?${params.toString()}`, {
      next: { revalidate: CACHE_DURATION / 1000 }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const stations: RadioStation[] = data.map((station: any) => ({
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url_resolved || station.url,
      country: station.country,
      countrycode: station.countrycode,
      favicon: station.favicon || '',
      tags: station.tags || '',
      bitrate: station.bitrate || 128,
      homepage: station.homepage,
      language: station.language,
      state: station.state,
    }));

    cache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error('Error searching stations:', error);
    throw error;
  }
}

export async function getTopStations(limit: number = 50): Promise<RadioStation[]> {
  const cacheKey = getCacheKey('topclick', { limit: limit.toString() });
  
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/stations/topclick/${limit}`,
      {
        next: { revalidate: CACHE_DURATION / 1000 }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const stations: RadioStation[] = data.map((station: any) => ({
      stationuuid: station.stationuuid,
      name: station.name,
      url: station.url_resolved || station.url,
      country: station.country,
      countrycode: station.countrycode,
      favicon: station.favicon || '',
      tags: station.tags || '',
      bitrate: station.bitrate || 128,
      homepage: station.homepage,
      language: station.language,
      state: station.state,
    }));

    cache.set(cacheKey, { data: stations, timestamp: Date.now() });
    return stations;
  } catch (error) {
    console.error('Error fetching top stations:', error);
    throw error;
  }
}

export function clearCache(): void {
  cache.clear();
}
