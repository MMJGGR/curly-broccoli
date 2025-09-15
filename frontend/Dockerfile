FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies to avoid bundling Cypress/dev deps
ENV NODE_ENV=production
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app (CRA dev server with proxy support)
CMD ["npm", "start"]
