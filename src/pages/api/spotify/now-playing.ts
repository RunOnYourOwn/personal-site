/* global Buffer, Response, URLSearchParams, fetch, console */
import type { APIRoute } from 'astro';

// Toggle this to switch between mock data and real Spotify API
const USE_MOCK_DATA = false;

// Spotify API endpoints
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

// Mock data for when Spotify API is unavailable
const MOCK_DATA = {
  isPlaying: true,
  title: 'Starlight',
  artist: 'Muse',
  album: 'Black Holes and Revelations',
  albumImageUrl:
    'https://i.scdn.co/image/ab67616d0000b273b6d4566db0d12894a1a3b7a2',
  songUrl: 'https://open.spotify.com/track/3skn2lauGk7Dx6bVIt5DVj',
};

interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
}

async function getAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function getNowPlaying(
  accessToken: string
): Promise<SpotifyTrack | null> {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204 || response.status > 400) {
    return null;
  }

  const data = await response.json();

  if (!data.item) {
    return null;
  }

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map((a: { name: string }) => a.name).join(', '),
    album: data.item.album.name,
    albumImageUrl: data.item.album.images[0]?.url,
    songUrl: data.item.external_urls.spotify,
  };
}

async function getRecentlyPlayed(
  accessToken: string
): Promise<SpotifyTrack | null> {
  const response = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 200) {
    return null;
  }

  const data = await response.json();
  const track = data.items?.[0]?.track;

  if (!track) {
    return null;
  }

  return {
    isPlaying: false,
    title: track.name,
    artist: track.artists.map((a: { name: string }) => a.name).join(', '),
    album: track.album.name,
    albumImageUrl: track.album.images[0]?.url,
    songUrl: track.external_urls.spotify,
  };
}

export const GET: APIRoute = async () => {
  // Return mock data if enabled or if credentials are not configured
  if (USE_MOCK_DATA) {
    return new Response(JSON.stringify(MOCK_DATA), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      // Return mock data if no credentials configured
      return new Response(JSON.stringify(MOCK_DATA), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      });
    }

    // Try to get currently playing track
    let track = await getNowPlaying(accessToken);

    // If nothing is playing, get recently played
    if (!track) {
      track = await getRecentlyPlayed(accessToken);
    }

    // If still no track, return empty response
    if (!track) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      });
    }

    return new Response(JSON.stringify(track), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Spotify API error:', error);

    // Return mock data on error
    return new Response(JSON.stringify(MOCK_DATA), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  }
};

// Opt out of prerendering for this API route
export const prerender = false;
