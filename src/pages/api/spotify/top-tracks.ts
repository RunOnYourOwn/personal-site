/* global fetch */
import type { APIRoute } from 'astro';
import {
  degradedFromError,
  degradedResponse,
  getAccessToken,
  jsonResponse,
  UpstreamError,
} from '../../../lib/spotify';
import {
  createResponseCache,
  normalizeTopParams,
} from '../../../lib/response-cache';

// Public route: parameters are normalized and results cached in-process so
// cache-busting query strings cannot fan out to Spotify.
const cache = createResponseCache();

const ROUTE = 'top-tracks';
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=1800';

const USE_MOCK_DATA = false;

const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks';

// Artists to filter out (case-insensitive)
// Tracks by these artists won't appear in your top lists
// NOTE: Add individual artist names, not combined strings
const BLOCKED_ARTISTS = [
  'Patrick Stump',
  'Spidey',
  'Marvel’s Spidey and His Amazing Friends - Cast',
  'Taylor Swift',
  'Elmo & Patsy',
  'Mandy Moore',
  'Brad Garrett',
  'Zachary Levi',
  'Jeffrey Tambor',
  'Idina Menzel',
  'Larry Groce',
  'Mickey Mouse',
  'Goofy',
  'Disney Junior',
  'Becky G',
  'SuperKitties - Cast',
  'The Laurie Berkner Band',
  'Super Simple Songs',
  'Bruce Channell',
  "Gabby's Dollhouse",
  'PAW Patrol',
  // Add more here as needed
];

const MOCK_DATA = {
  tracks: [
    {
      name: 'Starlight',
      artist: 'Muse',
      album: 'Black Holes and Revelations',
      image: 'https://i.scdn.co/image/ab67616d0000b273b6d4566db0d12894a1a3b7a2',
      url: 'https://open.spotify.com/track/3skn2lauGk7Dx6bVIt5DVj',
    },
    {
      name: 'Weird Fishes/Arpeggi',
      artist: 'Radiohead',
      album: 'In Rainbows',
      image: 'https://i.scdn.co/image/ab67616d0000b273de3c04b5fc750b68899b20a9',
      url: 'https://open.spotify.com/track/4FCPJMQ4TcXxd5AlnjX8ht',
    },
    {
      name: 'Get Lucky',
      artist: 'Daft Punk',
      album: 'Random Access Memories',
      image: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937',
      url: 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof',
    },
    {
      name: 'Let It Happen',
      artist: 'Tame Impala',
      album: 'Currents',
      image: 'https://i.scdn.co/image/ab67616d0000b27379e3a6c1c0e0f9b3a7ed687e',
      url: 'https://open.spotify.com/track/2X485T9Z5Ly0xyaghN73ed',
    },
    {
      name: 'Do I Wanna Know?',
      artist: 'Arctic Monkeys',
      album: 'AM',
      image: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163',
      url: 'https://open.spotify.com/track/5FVd6KXrgO9B3JPmGzpJcL',
    },
    {
      name: 'Knights of Cydonia',
      artist: 'Muse',
      album: 'Black Holes and Revelations',
      image: 'https://i.scdn.co/image/ab67616d0000b273b6d4566db0d12894a1a3b7a2',
      url: 'https://open.spotify.com/track/7ouMYWpwJ422jRcDASAM9C',
    },
    {
      name: 'Everything In Its Right Place',
      artist: 'Radiohead',
      album: 'Kid A',
      image: 'https://i.scdn.co/image/ab67616d0000b273d199a6f567d19a4af1c35b55',
      url: 'https://open.spotify.com/track/5Rl0mJVdu0pZ7LKqlQIv1s',
    },
    {
      name: 'Digital Love',
      artist: 'Daft Punk',
      album: 'Discovery',
      image: 'https://i.scdn.co/image/ab67616d0000b27319a8e5f3c0ccf8d54b1a2e34',
      url: 'https://open.spotify.com/track/1Q2ddCCr4BXJS1D1yqhMnV',
    },
  ],
  timeRange: 'medium_term',
};

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
}

interface TopTracksResponse {
  tracks: SpotifyTrack[];
  timeRange: string;
}

function isBlockedArtist(artists: { name: string }[]): boolean {
  return artists.some(artist =>
    BLOCKED_ARTISTS.some(
      blocked => blocked.toLowerCase() === artist.name.toLowerCase()
    )
  );
}

async function getTopTracks(
  accessToken: string,
  timeRange: string = 'short_term',
  limit: number = 10
): Promise<TopTracksResponse> {
  // Fetch extra to account for filtered tracks
  const fetchLimit = Math.min(limit + BLOCKED_ARTISTS.length + 10, 50);

  const url = new URL(TOP_TRACKS_ENDPOINT);
  url.searchParams.set('time_range', timeRange);
  url.searchParams.set('limit', fetchLimit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 200) {
    throw new UpstreamError('top-tracks', response.status);
  }

  const data = await response.json();

  const tracks = data.items
    .filter(
      (track: { artists: { name: string }[] }) =>
        !isBlockedArtist(track.artists)
    )
    .slice(0, limit)
    .map(
      (track: {
        name: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
        external_urls: { spotify: string };
      }) => ({
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url,
        url: track.external_urls.spotify,
      })
    );

  return { tracks, timeRange };
}

export const GET: APIRoute = async ({ url }) => {
  const { timeRange, limit } = normalizeTopParams(url.searchParams);

  if (USE_MOCK_DATA) {
    return jsonResponse(MOCK_DATA, CACHE_CONTROL);
  }

  return cache.cachedResponse(`${timeRange}:${limit}`, async () => {
    try {
      const auth = await getAccessToken();
      if (!auth.ok) {
        return degradedResponse(ROUTE, auth.reason, auth.detail, MOCK_DATA);
      }

      const data = await getTopTracks(auth.token, timeRange, limit);
      return jsonResponse(data, CACHE_CONTROL);
    } catch (error) {
      return degradedFromError(ROUTE, error, MOCK_DATA);
    }
  });
};

export const prerender = false;
