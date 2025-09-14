#!/bin/bash

# Re-push latest tag script for Personal Site
# Usage: ./scripts/repush-tag.sh [tag_name]
# Run this to delete and re-create a tag, then push it to all remotes

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

# Function to validate tag exists locally
validate_tag() {
    local tag=$1
    if ! git tag -l | grep -q "^$tag$"; then
        print_error "Tag '$tag' does not exist locally"
        print_info "Available tags:"
        git tag -l | sort -V | tail -10
        exit 1
    fi
}

# Function to delete and re-create tag
repush_tag() {
    local tag_name=$1
    
    print_info "Re-creating tag '$tag_name'..."
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory is not clean, but continuing with tag operations..."
    fi
    
    # Step 1: Delete local tag
    print_info "1. Deleting local tag '$tag_name'..."
    if git tag -d "$tag_name" 2>/dev/null; then
        print_success "   ✓ Local tag deleted"
    else
        print_warning "   ! Local tag '$tag_name' not found (may have been deleted already)"
    fi
    
    # Step 2: Delete remote tag
    print_info "2. Deleting remote tag '$tag_name'..."
    local delete_success=true
    for remote in $(git remote); do
        print_info "   -> Deleting from '$remote'"
        if git push "$remote" ":refs/tags/$tag_name" 2>/dev/null; then
            print_success "     ✓ Successfully deleted from $remote"
        else
            print_warning "     ! Failed to delete from $remote (may not exist)"
        fi
    done
    
    # Step 3: Re-create tag
    print_info "3. Re-creating tag '$tag_name'..."
    if git tag -a "$tag_name" -m "Release $tag_name - Re-created tag"; then
        print_success "   ✓ Tag re-created locally"
    else
        print_error "   ✗ Failed to re-create tag"
        exit 1
    fi
    
    # Step 4: Push new tag
    print_info "4. Pushing new tag '$tag_name' to all remotes..."
    local push_success=true
    for remote in $(git remote); do
        print_info "   -> Pushing to '$remote'"
        if git push "$remote" "$tag_name" 2>/dev/null; then
            print_success "     ✓ Successfully pushed to $remote"
        else
            print_error "     ✗ Failed to push to $remote"
            push_success=false
        fi
    done
    
    if [ "$push_success" = true ]; then
        print_success "Tag '$tag_name' successfully re-created and pushed to all remotes"
        print_info "This will trigger the CD pipeline to build and deploy new images"
    else
        print_warning "Tag re-creation completed with some push failures"
        print_info "You may need to check remote permissions or network connectivity"
        exit 1
    fi
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
        validate_tag "$1"
        repush_tag "$1"
        ;;
esac 