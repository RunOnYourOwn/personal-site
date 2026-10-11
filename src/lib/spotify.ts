/* global Buffer, URLSearchParams, fetch, console, Response */
/**
 * Shared helpers for the /api/spotify/* routes.
 *
 * Failure policy: the public widgets keep working on mock data when Spotify
 * is unavailable, but every fallback is (a) logged as one structured JSON
 * line on stderr and (b) flagged to the client with `degraded: true` plus a
 * `degradedReason` code. Logs never contain credentials, tokens or response
 * bodies - only route, reason code, HTTP status and Spotify's error code.
 */

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const DEGRADED_CACHE_CONTROL = 'public, s-maxage=30';

export type FailureReason =
  | 'no_credentials'
  | 'token_refresh_failed'
  | 'upstream_error'
  | 'internal_error';

export class UpstreamError extends Error {
  status: number;
  constructor(where: string, status: number) {
    super(`${where} returned HTTP ${status}`);
    this.name = 'UpstreamError';
    this.status = status;
  }
}

export type TokenResult =
  | { ok: true; token: string }
  | { ok: false; reason: FailureReason; detail: string };

// Spotify access tokens last ~1h. Reuse one until shortly before expiry
// instead of calling the token endpoint on every request.
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export function resetTokenCache(): void {
  cachedToken = null;
}

export async function getAccessToken(): Promise<TokenResult> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return { ok: true, token: cachedToken.token };
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      ok: false,
      reason: 'no_credentials',
      detail: 'SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN not all set',
    };
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

  let data: {
    access_token?: unknown;
    expires_in?: unknown;
    error?: unknown;
  } = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON body: fall through to the failure branch below
  }

  if (!response.ok || typeof data.access_token !== 'string') {
    // Spotify's `error` is a short code such as `invalid_grant`; accept only
    // that shape so nothing free-form (or secret) can reach the logs.
    const code =
      typeof data.error === 'string' && /^[a-z_]{1,40}$/.test(data.error)
        ? ` ${data.error}`
        : '';
    return {
      ok: false,
      reason: 'token_refresh_failed',
      detail: `token endpoint HTTP ${response.status}${code}`,
    };
  }

  const lifetimeMs =
    (typeof data.expires_in === 'number' ? data.expires_in : 0) * 1000;
  if (lifetimeMs > TOKEN_EXPIRY_MARGIN_MS) {
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + lifetimeMs - TOKEN_EXPIRY_MARGIN_MS,
    };
  }
  return { ok: true, token: data.access_token };
}

export function logSpotifyFailure(
  route: string,
  reason: FailureReason,
  detail: string
): void {
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: 'error',
      component: 'spotify',
      route,
      reason,
      detail: detail.slice(0, 200),
    })
  );
}

export function jsonResponse(body: unknown, cacheControl: string): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}

/**
 * Log the failure and serve the mock payload flagged as degraded. Cached only
 * briefly so recovery is picked up quickly.
 */
export function degradedResponse(
  route: string,
  reason: FailureReason,
  detail: string,
  mock: object
): Response {
  logSpotifyFailure(route, reason, detail);
  return jsonResponse(
    { ...mock, degraded: true, degradedReason: reason },
    DEGRADED_CACHE_CONTROL
  );
}

export function degradedFromError(
  route: string,
  error: unknown,
  mock: object
): Response {
  if (error instanceof UpstreamError) {
    return degradedResponse(route, 'upstream_error', error.message, mock);
  }
  const message = error instanceof Error ? error.message : 'unknown error';
  return degradedResponse(route, 'internal_error', message, mock);
}
