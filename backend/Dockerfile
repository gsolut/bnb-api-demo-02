# Multi-stage Dockerfile for Backend Proxy
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm run build

# Production runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
