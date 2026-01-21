#!/bin/bash

# Force Deploy Script for Personal Site
# ======================================
# Triggers a deployment without requiring a version bump.
# Use this when:
#   - Portainer webhook failed but image was published
#   - Need to re-deploy after manual infrastructure changes
#   - Registry push succeeded but deploy step timed out
#
# Usage: ./scripts/force-deploy.sh
#
# Requirements:
#   - GitHub CLI (gh) installed and authenticated
#   - On the main branch or specify a ref

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for gh CLI
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check gh auth status
if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI is not authenticated"
    echo "Run: gh auth login"
    exit 1
fi

# Get current version
VERSION=$(cat VERSION 2>/dev/null | tr -d ' \t\n\r')
if [ -z "$VERSION" ]; then
    print_error "Could not read VERSION file"
    exit 1
fi

print_info "Force deploying version: $VERSION"
print_warning "This will rebuild and redeploy without version bump"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cancelled"
    exit 0
fi

print_info "Triggering CD workflow with force_deploy=true..."

gh workflow run cd.yml \
    --ref main \
    -f force_deploy=true

print_success "Workflow triggered!"
echo ""
print_info "Monitor progress at:"
echo "https://github.com/RunOnYourOwn/personal-site/actions/workflows/cd.yml"
echo ""
print_info "Or run: gh run watch"
