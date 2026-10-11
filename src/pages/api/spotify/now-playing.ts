/* global fetch */
import type { APIRoute } from 'astro';
import {
  degradedFromError,
  degradedResponse,
  getAccessToken,
  jsonResponse,
  UpstreamError,
} from '../../../lib/spotify';
import { createResponseCache } from '../../../lib/response-cache';

// Public route: one shared upstream lookup per cache window, however many
// clients (or cache-busting query strings) hit it.
const cache = createResponseCache();

const ROUTE = 'now-playing';
const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=30';

// Toggle this to switch between mock data and real Spotify API
const USE_MOCK_DATA = false;

// Spotify API endpoints
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';

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

async function getNowPlaying(
  accessToken: string
): Promise<SpotifyTrack | null> {
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return null;
  }
  if (response.status >= 400) {
    throw new UpstreamError('currently-playing', response.status);
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
    throw new UpstreamError('recently-played', response.status);
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
  if (USE_MOCK_DATA) {
    return jsonResponse(MOCK_DATA, CACHE_CONTROL);
  }

  return cache.cachedResponse('now-playing', async () => {
    try {
      const auth = await getAccessToken();
      if (!auth.ok) {
        return degradedResponse(ROUTE, auth.reason, auth.detail, MOCK_DATA);
      }

      // Try to get currently playing track, then fall back to recently played
      const track =
        (await getNowPlaying(auth.token)) ??
        (await getRecentlyPlayed(auth.token));

      // Nothing playing and nothing recent: legitimate empty state
      return jsonResponse(track ?? { isPlaying: false }, CACHE_CONTROL);
    } catch (error) {
      return degradedFromError(ROUTE, error, MOCK_DATA);
    }
  });
};

// Opt out of prerendering for this API route
export const prerender = false;
