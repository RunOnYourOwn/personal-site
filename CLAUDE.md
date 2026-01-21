# Personal Site - Claude Code Instructions

Astro-based personal portfolio site with blog posts, projects, and client-side search.

## Purpose (WHY)

Fast, accessible personal website showcasing work and thoughts. Built with Astro for zero-JS by default, achieving 100/100 Lighthouse performance scores. Self-hosted on homelab with automated CI/CD via GitHub Actions and Docker.

## Quick Commands

```bash
# Setup
npm install

# Development
npm run dev              # Start dev server at localhost:4321
npm run build            # Production build to ./dist/
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Format with Prettier
npm run type-check       # Astro type checking

# Quick pre-commit
npm run lint && npm run type-check && npm run build
```

## Critical Rules

### Content Collections

- **Zod schemas enforced** - Invalid frontmatter fails the build
- **Draft posts hidden** - Set `draft: true` to hide in production
- **Blog = MDX, Projects = Markdown** - Different formats for each

### Styling

- **Dark mode via `.dark` class** - System preference + manual toggle
- **Tag colors are semantic** - Purple (data/ML), green (devops), orange (web), blue (default)
- **Tailwind utilities** - Custom tokens in `tailwind.config.js`

### Development

- **Use deployment scripts** - Don't commit VERSION file manually
- **Husky enforced** - Pre-commit runs lint and format
- **Type check before pushing** - `npm run type-check`

## Deployment

Two-step process: prepare release on feature branch, then tag after merge.

```bash
# 1. Prepare release (bumps VERSION and commits)
./scripts/prepare-release.sh patch    # Bug fixes (1.0.5 → 1.0.6)
./scripts/prepare-release.sh minor    # New features (1.0.5 → 1.1.0)
./scripts/prepare-release.sh major    # Breaking changes (1.0.5 → 2.0.0)

# 2. Push branch and create PR to main

# 3. After PR merge, checkout main and tag:
git checkout main && git pull
./scripts/tag-release.sh              # Creates git tag, triggers CI/CD
```

## Project Structure

```
├── src/
│   ├── components/          # Astro components (BaseHead, Search, Cards)
│   ├── content/             # Content collections (Zod-validated)
│   │   ├── blog/            # MDX blog posts
│   │   └── projects/        # Markdown project entries
│   ├── layouts/             # BaseLayout, BlogPost
│   ├── pages/               # File-based routing
│   ├── styles/global.css    # CSS variables, theme tokens
│   └── utils/               # Search data generation
├── src/content.config.ts    # Zod schemas for collections
├── src/consts.ts            # Site constants
├── tailwind.config.js       # Design tokens
└── VERSION                  # Release version (auto-managed)
```

## Documentation

For detailed information, reference using `@` syntax:

### Development Rules

- `@.claude/rules/astro.md` - Astro patterns, content collections, styling system, components
- `@.claude/rules/pre-pr-checklist.md` - Complete pre-PR checklist

### Other

- `@README.md` - Full project overview, Docker deployment, CI/CD details

## Technology Stack

- **Framework**: Astro 5.x (static site, zero-JS by default)
- **Styling**: Tailwind CSS with Typography plugin
- **Content**: MDX + Astro Content Collections + Zod validation
- **Search**: Fuse.js (client-side fuzzy search)
- **Comments**: Remark42 (self-hosted)
- **Analytics**: Umami (self-hosted, privacy-friendly)
- **DevOps**: Docker, GitHub Actions, Portainer, SWAG

---

**Last Updated**: January 2026 | **Live Site**: [aaronbrazier.com](https://aaronbrazier.com)
