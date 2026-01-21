#!/bin/bash

# Prepare Release Script for Personal Site
# =========================================
# Bumps the VERSION file and creates a commit.
# When this commit is merged to main, CD auto-deploys.
#
# Usage:
#   ./scripts/prepare-release.sh patch    # Bug fixes (1.0.5 → 1.0.6)
#   ./scripts/prepare-release.sh minor    # New features (1.0.5 → 1.1.0)
#   ./scripts/prepare-release.sh major    # Breaking changes (1.0.5 → 2.0.0)
#   ./scripts/prepare-release.sh current  # Show current version
#
# Workflow:
#   1. Create feature/fix branch
#   2. Make changes
#   3. Run this script to bump version
#   4. Push and create PR
#   5. Merge PR → CD auto-deploys

set -e

VERSION_FILE="VERSION"

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

# Function to get current version
get_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        cat "$VERSION_FILE" | tr -d ' \t\n\r'
    else
        print_error "VERSION file not found"
        exit 1
    fi
}

# Function to validate version format
validate_version() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0)"
        exit 1
    fi
}

# Function to bump version
bump_version() {
    local bump_type=$1
    local current_version=$(get_current_version)
    local major minor patch
    
    IFS='.' read -r major minor patch <<< "$current_version"
    
    case $bump_type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            print_error "Invalid bump type. Use: major, minor, or patch"
            exit 1
            ;;
    esac
    
    local new_version="$major.$minor.$patch"
    echo "$new_version" > "$VERSION_FILE"
    print_success "Version bumped from $current_version to $new_version"
}

# Function to prepare release
prepare_release() {
    local bump_type=$1
    if [ -z "$bump_type" ]; then
        print_error "Release type required. Use: patch, minor, or major"
        exit 1
    fi

    print_info "Preparing '$bump_type' release..."

    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        print_error "Working directory is not clean. Please commit or stash changes first."
        exit 1
    fi
    
    # Check if we're on a release branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ ! "$current_branch" =~ ^release/ ]]; then
        print_warning "You're not on a release branch (current: $current_branch)"
        print_info "Consider creating a release branch: git checkout -b release/vX.Y.Z"
    fi
    
    # Bump version
    local current_version=$(get_current_version)
    bump_version "$bump_type"
    local new_version=$(get_current_version)
    
    # Commit version changes
    git add "$VERSION_FILE"
    git commit -m "chore(release): Prepare for v$new_version" -m "Bumps version from $current_version to $new_version."
    
    print_success "Release preparation complete for v$new_version"
    print_info "Next steps:"
    print_info "1. Push this branch: git push -u origin $current_branch"
    print_info "2. Create PR to main"
    print_info "3. Merge PR → CD will auto-deploy"
}

# Main script logic
case $1 in
    patch|minor|major)
        prepare_release "$1"
        ;;
    current)
        print_info "Current version: $(get_current_version)"
        ;;
    *)
        echo "Usage: $0 {patch|minor|major|current}"
        echo ""
        echo "Commands:"
        echo "  patch    Bump patch version (1.0.0 → 1.0.1) - Bug fixes"
        echo "  minor    Bump minor version (1.0.1 → 1.1.0) - New features"
        echo "  major    Bump major version (1.1.0 → 2.0.0) - Breaking changes"
        echo "  current  Show current version"
        echo ""
        echo "Workflow:"
        echo "  1. Make your changes on a feature branch"
        echo "  2. Run: $0 patch (or minor/major)"
        echo "  3. Push and create PR to main"
        echo "  4. Merge PR → CD auto-deploys"
        ;;
esac
