# ── Stage 1: builder ──────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Pass NEXT_PUBLIC_API_URL as a build argument to bake it into Next.js client-side bundles
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Stage 2: runner ───────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
