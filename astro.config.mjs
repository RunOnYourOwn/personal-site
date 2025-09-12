import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site:
    process.env.SITE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://aaronbrazier.com"
      : "http://localhost:8080"),
  base: "/",
  // trailingSlash: "always",
  integrations: [tailwind(), sitemap(), mdx()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
});
