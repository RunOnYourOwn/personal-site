# Aaron Brazier Personal Website - Implementation Plan

## Project Overview

Modern, blazing-fast personal website built with Astro, deployed via Docker to homelab with SWAG routing.

**Tech Stack:**

- **Framework:** Astro + MDX
- **Styling:** Tailwind CSS + CSS variables
- **Fonts:** Inter (UI) + JetBrains Mono (code)
- **Content:** Astro Content Collections with Zod schemas
- **Deployment:** Docker → GHCR → Portainer → SWAG
- **Domain:** aaronbrazier.com

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Astro Project

```bash
# In the personal-site directory
npm create astro@latest . --template blog --yes
npm install
```

### 1.2 Install Dependencies

```bash
# Core dependencies
npm install -D @astrojs/tailwind @astrojs/sitemap @astrojs/mdx @astrojs/rss
npm install -D @astrojs/check @astrojs/partytown

# UI & Styling
npm install -D tailwindcss @tailwindcss/typography
npm install lucide-react framer-motion

# Content & Search
npm install fuse.js zod

# Fonts
npm install -D @fontsource/inter @fontsource/jetbrains-mono

# Development tools
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-astro prettier prettier-plugin-astro
npm install -D husky lint-staged
```

### 1.3 Configure Astro

Update `astro.config.mjs`:

```javascript
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://aaronbrazier.com",
  base: "/",
  integrations: [tailwind(), sitemap(), mdx()],
  markdown: {
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },
});
```

## Phase 2: Content Collections & Schemas

### 2.1 Create Content Collections

Create `src/content/config.ts`:

```typescript
import { defineCollection, z } from "astro:content";

export const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().transform((s) => new Date(s)),
    updated: z
      .string()
      .optional()
      .transform((s) => (s ? new Date(s) : undefined)),
    tags: z.array(z.string()).default([]),
    hero: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    link: z.string().url().optional(),
    repo: z.string().url().optional(),
    year: z.number().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    hero: z.string().optional(),
    status: z
      .enum(["completed", "in-progress", "archived"])
      .default("completed"),
  }),
});

export const collections = { blog, projects };
```

### 2.2 Create Content Structure

```
src/content/
├── config.ts
├── blog/
│   ├── welcome.mdx
│   └── getting-started.mdx
└── projects/
    ├── personal-site.md
    └── homelab-setup.md
```

## Phase 3: UI Components & Layouts

### 3.1 Core Components

Create these components in `src/components/`:

- `Header.astro` - Navigation with dark mode toggle
- `Footer.astro` - Social links and copyright
- `Hero.astro` - Landing page hero section
- `Card.astro` - Reusable card component
- `BlogCard.astro` - Blog post preview card
- `ProjectCard.astro` - Project showcase card
- `Search.astro` - Client-side search with Fuse.js

### 3.2 Layouts

Create these layouts in `src/layouts/`:

- `BaseLayout.astro` - Main layout with header/footer
- `PostLayout.astro` - Blog post layout
- `ProjectLayout.astro` - Project page layout

### 3.3 Tailwind Configuration

Create `tailwind.config.mjs`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
```

## Phase 4: Pages & Routing

### 4.1 Core Pages

Create these pages in `src/pages/`:

- `index.astro` - Landing page (portfolio)
- `about.astro` - About page
- `blog/index.astro` - Blog listing
- `blog/[slug].astro` - Individual blog posts
- `projects/index.astro` - Projects listing
- `projects/[slug].astro` - Individual project pages
- `404.astro` - Custom 404 page

### 4.2 Landing Page Sections

The landing page should include:

1. **Hero Section** - Name, tagline, CTA buttons
2. **About Preview** - Brief intro with link to full about page
3. **Featured Projects** - 3-4 highlighted projects
4. **Latest Blog Posts** - 3 most recent posts
5. **Contact/Social** - Links to social profiles

## Phase 5: Docker & Deployment

### 5.1 Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK CMD wget -qO- http://localhost/healthz || exit 1
```

### 5.2 Nginx Configuration

Create `nginx.conf`:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location = /healthz {
    return 200 "ok\n";
    add_header Content-Type text/plain;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  add_header Referrer-Policy "strict-origin-when-cross-origin";
  add_header X-Content-Type-Options "nosniff";
  add_header X-Frame-Options "DENY";
  add_header X-XSS-Protection "0";
}
```

### 5.3 GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: build-and-deploy
on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint || true

      - name: Build
        run: npm run build

      - name: Login GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/runonyourown/personal-site:latest
            ghcr.io/runonyourown/personal-site:sha-${{ github.sha }}

      - name: Trigger Portainer redeploy
        run: curl -fsSL -X POST "${{ secrets.PORTAINER_WEBHOOK }}"
```

## Phase 6: SWAG Configuration

### 6.1 SWAG Site Configuration

Create `/config/nginx/site-confs/aaronbrazier.com.conf` in SWAG:

```nginx
server {
  listen 443 ssl http2;
  server_name aaronbrazier.com;
  include /config/nginx/ssl.conf;

  location / {
    proxy_pass http://aaronbrazier_site:80;
    include /config/nginx/proxy.conf;
  }
}

server {
  listen 443 ssl http2;
  server_name www.aaronbrazier.com;
  include /config/nginx/ssl.conf;
  return 301 https://aaronbrazier.com$request_uri;
}
```

### 6.2 Portainer Stack

Create Portainer stack with:

```yaml
services:
  aaronbrazier_site:
    image: ghcr.io/runonyourown/personal-site:latest
    restart: always
    networks: [proxy]
networks:
  proxy:
    external: true
```

## Phase 7: Development Tools & Quality

### 7.1 ESLint Configuration

Create `.eslintrc.cjs`:

```javascript
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:astro/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
```

### 7.2 Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-astro"]
}
```

### 7.3 Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint . --ext .js,.ts,.astro",
    "lint:fix": "eslint . --ext .js,.ts,.astro --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Phase 8: Content Creation

### 8.1 Initial Blog Posts

Create 2-3 initial blog posts:

- Welcome post
- About your homelab setup
- About your development journey

### 8.2 Project Showcase

Create project entries for:

- This personal website
- Homelab infrastructure
- Other notable projects

### 8.3 About Page Content

Write compelling about page content highlighting:

- Your background
- Skills and expertise
- Current interests
- Contact information

## Phase 9: SEO & Performance

### 9.1 SEO Implementation

- Add proper meta tags to all pages
- Implement OpenGraph and Twitter Card tags
- Create sitemap.xml
- Add robots.txt
- Implement structured data (JSON-LD)

### 9.2 Performance Optimization

- Optimize images with Astro's built-in image optimization
- Implement proper caching headers
- Add service worker for offline functionality
- Minimize JavaScript bundles

## Phase 10: Launch & Monitoring

### 10.1 Pre-launch Checklist

- [ ] All pages load correctly
- [ ] Dark mode toggle works
- [ ] Search functionality works
- [ ] RSS feed is accessible
- [ ] Sitemap is generated
- [ ] All links work
- [ ] Mobile responsive
- [ ] Performance scores are good

### 10.2 Post-launch

- Set up monitoring with Uptime Kuma
- Configure analytics (Plausible/Umami)
- Set up backup strategy
- Document maintenance procedures

## Commands to Run

After implementing the plan, you'll need to run:

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format
```

## Deployment Commands

```bash
# Build and push to GHCR (handled by GitHub Actions)
git add .
git commit -m "feat: initial website implementation"
git push origin main

# The GitHub Action will automatically:
# 1. Build the Astro site
# 2. Create Docker image
# 3. Push to GHCR
# 4. Trigger Portainer webhook
# 5. Deploy to your homelab
```

This plan provides a comprehensive roadmap for building your modern, performant personal website with a complete CI/CD pipeline!
