# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm ci --workspace=apps/api

# Copy source code
COPY apps/api ./apps/api

# Set working directory to api folder
WORKDIR /app/apps/api

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "start:dev"]

# Production build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig*.json ./apps/api/

# Install all dependencies (including dev dependencies for building)
RUN npm ci --workspace=apps/api

# Copy source code
COPY apps/api ./apps/api

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app/apps/api

# Install only production dependencies
COPY package*.json /app/
COPY apps/api/package.json ./
RUN cd /app && npm ci --workspace=apps/api --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Ensure i18n resources are present in both dist/ and src/
RUN mkdir -p /app/apps/api/dist/i18n /app/apps/api/src/i18n
COPY --from=builder /app/apps/api/src/i18n /app/apps/api/src/i18n
COPY --from=builder /app/apps/api/src/i18n /app/apps/api/dist/i18n

# Copy necessary files
COPY apps/api/src/migrations ./src/migrations

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start command
CMD ["node", "dist/main.js"]

