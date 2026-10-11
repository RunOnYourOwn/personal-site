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

Version bump triggers automatic deployment when PR is merged to main.

```bash
# Normal deployment flow
./scripts/prepare-release.sh patch    # Bug fixes (1.0.5 → 1.0.6)
./scripts/prepare-release.sh minor    # New features (1.0.5 → 1.1.0)
./scripts/prepare-release.sh major    # Breaking changes (1.0.5 → 2.0.0)
# Then push branch, create PR, merge → CD auto-deploys

# Recovery scripts
./scripts/force-deploy.sh             # Re-deploy without version bump
./scripts/rollback.sh 2.0.3           # Rollback to specific version
./scripts/emergency-deploy.sh         # Deploy skipping tests (use sparingly!)

# Utilities
./scripts/deployment-status.sh        # Check current deployment status
./scripts/tag-release.sh              # Manually create tag (if needed)
./scripts/repush-tag.sh v2.0.5        # Fix a tag pointing to wrong commit
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
- **Analytics**: Umami (self-hosted, privacy-friendly)
- **DevOps**: Docker, GitHub Actions, Portainer, SWAG

---

**Last Updated**: January 2026 | **Live Site**: [aaronbrazier.com](https://aaronbrazier.com)

<!-- argus-config v1 -->
## Argus coordination (project personal-site)

This repo belongs to the Argus project 'personal-site'. Agents working here:

1. **The board is the coordination surface**: file tasks via the argus MCP
   (register once: claude mcp add --transport http argus
   https://argus.aaronbrazier.com/mcp --header "Authorization: Bearer
   $ARGUS_CAPTURE_TOKEN") or POST /tasks. Every task needs a why; leaf tasks
   need acceptance. verified is set ONLY by the deterministic checker.
2. **Declare closures explicitly**: for every task the PR completes, make the
   first nonblank PR body line "Closes ARGUS-N". Correct body:
   "Closes ARGUS-N\n\n<why + what changed>". Incorrect: title
   "Closes ARGUS-N: <title>" with no first body line; the checker ignores the
   title for this contract. A bare mention never links.
3. **Never merge directly**: open the PR, then signal
   POST /landing/{owner}/{name}/ready {"pr_number":N,"task_id":"ARGUS-N"}.
   The hub serializes rebase -> CI -> merge -> deploy; failures comment on
   the PR and page.
4. **Secrets stay out of the repo** (env files / SOPS); bearer tokens live
   in ~/.argus/agent-runner.env on each machine.

<!-- If this repo deploys ITSELF from its own CI workflow (e.g. a push to
     master redeploys via Forgejo Actions), deploy_hook stays empty on
     purpose -- there's no host-runner script to claim. Opt the project in
     with PATCH /projects/<slug> {"ci_deploy_target":"<bare-id>"}, then add
     these two calls around the deploy step (docs/reference/ci-deploy-report.md):

curl -sf -X POST https://argus.aaronbrazier.com/deploys/report/start \
  -H "Authorization: Bearer $ARGUS_CAPTURE_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"repo\":\"<owner>/<repo>\",\"target\":\"<bare-id>\",\"sha\":\"$GITHUB_SHA\"}"

# ... run the deploy step, then report the outcome ...

curl -sf -X POST https://argus.aaronbrazier.com/deploys/report/complete \
  -H "Authorization: Bearer $ARGUS_CAPTURE_TOKEN" -H 'Content-Type: application/json' \
  -d "{\"repo\":\"<owner>/<repo>\",\"target\":\"<bare-id>\",\"sha\":\"$GITHUB_SHA\",\"ok\":true,\"detail\":\"deployed via forgejo actions run $GITHUB_RUN_ID\"}"
-->
<!-- /argus-config -->
