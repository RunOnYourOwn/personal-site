# Pre-PR Checklist - Personal Site

Complete this checklist **before pushing your branch**. If any item fails, fix it first.

## 1. Code Quality

- [ ] **Linting passes**: `npm run lint`
- [ ] **Type check passes**: `npm run type-check`
- [ ] **Unit tests pass**: `npm test`
- [ ] **Build succeeds**: `npm run build`
- [ ] **No console.log statements** - Clean up before commit
- [ ] **No commented-out code** - Remove or restore

## 2. Content (if adding blog posts or projects)

- [ ] **Frontmatter complete** - All required fields present
- [ ] **Schema validates** - Build doesn't fail on content errors
- [ ] **Draft status correct** - Set `draft: true` if not ready for publish
- [ ] **Tags are appropriate** - Use existing tag categories when possible
- [ ] **Images optimized** - Reasonable file sizes, proper formats

## 3. Styling

- [ ] **Dark mode works** - Test toggle and system preference
- [ ] **Responsive design** - Test mobile and desktop views
- [ ] **No layout shifts** - Check for CLS issues
- [ ] **Accessibility** - Interactive elements have focus states

## 4. Deployment (Forgejo CD + VERSION bump)

Merging to `main` does **not** deploy by itself. The CD workflow
(`.forgejo/workflows/cd.yml`) runs on every push to `main` but only builds and
deploys when the `VERSION` file names a version that has no `vX.Y.Z` git tag
yet. A build pushes the image to the Forgejo container registry, tags the
release, and bumps the image tag in the `homelab-apps` deploy repo (Komodo
redeploys from there).

- [ ] **Decide if this change must ship**. Docs-only or tooling-only changes do not need a release.
- [ ] **If it must ship, bump `VERSION`** (semver, e.g. `2.1.7` -> `2.1.8`) by hand. Do it in its own release PR (`chore: release vX.Y.Z`) after the change PRs have landed, so one deploy carries them all.
- [ ] **Never bump to a version that is already tagged** - CD would skip the build.
- [ ] **After the release PR lands**, watch the CD run in Forgejo Actions and check `https://aaronbrazier.com/healthz` returns 200.
- [ ] **Container changes** (`Dockerfile`): build the image locally and confirm `/healthz` returns 200 as the non-root `node` user on port 80 before opening the PR.

There are no `deploy-content.sh` / `deploy-code.sh` scripts; the old deploy and
release scripts were removed in the move to Forgejo.

## 5. Git Hygiene

- [ ] **Descriptive commit messages** - Explain what and why
- [ ] **No merge conflicts** - Rebase on latest main if needed
- [ ] **No attribution** - no `Co-Authored-By`, session link or "Generated with" footer in commits or the PR description

## Quick Pre-PR Commands

```bash
# Code quality checks
npm run lint                 # Linting passes
npm run type-check           # Type checking passes
npm test                     # Unit tests pass
npm run build                # Build succeeds

# Preview locally
npm run preview              # Check production build

# Git checks
git status                   # No uncommitted changes
git log --oneline -5         # Review recent commits
git diff main                # Review all changes

# Push the branch to Forgejo (origin) and open the PR there
git push -u origin feature/your-branch
```

Release (only when the change must deploy, after the change PRs have landed):

```bash
cat VERSION                  # current version
git tag -l "v$(cat VERSION)" # must print nothing, else CD skips the build
# edit VERSION to the next patch/minor/major, then open a
# `chore: release vX.Y.Z` PR and land it
```

## PR Review Checklist (For Reviewers)

### Must Pass

- [ ] Local checks pass (lint, type-check, test, build). The PR CI workflow (`.forgejo/workflows/ci.yml`, job `CI / validate`) runs the same checks on Node 22; the CD build on `main` is separate
- [ ] No broken links or missing images
- [ ] Dark mode works on new/modified components
- [ ] Mobile responsive

### Content Review

- [ ] Blog posts have meaningful descriptions
- [ ] Project entries have accurate metadata
- [ ] No typos or grammar issues in visible content

### Block PR If

- **Build fails** - Must fix before merge
- **Type errors** - No `@ts-ignore` without justification
- **Broken dark mode** - All components must support themes
- **Accessibility regression** - Focus states, ARIA labels required
