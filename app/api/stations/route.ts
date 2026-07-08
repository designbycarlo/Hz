import { NextRequest, NextResponse } from 'next/server';
import { fetchStationsByCountry, searchStations, getTopStations } from '@/lib/radio-browser';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '50');

    let stations;

    if (query) {
      stations = await searchStations(query, country || undefined, limit);
    } else if (country) {
      stations = await fetchStationsByCountry(country, limit);
    } else {
      stations = await getTopStations(limit);
    }

    return NextResponse.json(stations);
  } catch (error) {
    console.error('Error in stations API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}
