FROM node:20-alpine

WORKDIR /app

# Copy package files (use lockfile for reproducible installs)
COPY package*.json ./

# Production install with resilience and optional registry
ENV NODE_ENV=production \
    npm_config_loglevel=warn

# Allow overriding registry (useful behind proxies/mirrors)
ARG NPM_REGISTRY
RUN if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY"; fi \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fund false \
 && npm config set audit false \
 && if [ -f package-lock.json ]; then \
      npm ci --omit=dev --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app (CRA dev server with proxy support)
CMD ["npm", "start"]
