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
