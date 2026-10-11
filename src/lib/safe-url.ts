/**
 * URL allowlisting for remote (Spotify) data that is written into the DOM.
 * Returns the URL unchanged when it is an https URL on an allowed origin
 * prefix, otherwise null. Callers must drop the link/image on null.
 */
export const SPOTIFY_LINK_PREFIX = 'https://open.spotify.com/';

export function safeUrl(value: unknown, prefix: string): string | null {
  if (typeof value !== 'string' || !value.startsWith(prefix)) return null;
  try {
    const parsed = new URL(value);
    const allowed = new URL(prefix);
    if (parsed.protocol !== 'https:' || parsed.origin !== allowed.origin) {
      return null;
    }
  } catch {
    return null;
  }
  return value;
}

export function safeSpotifyLink(value: unknown): string | null {
  return safeUrl(value, SPOTIFY_LINK_PREFIX);
}

/**
 * Spotify artwork is served from *.scdn.co and *.spotifycdn.com. Returns the
 * URL when it is https on one of those hosts, otherwise null.
 */
export function safeSpotifyImage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname;
    const ok =
      parsed.protocol === 'https:' &&
      !parsed.username &&
      !parsed.password &&
      (host === 'scdn.co' ||
        host.endsWith('.scdn.co') ||
        host === 'spotifycdn.com' ||
        host.endsWith('.spotifycdn.com'));
    return ok ? value : null;
  } catch {
    return null;
  }
}
