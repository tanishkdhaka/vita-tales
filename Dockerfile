# syntax=docker/dockerfile:1

# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Install native compilation dependencies needed for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Next.js application
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile production standalone bundle with Next.js Turbopack
RUN npm run build

# Ensure standalone static assets are properly linked
RUN cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ 2>/dev/null || true

# Stage 3: Minimal production runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged application user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Ensure data directory has proper write permissions for SQLite database and WAL files
RUN chown -R nextjs:nodejs /app/data && chmod -R 775 /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
