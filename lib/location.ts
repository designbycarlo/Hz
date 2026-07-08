interface LocationData {
  countryCode: string;
  countryName: string;
  city?: string;
}

const LOCATION_CACHE_KEY = 'user_location';
const LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  data: LocationData;
  timestamp: number;
}

function getCachedLocation(): LocationData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedLocation = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < LOCATION_CACHE_DURATION) {
      return parsed.data;
    }
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setCachedLocation(data: LocationData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached: CachedLocation = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore storage errors
  }
}

export async function detectLocation(): Promise<LocationData> {
  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  // Try browser geolocation
  try {
    const geoLocation = await getGeolocation();
    if (geoLocation) {
      setCachedLocation(geoLocation);
      return geoLocation;
    }
  } catch {
    // Fall back to IP-based detection
  }

  // Fallback to IP-based detection
  const ipLocation = await getIPLocation();
  setCachedLocation(ipLocation);
  return ipLocation;
}

async function getGeolocation(): Promise<LocationData | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationData = await reverseGeocode(latitude, longitude);
          resolve(locationData);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(error);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      }
    );
  });
}

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<LocationData> {
  // Using OpenStreetMap's Nominatim API (free, no API key required)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
    {
      headers: {
        'User-Agent': 'Megaplan Radio App',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();
  const address = data.address || {};
  
  const countryCode = address.country_code?.toUpperCase() || 'US';
  const countryName = address.country || 'United States';
  const city = address.city || address.town || address.village;

  return {
    countryCode,
    countryName,
    city,
  };
}

async function getIPLocation(): Promise<LocationData> {
  // Using ipapi.co (free tier, no API key required for basic usage)
  const response = await fetch('https://ipapi.co/json/');
  
  if (!response.ok) {
    // Fallback to default US location if IP detection fails
    return {
      countryCode: 'US',
      countryName: 'United States',
    };
  }

  const data = await response.json();
  
  return {
    countryCode: data.country_code || 'US',
    countryName: data.country_name || 'United States',
    city: data.city,
  };
}

export function clearLocationCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCATION_CACHE_KEY);
}
