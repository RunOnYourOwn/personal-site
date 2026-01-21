/* global Buffer, Response, URLSearchParams, fetch, console */
import type { APIRoute } from 'astro';

const USE_MOCK_DATA = false;

const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

// Artists to filter out (case-insensitive)
// Add any artists you don't want appearing in your top lists
const BLOCKED_ARTISTS = [
  'Marvel’s Spidey and His Amazing Friends - Cast',
  'Patrick Stump',
  'Taylor Swift',
  'SuperKitties - Cast',
  'Mickey Mouse',
  'The Laurie Berkner Band',
  'Mandy Moore',
  'Super Simple Songs',

  // Add more here as needed
];

const MOCK_DATA = {
  artists: [
    {
      name: 'Muse',
      image: 'https://i.scdn.co/image/ab6761610000e5eb0accbbe13e1aa147dd27671c',
      url: 'https://open.spotify.com/artist/12Chz98pHFMPJEknJQMWvI',
      genres: ['alternative rock', 'modern rock'],
    },
    {
      name: 'Radiohead',
      image: 'https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd',
      url: 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb',
      genres: ['alternative rock', 'art rock'],
    },
    {
      name: 'Daft Punk',
      image: 'https://i.scdn.co/image/ab6761610000e5eba7bfd7835b5c1eee0c95fa6e',
      url: 'https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi',
      genres: ['electronic', 'french house'],
    },
    {
      name: 'Tame Impala',
      image: 'https://i.scdn.co/image/ab6761610000e5eb5765c7b1bc8eb3c9a8da6c83',
      url: 'https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb',
      genres: ['psychedelic rock', 'indie'],
    },
    {
      name: 'Arctic Monkeys',
      image: 'https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f',
      url: 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH',
      genres: ['indie rock', 'garage rock'],
    },
  ],
  timeRange: 'medium_term',
};

interface SpotifyArtist {
  name: string;
  image: string;
  url: string;
  genres: string[];
}

interface TopArtistsResponse {
  artists: SpotifyArtist[];
  timeRange: string;
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

function isBlocked(artistName: string): boolean {
  return BLOCKED_ARTISTS.some(
    blocked => blocked.toLowerCase() === artistName.toLowerCase()
  );
}

async function getTopArtists(
  accessToken: string,
  timeRange: string = 'short_term',
  limit: number = 10
): Promise<TopArtistsResponse | null> {
  // Fetch extra to account for filtered artists
  const fetchLimit = Math.min(limit + BLOCKED_ARTISTS.length + 10, 50);

  const url = new URL(TOP_ARTISTS_ENDPOINT);
  url.searchParams.set('time_range', timeRange);
  url.searchParams.set('limit', fetchLimit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 200) {
    return null;
  }

  const data = await response.json();

  const artists = data.items
    .filter((artist: { name: string }) => !isBlocked(artist.name))
    .slice(0, limit)
    .map(
      (artist: {
        name: string;
        images: { url: string }[];
        external_urls: { spotify: string };
        genres: string[];
      }) => ({
        name: artist.name,
        image: artist.images[0]?.url,
        url: artist.external_urls.spotify,
        genres: artist.genres.slice(0, 2),
      })
    );

  return { artists, timeRange };
}

export const GET: APIRoute = async ({ url }) => {
  const timeRange = url.searchParams.get('time_range') || 'medium_term';
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  if (USE_MOCK_DATA) {
    return new Response(JSON.stringify(MOCK_DATA), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  }

  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return new Response(JSON.stringify(MOCK_DATA), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      });
    }

    const data = await getTopArtists(accessToken, timeRange, limit);

    if (!data) {
      return new Response(JSON.stringify(MOCK_DATA), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Spotify API error:', error);

    return new Response(JSON.stringify(MOCK_DATA), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  }
};

export const prerender = false;
