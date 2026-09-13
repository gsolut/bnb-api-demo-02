# Multi-stage Dockerfile for Frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies
COPY package.json ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and build
COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src/ ./src/
RUN pnpm run build

# Nginx production runner
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
