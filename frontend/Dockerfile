# Multi-stage build for better caching
FROM node:18-alpine AS base
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package.json package-lock.json* ./

# Development stage
FROM base AS development
# Install all dependencies (including dev dependencies for development)
RUN npm config set registry https://registry.npmmirror.com/ || npm config set registry https://registry.npmjs.org/
RUN npm config set fund false && npm config set audit false
RUN npm ci --silent --prefer-offline --no-optional || npm install --silent --prefer-offline --no-optional

# Copy configuration files
COPY tailwind.config.js postcss.config.js ./

# Copy source code (this layer will rebuild when code changes)
COPY public ./public
COPY src ./src

CMD ["npm", "start"]

# Production stage
FROM base AS production
# Install only production dependencies
RUN npm cache clean --force || true
RUN npm ci --only=production --silent || npm install --only=production --silent

# Copy configuration files
COPY tailwind.config.js postcss.config.js ./

# Copy source code
COPY public ./public
COPY src ./src

# Build the app
RUN npm run build

# Use nginx to serve the built app
FROM nginx:alpine AS runtime
COPY --from=production /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
