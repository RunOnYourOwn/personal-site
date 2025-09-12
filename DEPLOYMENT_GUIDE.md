# Deployment Guide

## Overview

This guide covers deploying your personal site to production using Docker and GitHub Actions.

## Prerequisites

1. **GitHub Repository**: Code is hosted in `RunOnYourOwn/personal-site`
2. **GitHub Container Registry (GHCR)**: Images are published to `ghcr.io/runonyourown/personal-site`
3. **Portainer**: For container management
4. **SWAG**: For SSL termination and reverse proxy

## GitHub Actions Workflow

The CI/CD pipeline automatically:

1. **Tests**: Runs linting, type checking, and builds the site
2. **Builds**: Creates a Docker image with Nginx
3. **Tests Container**: Verifies the container works correctly
4. **Publishes**: Pushes to GHCR with tags:
   - `ghcr.io/runonyourown/personal-site:latest`
   - `ghcr.io/runonyourown/personal-site:sha-{commit-hash}`

## Local Testing

### Test Production Build Locally

```bash
# Test with localhost URLs
./test-local-simple.sh

# Test with domain URLs
./test-production-domain.sh
```

### Manual Docker Build

```bash
# Build for local testing
docker build -f Dockerfile.local -t personal-site:localhost .

# Build for production
docker build -f Dockerfile -t personal-site:production .
```

## Production Deployment

### 1. Portainer Setup

1. **Add GHCR Registry**:
   - Go to Portainer → Registries
   - Add new registry: `ghcr.io`
   - Username: `RunOnYourOwn`
   - Password: GitHub Personal Access Token (with `packages:read` permission)

2. **Create Stack**:

   ```yaml
   version: '3.8'
   services:
     personal-site:
       image: ghcr.io/runonyourown/personal-site:latest
       container_name: personal-site
       restart: unless-stopped
       networks:
         - proxy
       labels:
         - 'swag.enable=true'

   networks:
     proxy:
       external: true
   ```

### 2. SWAG Configuration

Add to `/config/nginx/site-confs/aaronbrazier.com.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name aaronbrazier.com;
    include /config/nginx/ssl.conf;

    location / {
        proxy_pass http://personal-site:80;
        include /config/nginx/proxy.conf;
    }
}

server {
    listen 443 ssl http2;
    server_name www.aaronbrazier.com;
    include /config/nginx/ssl.conf;
    return 301 https://aaronbrazier.com$request_uri;
}
```

### 3. GitHub Secrets

Add these secrets to your GitHub repository:

- `PORTAINER_WEBHOOK_URL`: Webhook URL from Portainer for automatic deployment

## Monitoring

### Health Checks

- **Container Health**: Built-in health check on `/healthz`
- **External Monitoring**: Use Uptime Kuma or similar to monitor `https://aaronbrazier.com/healthz`

### Logs

```bash
# View container logs
docker logs personal-site

# Follow logs
docker logs -f personal-site
```

## Troubleshooting

### Common Issues

1. **Container won't start**:
   - Check logs: `docker logs personal-site`
   - Verify image exists: `docker images | grep personal-site`

2. **404 errors**:
   - Check SWAG configuration
   - Verify container is running: `docker ps | grep personal-site`

3. **SSL issues**:
   - Check SWAG SSL configuration
   - Verify domain DNS settings

### Debug Commands

```bash
# Check container status
docker ps -a | grep personal-site

# Inspect container
docker inspect personal-site

# Test internal connectivity
docker exec personal-site curl -f http://localhost/healthz

# Check SWAG logs
docker logs swag
```

## Updates

The site automatically updates when you push to the `main` branch:

1. GitHub Actions builds and tests
2. New image is pushed to GHCR
3. Portainer webhook triggers redeployment
4. Site is live at `https://aaronbrazier.com`

## Backup

Since this is a static site with no database:

- **Code**: Backed up in GitHub repository
- **Content**: Stored in `src/content/` directory
- **Images**: Stored in `src/assets/` directory

No additional backup needed for the running site.
