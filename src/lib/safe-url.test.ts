import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeSpotifyImage, safeSpotifyLink, safeUrl } from './safe-url.ts';

test('accepts a spotify track link', () => {
  const u = 'https://open.spotify.com/track/3skn2lauGk7Dx6bVIt5DVj';
  assert.equal(safeSpotifyLink(u), u);
});

test('rejects javascript:, data:, http and foreign hosts', () => {
  for (const bad of [
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://open.spotify.com/track/x',
    'https://evil.example/https://open.spotify.com/',
    'https://open.spotify.com.evil.example/track/x',
    'https://open.spotify.com@evil.example/track/x',
    '',
    undefined,
    null,
    42,
  ]) {
    assert.equal(safeSpotifyLink(bad), null, String(bad));
  }
});

test('safeUrl enforces the given prefix', () => {
  assert.equal(
    safeUrl('https://i.scdn.co/image/abc', 'https://i.scdn.co/'),
    'https://i.scdn.co/image/abc'
  );
  assert.equal(safeUrl('https://i.scdn.co.evil/x', 'https://i.scdn.co/'), null);
});

test('safeSpotifyImage allows Spotify CDN hosts only', () => {
  for (const ok of [
    'https://i.scdn.co/image/ab67616d0000b273b6d4566db0d12894a1a3b7a2',
    'https://mosaic.scdn.co/640/abc',
    'https://image-cdn-ak.spotifycdn.com/image/abc',
  ]) {
    assert.equal(safeSpotifyImage(ok), ok);
  }
  for (const bad of [
    'javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'http://i.scdn.co/image/x',
    'https://i.scdn.co.evil.example/x',
    'https://evil.example/i.scdn.co/x',
    'https://user:pw@i.scdn.co/x',
    'https://notscdn.co/x',
    undefined,
    null,
  ]) {
    assert.equal(safeSpotifyImage(bad), null, String(bad));
  }
});
