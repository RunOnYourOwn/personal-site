#!/bin/bash

# Emergency Deploy Script for Personal Site
# ==========================================
# Triggers a deployment that SKIPS container tests and security scans.
# 
# !! USE WITH EXTREME CAUTION !!
#
# Use this ONLY when:
#   - Trivy is blocking on a false positive
#   - Trivy is blocking on an unfixable upstream CVE
#   - Container tests are flaky due to infrastructure issues
#   - You need to deploy a critical fix immediately
#
# DO NOT use this to:
#   - Skip tests because "it works on my machine"
#   - Avoid fixing legitimate security issues
#   - Speed up normal deployments
#
# Usage: ./scripts/emergency-deploy.sh
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

echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║                    ⚠️  WARNING ⚠️                            ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║  This will deploy WITHOUT running:                         ║${NC}"
echo -e "${RED}║    - Container health tests                                ║${NC}"
echo -e "${RED}║    - Trivy security scan                                   ║${NC}"
echo -e "${RED}║                                                            ║${NC}"
echo -e "${RED}║  Only use this for genuine emergencies!                    ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "Version to deploy: $VERSION"
echo ""

read -p "Are you sure you want to skip ALL tests? (type 'yes' to confirm): " CONFIRM
echo ""

if [ "$CONFIRM" != "yes" ]; then
    print_info "Cancelled (you must type 'yes' to confirm)"
    exit 0
fi

read -p "Reason for emergency deploy (required): " REASON
echo ""

if [ -z "$REASON" ]; then
    print_error "Reason is required for audit trail"
    exit 1
fi

print_info "Triggering emergency deploy..."
print_warning "Skipping tests: container health checks, Trivy security scan"

gh workflow run cd.yml \
    --ref main \
    -f force_deploy=true \
    -f skip_tests=true

print_success "Emergency deploy triggered!"
echo ""
print_info "Monitor progress at:"
echo "https://github.com/RunOnYourOwn/personal-site/actions/workflows/cd.yml"
echo ""
print_info "Or run: gh run watch"
echo ""
echo -e "${YELLOW}=== AUDIT RECORD ===${NC}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Version: $VERSION"
echo "Reason: $REASON"
echo "User: $(whoami)"
echo -e "${YELLOW}====================${NC}"
echo ""
print_warning "IMPORTANT: Run a full deploy (with tests) as soon as the emergency is resolved!"
