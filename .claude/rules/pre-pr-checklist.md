# Pre-PR Checklist - Personal Site

Complete this checklist **before pushing your branch**. If any item fails, fix it first.

## 1. Code Quality

- [ ] **Linting passes**: `npm run lint`
- [ ] **Type check passes**: `npm run type-check`
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

## 4. Deployment

- [ ] **Version bumped** - Use deployment scripts:
  - Content changes: `./scripts/deploy-content.sh`
  - Code changes: `./scripts/deploy-code.sh [patch|minor|major]`
- [ ] **VERSION file committed** - Included in the PR

## 5. Git Hygiene

- [ ] **Descriptive commit messages** - Explain what and why
- [ ] **No merge conflicts** - Rebase on latest main if needed
- [ ] **Co-Authored-By line** - `Co-Authored-By: Claude <noreply@anthropic.com>`

## Quick Pre-PR Commands

```bash
# Code quality checks
npm run lint                 # Linting passes
npm run type-check           # Type checking passes
npm run build                # Build succeeds

# Preview locally
npm run preview              # Check production build

# Git checks
git status                   # No uncommitted changes
git log --oneline -5         # Review recent commits
git diff main                # Review all changes

# Version bump (choose one)
./scripts/deploy-content.sh              # Content changes
./scripts/deploy-code.sh patch           # Bug fixes
./scripts/deploy-code.sh minor           # New features

# Push and create PR
git push origin feature/your-branch
```

## PR Review Checklist (For Reviewers)

### Must Pass

- [ ] All CI checks pass (lint, type-check, build)
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
