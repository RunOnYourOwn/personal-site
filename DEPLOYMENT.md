# Deployment Guide

This guide explains how to deploy your personal website to your homelab using Docker, Portainer, and SWAG.

## Prerequisites

- Homelab server with Docker and Portainer
- SWAG container running for SSL termination
- GitHub Container Registry (GHCR) access
- Domain `aaronbrazier.com` pointing to your server

## Deployment Options

### Docker Compose (Recommended)

1. **Add to your app management repository:**
   - Copy `docker-compose.prod.yml` to your apps repository
   - Update the image reference to use GHCR
   - Deploy through your existing workflow

2. **Or deploy directly:**

   ```bash
   # Clone the repository
   git clone https://github.com/runonyourown/personal-site.git
   cd personal-site

   # Deploy with docker-compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

## SWAG Configuration

On your homelab server, create the following SWAG configuration:

**File:** `/config/nginx/site-confs/aaronbrazier.com.conf`

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

server {
    listen 80;
    server_name aaronbrazier.com www.aaronbrazier.com;

    return 301 https://aaronbrazier.com$request_uri;
}
```

## Local Development

### Using Docker

```bash
# Build and run development container
docker-compose --profile dev up -d personal-site-dev

# View logs
docker-compose logs -f personal-site-dev

# Stop development container
docker-compose down
```

### Using npm (Current Method)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Docker Commands

### Build and Test

```bash
# Build production image
docker build -t personal-site:latest .

# Test the build
docker run --rm -p 8080:80 personal-site:latest

# Check health
curl http://localhost:8080/healthz
```

### Local Production Test

```bash
# Run production container locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

## CI/CD Pipeline

The GitHub Actions workflow will:

1. **Build** the Astro site
2. **Push** Docker image to GHCR
3. **Trigger** deployment via webhook (if configured)

### Required Secrets

In your GitHub repository settings, add:

- `DEPLOY_WEBHOOK`: URL for deployment webhook (optional)
- `GITHUB_TOKEN`: Automatically provided by GitHub

## Monitoring

### Health Checks

- **Endpoint:** `/healthz`
- **Expected Response:** `ok`
- **Use with:** Uptime Kuma, monitoring tools

### Logs

```bash
# View container logs
docker logs personal-site

# Follow logs in real-time
docker logs -f personal-site
```

## Troubleshooting

### Container Won't Start

1. Check logs: `docker logs personal-site`
2. Verify image exists: `docker images | grep personal-site`
3. Check port conflicts: `netstat -tulpn | grep :80`

### SWAG Issues

1. Verify container name: `personal-site`
2. Check network connectivity: `docker network ls`
3. Test internal connection: `curl http://personal-site:80/healthz`

### SSL Issues

1. Check SWAG logs: `docker logs swag`
2. Verify domain DNS: `nslookup aaronbrazier.com`
3. Check certificate renewal: SWAG handles this automatically

## File Structure

```
personal-site/
├── Dockerfile                 # Production build
├── Dockerfile.dev            # Development build
├── docker-compose.yml        # Local development
├── docker-compose.prod.yml   # Production deployment
├── nginx.conf                # Nginx configuration
└── .dockerignore             # Docker ignore file
```

## Security Notes

- The nginx configuration includes security headers
- SWAG handles SSL termination
- Container runs as non-root user
- Health check endpoint for monitoring

## Performance

- Multi-stage Docker build for minimal image size
- Nginx with gzip compression
- Static asset caching (1 year)
- Optimized for production performance
