FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci 

# Copy application files (excluding what's in .dockerignore)
COPY . .

# Environment variables for non-sensitive configuration
ENV NODE_ENV=production
ENV PORT=5000
ENV API_BASE_URL=/api/v1

# Runtime port exposure
EXPOSE 5000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

# Run as non-root user for security
USER node

# Start the application
CMD ["npm", "run", "start"]
