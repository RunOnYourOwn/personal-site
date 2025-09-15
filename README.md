# Aaron Brazier - Personal Website

This is my personal website - a modern, fast site built with Astro that showcases my work, projects, and thoughts. It's deployed on my homelab infrastructure with a fully automated CI/CD pipeline.

## What Makes This Special

I built this site to be fast, accessible, and easy to maintain. Here's what I've got going on:

- **Modern Tech Stack** - Astro + MDX + Tailwind CSS + TypeScript
- **Lightning Fast** - 100/100 Lighthouse scores with perfect Core Web Vitals
- **SEO That Actually Works** - OpenGraph, structured data, sitemap, and custom OG images
- **Accessible by Design** - WCAG 2.1 AA compliant with skip links and proper ARIA labels
- **Privacy-First Analytics** - Self-hosted Umami (no Google tracking here)
- **Automated Everything** - GitHub Actions + Docker handles all the deployment magic
- **Smart Versioning** - Semantic versioning with automated releases
- **Content That Just Works** - Astro Content Collections with Zod validation
- **Dark Mode Done Right** - Automatically matches your system preference
- **Mobile-First** - Optimized for all devices with sticky navigation
- **Search That Finds Stuff** - Client-side fuzzy search with Fuse.js
- **Homelab Powered** - Runs on my own infrastructure with SWAG + Portainer

## How It's Organized

The codebase is pretty straightforward - I like to keep things simple:

```text
├── public/                    # Static stuff (images, favicons)
├── src/
│   ├── components/           # Reusable Astro components
│   ├── content/             # Where the magic happens (blog, projects)
│   │   ├── blog/           # Blog posts (MDX format)
│   │   └── projects/       # Project entries (Markdown)
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages
│   └── styles/             # Global CSS and Tailwind
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.prod.yml  # Production deployment
├── Dockerfile              # Container configuration
├── nginx.conf              # Web server config
└── VERSION                 # Site version tracking
```

## Adding Content

This is the fun part - adding new content is super easy:

- **Blog Posts**: Just drop an MDX file in `src/content/blog/` and you're good to go
- **Projects**: Add a Markdown file to `src/content/projects/` with the right frontmatter
- **Images**: Stick them in `public/images/` and reference as `/images/filename`
- **Versioning**: The `VERSION` file tracks releases (though the scripts handle this automatically)

## Getting Started

Here are the commands you'll actually use:

| Command               | What it does                                    |
| :-------------------- | :---------------------------------------------- |
| `npm install`         | Get all the dependencies                        |
| `npm run dev`         | Start the dev server (usually `localhost:4321`) |
| `npm run build`       | Build the production site to `./dist/`          |
| `npm run preview`     | Preview the production build locally            |
| `npm run lint`        | Check code quality with ESLint                  |
| `npm run format`      | Make the code look pretty with Prettier         |
| `npm run astro check` | Type check everything with Astro                |

## Deployment Made Simple

I've streamlined the deployment process so it's actually enjoyable to use. There are just two scripts, and they handle all the versioning magic for you:

### Adding Content (Blog posts, projects, assets)

```bash
# 1. Create a feature branch
git checkout -b update-content

# 2. Make your changes (blog posts, projects, etc.)
# Edit files in src/content/ or add images

# 3. Let the script do the heavy lifting
./scripts/deploy-content.sh
# This automatically bumps the patch version and commits

# 4. Push and create a PR
git push origin update-content
# Create PR to main, merge when ready

# 5. Sit back and relax
# GitHub Actions detects the version change and deploys automatically
```

### Making Code Changes (Components, layouts, features)

```bash
# 1. Create a feature branch
git checkout -b new-feature

# 2. Make your changes (components, layouts, etc.)
# Edit files in src/components/, src/layouts/, etc.

# 3. Choose your version bump
./scripts/deploy-code.sh patch  # or minor/major
# This bumps the version and commits

# 4. Push and create a PR
git push origin new-feature
# Create PR to main, merge when ready

# 5. Watch the magic happen
# GitHub Actions detects the version change and deploys automatically
```

### Version Bumping Made Easy

- **patch**: Bug fixes, small improvements (1.0.5 → 1.0.6)
- **minor**: New features, significant improvements (1.0.5 → 1.1.0)
- **major**: Breaking changes, major redesigns (1.0.5 → 2.0.0)

## Running with Docker

### Local Development

```bash
# Build and run locally
docker build -t personal-site .
docker run -p 8080:80 -e UMAMI_URL=https://umami.aaronbrazier.com personal-site

# Or just test the production build
npm run build
npm run preview
```

### Production Deployment

```bash
# The easy way (includes Umami analytics)
docker-compose -f docker-compose.prod.yml up -d

# Or manually if you prefer
docker pull ghcr.io/runonyourown/personal-site:latest
docker run -d --name personal-site -p 80:80 ghcr.io/runonyourown/personal-site:latest
```

## The Tech Stack

Here's what I'm using to make this all work:

- **Framework**: [Astro](https://astro.build/) - Static site generator with zero-JS by default (it's fast!)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS with custom design tokens
- **Content**: [MDX](https://mdxjs.com/) - Markdown with JSX for rich content
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/) + [Zod](https://zod.dev/) validation (because types are good)
- **Analytics**: [Umami](https://umami.is/) - Privacy-friendly, self-hosted analytics (no Google tracking)
- **Search**: [Fuse.js](https://fusejs.io/) - Client-side fuzzy search that actually works
- **Deployment**: Docker + GitHub Actions + Portainer + SWAG
- **Infrastructure**: My homelab with automated CI/CD pipeline

## Performance That Actually Matters

I'm pretty proud of these numbers - they're not just marketing fluff:

- **Lighthouse Scores** (Production):
  - Performance: 100/100
  - Accessibility: 83/100 (WCAG 2.1 AA compliant)
  - Best Practices: 100/100
  - SEO: 100/100
- **Core Web Vitals** (All in the "Good" range):
  - First Contentful Paint: 0.9s
  - Largest Contentful Paint: 1.7s
  - Cumulative Layout Shift: 0.007
  - Total Blocking Time: 0ms
- **Bundle Size**: Minimal JavaScript footprint with Astro's zero-JS by default
- **SEO**: Full OpenGraph, Twitter Cards, structured data, and custom OG images
- **Accessibility**: Comprehensive keyboard navigation and ARIA labels

## The CI/CD Magic

This is where things get interesting - I've automated pretty much everything:

### GitHub Actions Workflows

- **CI Pipeline** (`ci.yml`): Validates code quality on PRs (lint, type check, build test)
- **CD Pipeline** (`cd.yml`): Automated deployment with version detection and tagging

### What Happens Automatically

- **Version Detection**: Automatically detects version changes and creates tags
- **Docker Building**: Multi-platform builds (linux/amd64, linux/arm64)
- **Security Scanning**: Trivy vulnerability scanning on all images
- **Release Notes**: Automatic generation of release notes from commits
- **Portainer Integration**: Automatic deployment via webhook

## Let's Connect

- **Live Site**: [aaronbrazier.com](https://aaronbrazier.com)
- **GitHub**: [runonyourown/personal-site](https://github.com/runonyourown/personal-site)
- **LinkedIn**: [aaronbrazier](https://www.linkedin.com/in/aaronbrazier/)
- **Email**: aaronbrazier@gmail.com

## License

This project is open source and available under the [MIT License](LICENSE). Feel free to use it as inspiration for your own projects!
