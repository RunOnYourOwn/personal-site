# Multi-stage build for Astro site with Node adapter
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ARG SITE_URL=https://aaronbrazier.com
ENV SITE_URL=${SITE_URL}

RUN npm run build

# Production stage
FROM node:20-alpine AS production

ARG VERSION=dev
ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.title="Personal Site" \
      org.opencontainers.image.description="Aaron Brazier's personal website built with Astro" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/RunOnYourOwn/personal-site" \
      org.opencontainers.image.url="https://aaronbrazier.com" \
      org.opencontainers.image.vendor="Aaron Brazier" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# wget for health checks; libcap lets the unprivileged node user keep binding :80
RUN apk add --no-cache wget libcap

# Copy built output and package files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install production dependencies only (skip husky prepare script)
RUN npm ci --omit=dev --ignore-scripts

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

# Run as the unprivileged `node` user (uid 1000, shipped in node:20-alpine).
# The deploy contract publishes :80, so keep that port: grant the node binary
# only CAP_NET_BIND_SERVICE instead of running as root.
RUN setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(command -v node)")" \
    && apk del libcap
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/healthz || exit 1

EXPOSE 80

CMD ["node", "./dist/server/entry.mjs"]
