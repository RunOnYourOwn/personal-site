#!/bin/bash

# Deployment Status Script for Personal Site
# ===========================================
# Shows current deployment state, recent releases, and recovery options.
#
# Usage: ./scripts/deployment-status.sh
#
# Displays:
#   - Current VERSION file
#   - Git status and latest tag
#   - Recent releases
#   - Last CD workflow run
#   - Production health check
#   - Available GHCR images
#   - Quick recovery commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "Personal Site - Deployment Status"
echo "========================================="
echo ""

# 1. Current version
echo -e "${BLUE}Current Version (VERSION file):${NC}"
CURRENT_VERSION=$(cat VERSION | tr -d ' \t\n\r')
echo "  $CURRENT_VERSION"
echo ""

# 2. Git status
echo -e "${BLUE}Git Status:${NC}"
if [ -z "$(git status --porcelain)" ]; then
  echo -e "  ${GREEN}✓${NC} Working tree clean"
else
  echo -e "  ${YELLOW}!${NC} Uncommitted changes detected"
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "  Branch: $CURRENT_BRANCH"
echo ""

# 3. Latest tag
echo -e "${BLUE}Latest Git Tag:${NC}"
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "No tags found")
echo "  $LATEST_TAG"

if [ "$LATEST_TAG" != "v$CURRENT_VERSION" ]; then
  echo -e "  ${YELLOW}!${NC} Warning: VERSION file ($CURRENT_VERSION) doesn't match latest tag ($LATEST_TAG)"
fi
echo ""

# 4. Recent releases
echo -e "${BLUE}Recent Releases:${NC}"
git tag -l 'v*' --sort=-version:refname | head -5 | while read tag; do
  # Get tag date
  TAG_DATE=$(git log -1 --format=%ai "$tag" 2>/dev/null | cut -d' ' -f1)
  echo "  $tag ($TAG_DATE)"
done
echo ""

# 5. Last deployment workflow
echo -e "${BLUE}Last CD Workflow Run:${NC}"
if command -v gh &> /dev/null; then
  LAST_RUN=$(gh run list --workflow=cd.yml --limit=1 --json status,conclusion,createdAt,headBranch --jq '.[0]')

  if [ -n "$LAST_RUN" ]; then
    STATUS=$(echo "$LAST_RUN" | jq -r '.status')
    CONCLUSION=$(echo "$LAST_RUN" | jq -r '.conclusion')
    CREATED=$(echo "$LAST_RUN" | jq -r '.createdAt')
    BRANCH=$(echo "$LAST_RUN" | jq -r '.headBranch')

    if [ "$CONCLUSION" == "success" ]; then
      echo -e "  ${GREEN}✓${NC} $STATUS ($CONCLUSION) - $CREATED"
    elif [ "$CONCLUSION" == "failure" ]; then
      echo -e "  ${RED}✗${NC} $STATUS ($CONCLUSION) - $CREATED"
    else
      echo -e "  ${YELLOW}○${NC} $STATUS ($CONCLUSION) - $CREATED"
    fi
    echo "  Branch: $BRANCH"
  else
    echo "  No workflow runs found"
  fi
else
  echo "  (Install 'gh' CLI to see workflow status)"
fi
echo ""

# 6. Production health check
echo -e "${BLUE}Production Health:${NC}"
PROD_URL="https://aaronbrazier.com"
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL" || echo "000")

if [ "$HEALTH_CODE" == "200" ]; then
  echo -e "  ${GREEN}✓${NC} $PROD_URL - HTTP $HEALTH_CODE"
else
  echo -e "  ${RED}✗${NC} $PROD_URL - HTTP $HEALTH_CODE"
fi
echo ""

# 7. Available images in registry
echo -e "${BLUE}Recent Images in GHCR:${NC}"
# Try gh API first, fall back to showing recent git tags as proxy
if command -v gh &> /dev/null; then
  IMAGES=$(gh api /users/runonyourown/packages/container/personal-site/versions \
    --jq '.[0:5] | .[] | "  " + .metadata.container.tags[0] + " (" + .created_at[0:10] + ")"' 2>/dev/null)
  if [ -n "$IMAGES" ]; then
    echo "$IMAGES"
  else
    echo "  (Auth needed: run 'gh auth refresh -s read:packages')"
    echo "  Recent tags (images should match):"
    git tag -l 'v*' --sort=-version:refname | head -5 | while read tag; do
      echo "    $tag"
    done
  fi
else
  echo "  (Install 'gh' CLI to see available images)"
fi
echo ""

# 8. Quick recovery commands
echo -e "${BLUE}Quick Recovery Commands:${NC}"
echo ""
echo "Force re-deploy (no version bump):"
echo "  ./scripts/force-deploy.sh"
echo ""
echo "Rollback to previous version:"
PREV_TAG=$(git tag -l 'v*' --sort=-version:refname | sed -n '2p' | tr -d 'v')
if [ -n "$PREV_TAG" ]; then
  echo "  ./scripts/rollback.sh $PREV_TAG"
else
  echo "  ./scripts/rollback.sh <version>"
fi
echo ""
echo "Emergency deploy (skip tests):"
echo "  ./scripts/emergency-deploy.sh"
echo ""
echo "Deploy hotfix:"
echo "  ./scripts/prepare-release.sh patch"
echo "  git push && gh pr create"
echo ""
echo "========================================="
