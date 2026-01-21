/* global Response */
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response('ok\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};

export const prerender = false;
