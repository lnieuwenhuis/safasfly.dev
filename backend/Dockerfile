# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data && chown -R hono:nodejs /app

USER hono

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/portfolio.db

EXPOSE 3001

CMD ["node", "dist/server.js"]
