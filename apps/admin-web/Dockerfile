# Base stage
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Copy package files from monorepo root
COPY package*.json ./
COPY turbo.json ./
COPY apps/admin-web/package.json ./apps/admin-web/

# Install dependencies
RUN npm ci --workspace=apps/admin-web

# Builder stage
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin-web/node_modules ./apps/admin-web/node_modules

# Copy source code
COPY apps/admin-web ./apps/admin-web

WORKDIR /app/apps/admin-web

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Build Next.js app
RUN npm run build

# Production stage
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-web/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-web/public ./public

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]
