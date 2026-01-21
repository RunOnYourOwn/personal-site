#!/bin/bash

# Re-push Tag Script for Personal Site
# =====================================
# Deletes and recreates a tag at origin/main HEAD.
#
# Use this when:
#   - A tag was created at the wrong commit
#   - You need to fix a tag after force-pushing main
#   - Tag exists but points to an old commit
#
# Usage:
#   ./scripts/repush-tag.sh v2.0.5    # Re-push specific tag
#   ./scripts/repush-tag.sh           # Re-push latest tag
#   ./scripts/repush-tag.sh current   # Show latest tag
#
# WARNING: This rewrites git history for the tag. Use with caution.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to get latest tag
get_latest_tag() {
    local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    if [ -z "$latest_tag" ]; then
        print_error "No tags found in repository"
        exit 1
    fi
    echo "$latest_tag"
}

# Function to get version from tag
get_version_from_tag() {
    local tag=$1
    echo "${tag#v}"
}

# Function to recreate and push tag
repush_tag() {
    local tag_name=$1
    local version=$(get_version_from_tag "$tag_name")

    print_info "Re-creating tag '$tag_name' at current HEAD..."

    # Fetch latest from origin
    print_info "Fetching latest from origin..."
    git fetch origin main

    # Delete tag from remote if it exists
    print_info "Deleting tag '$tag_name' from remote..."
    git push origin --delete "$tag_name" 2>/dev/null || print_warning "Tag not found on remote (continuing)"

    # Delete local tag if it exists
    git tag -d "$tag_name" 2>/dev/null || true

    # Create new tag at origin/main
    print_info "Creating tag '$tag_name' at origin/main..."
    git tag -a "$tag_name" origin/main -m "Release version $version"

    # Push new tag
    print_info "Pushing tag '$tag_name' to origin..."
    git push origin "$tag_name"

    print_success "Tag '$tag_name' recreated and pushed successfully!"
    print_info "CD pipeline should now be triggered."
}

# Main script logic
case $1 in
    "")
        # No tag specified, use latest
        latest_tag=$(get_latest_tag)
        print_info "Using latest tag: $latest_tag"
        repush_tag "$latest_tag"
        ;;
    current)
        latest_tag=$(get_latest_tag)
        print_info "Latest tag: $latest_tag"
        ;;
    *)
        # Tag specified
        repush_tag "$1"
        ;;
esac
