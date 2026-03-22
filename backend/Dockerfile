FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ─── Production image ───────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

RUN mkdir -p uploads logs && chown nestjs:nodejs uploads logs

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
