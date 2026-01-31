# Base stage
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Copy package files from monorepo root
COPY package*.json ./
COPY turbo.json ./
COPY apps/user-web/package.json ./apps/user-web/

# Install dependencies
RUN npm ci --workspace=apps/user-web

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/user-web/node_modules ./apps/user-web/node_modules

# Copy source code
COPY apps/user-web ./apps/user-web

WORKDIR /app/apps/user-web

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Build Next.js app
RUN npm run build

# Production stage
FROM base AS production

WORKDIR /app/apps/user-web

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3002

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy dependencies for production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/user-web/node_modules ./node_modules

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-web/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-web/public ./public
COPY --from=builder /app/apps/user-web/package.json ./package.json
COPY --from=builder /app/apps/user-web/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3002

CMD ["npm", "start"]
