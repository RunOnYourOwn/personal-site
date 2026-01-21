# Multi-stage build for Astro static site
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set production environment and site URL
ENV NODE_ENV=production
ARG SITE_URL=https://aaronbrazier.com
ENV SITE_URL=${SITE_URL}

# Build the site
RUN npm run build

# Production stage with Nginx
FROM nginx:1.27-alpine AS production

# Build arguments for metadata
ARG VERSION=dev
ARG BUILD_DATE
ARG VCS_REF

# OCI labels for image metadata
LABEL org.opencontainers.image.title="Personal Site" \
      org.opencontainers.image.description="Aaron Brazier's personal website built with Astro" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/RunOnYourOwn/personal-site" \
      org.opencontainers.image.url="https://aaronbrazier.com" \
      org.opencontainers.image.vendor="Aaron Brazier" \
      org.opencontainers.image.licenses="MIT"

# Install wget for health checks
RUN apk add --no-cache wget

# Copy custom nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set default environment variable for nginx template
ENV UMAMI_URL=https://umami.aaronbrazier.com

# Copy built site from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/healthz || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
