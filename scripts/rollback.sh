#!/bin/bash

# Rollback Script for Personal Site
# ==================================
# Rolls back to a previous version using existing GHCR image.
# No rebuild required - uses image already in registry.
#
# Use this when:
#   - Production is broken after a deploy
#   - Need to quickly revert while investigating
#   - Bad code made it through testing
#
# Usage: 
#   ./scripts/rollback.sh <version>
#   ./scripts/rollback.sh 2.0.3
#   ./scripts/rollback.sh 2.0.3 "Rollback due to login bug"
#
# Requirements:
#   - GitHub CLI (gh) installed and authenticated

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

# Show usage
usage() {
    echo "Usage: $0 <version> [reason]"
    echo ""
    echo "Arguments:"
    echo "  version    Version to rollback to (e.g., 2.0.3)"
    echo "  reason     Optional reason for rollback (for audit trail)"
    echo ""
    echo "Examples:"
    echo "  $0 2.0.3"
    echo "  $0 2.0.3 \"Reverting due to login bug\""
    echo ""
    echo "To see available versions:"
    echo "  git tag -l 'v*' | sort -V | tail -10"
    exit 1
}

# Check arguments
if [ -z "$1" ]; then
    print_error "Version argument required"
    usage
fi

VERSION="$1"
REASON="${2:-Manual rollback}"

# Validate version format
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format: $VERSION"
    echo "Use semantic versioning (e.g., 2.0.3)"
    exit 1
fi

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
CURRENT_VERSION=$(cat VERSION 2>/dev/null | tr -d ' \t\n\r')

print_info "Rollback Details:"
echo "  Current version: $CURRENT_VERSION"
echo "  Target version:  $VERSION"
echo "  Reason:          $REASON"
echo ""

print_warning "This will deploy v$VERSION to production!"
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cancelled"
    exit 0
fi

print_info "Triggering rollback workflow..."

gh workflow run rollback.yml \
    -f version="$VERSION" \
    -f reason="$REASON"

print_success "Rollback triggered!"
echo ""
print_info "Monitor progress at:"
echo "https://github.com/RunOnYourOwn/personal-site/actions/workflows/rollback.yml"
echo ""
print_info "Or run: gh run watch"
echo ""
print_warning "Remember: This doesn't change the VERSION file or create commits."
print_warning "To make this permanent, update VERSION and create a new release."
