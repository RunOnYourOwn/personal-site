#!/usr/bin/env node
/* global console, Buffer, fetch, URLSearchParams */
/* eslint-disable no-console */

/**
 * Spotify OAuth Helper Script
 *
 * This script helps you obtain a refresh token for the Spotify API.
 * Run this once to get your refresh token, then add it to your .env file.
 *
 * Prerequisites:
 * 1. Create a Spotify Developer app at https://developer.spotify.com/dashboard
 * 2. Add http://localhost:3000/callback as a redirect URI in your app settings
 * 3. Copy your Client ID and Client Secret
 *
 * Usage:
 * SPOTIFY_CLIENT_ID=your_id SPOTIFY_CLIENT_SECRET=your_secret node scripts/spotify-auth.js
 */

import http from 'http';
import { URL } from 'url';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
// Note: Spotify requires 127.0.0.1 (not localhost) for loopback addresses
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const SCOPES = [
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Error: Missing required environment variables');
  console.error('\nUsage:');
  console.error(
    '  SPOTIFY_CLIENT_ID=your_id SPOTIFY_CLIENT_SECRET=your_secret node scripts/spotify-auth.js'
  );
  console.error('\nSteps:');
  console.error('  1. Go to https://developer.spotify.com/dashboard');
  console.error('  2. Open your app settings');
  console.error(
    '  3. Add http://127.0.0.1:3000/callback as a redirect URI (not localhost!)'
  );
  console.error('  4. Copy your Client ID and Client Secret');
  console.error(
    '  5. Run this script with those values as environment variables\n'
  );
  process.exit(1);
}

// Generate authorization URL
const authUrl = new URL('https://accounts.spotify.com/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('scope', SCOPES);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);

console.log('\n🎵 Spotify OAuth Setup\n');
console.log('1. Open this URL in your browser:\n');
console.log(`   ${authUrl.toString()}\n`);
console.log('2. Authorize the app');
console.log('3. You will be redirected back here\n');
console.log('Waiting for callback...\n');

// Create a simple HTTP server to handle the callback
const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/callback')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const url = new URL(req.url, `http://localhost:3000`);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400);
    res.end(`Error: ${error}`);
    console.error(`❌ Authorization failed: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end('No authorization code received');
    return;
  }

  try {
    // Exchange code for tokens
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      'base64'
    );

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      res.writeHead(400);
      res.end(`Token error: ${tokens.error}`);
      console.error(`❌ Token exchange failed: ${tokens.error}`);
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: system-ui; padding: 2rem; text-align: center;">
          <h1>✅ Success!</h1>
          <p>You can close this window and return to your terminal.</p>
        </body>
      </html>
    `);

    console.log('✅ Success! Add these to your .env file:\n');
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
    console.log('SPOTIFY_CLIENT_SECRET=<your existing client secret>');
    console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(
      '\nThen set USE_MOCK_DATA = false in src/pages/api/spotify/now-playing.ts\n'
    );

    server.close();
    process.exit(0);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal server error');
    console.error('❌ Error:', err);
    server.close();
    process.exit(1);
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server listening on http://127.0.0.1:3000');
});
