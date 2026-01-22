# Personal Website

My personal site built with Astro. Deployed on my homelab with GitHub Actions and Docker.

## Stack

- **Framework**: Astro (static, zero-JS by default)
- **Styling**: Tailwind CSS
- **Content**: MDX for blog posts, Markdown for projects
- **Validation**: Zod schemas for frontmatter
- **Analytics**: Umami (self-hosted)
- **Deployment**: Docker, GitHub Actions, Portainer

## Structure

```
src/
├── components/     # Astro components
├── content/
│   ├── blog/       # MDX blog posts
│   └── projects/   # Markdown project entries
├── layouts/        # Page layouts
├── pages/          # Routes
└── styles/         # Global CSS
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:4321
npm run build        # Build to ./dist/
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Astro type checking
```

## Adding Content

Blog posts go in `src/content/blog/` as MDX files. Projects go in `src/content/projects/` as Markdown. Both use frontmatter validated by Zod schemas in `src/content.config.ts`.

Set `draft: true` in frontmatter to hide posts from production.

## Deployment

The CD pipeline handles everything automatically. When you merge a PR with a VERSION change, GitHub Actions creates the tag, builds the Docker image, and triggers deployment.

```bash
# 1. Make changes on a feature branch
git checkout -b my-feature

# 2. Bump version (commits automatically)
./scripts/prepare-release.sh patch   # 1.0.5 → 1.0.6
./scripts/prepare-release.sh minor   # 1.0.5 → 1.1.0
./scripts/prepare-release.sh major   # 1.0.5 → 2.0.0

# 3. Push and create PR
git push origin my-feature

# 4. Merge PR - CI/CD handles the rest
```

## Docker

```bash
# Local
docker build -t personal-site .
docker run -p 8080:80 personal-site

# Production
docker pull ghcr.io/runonyourown/personal-site:latest
docker run -d -p 80:80 ghcr.io/runonyourown/personal-site:latest
```

## Links

- [aaronbrazier.com](https://aaronbrazier.com)
- [GitHub](https://github.com/runonyourown/personal-site)

## License

MIT
