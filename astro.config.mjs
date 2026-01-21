import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

export default defineConfig({
  site:
    process.env.SITE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://aaronbrazier.com'
      : 'http://localhost:8080'),
  base: '/',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [sitemap(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
