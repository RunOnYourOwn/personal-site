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

# Set Remark42 environment variables
ARG PUBLIC_REMARK42_HOST=https://comments.aaronbrazier.com
ARG PUBLIC_REMARK42_SITE_ID=aaronbrazier
ENV PUBLIC_REMARK42_HOST=${PUBLIC_REMARK42_HOST}
ENV PUBLIC_REMARK42_SITE_ID=${PUBLIC_REMARK42_SITE_ID}

# Build the site
RUN npm run build

# Production stage with Nginx
FROM nginx:1.27-alpine AS production

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
