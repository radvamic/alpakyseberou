FROM node:22-slim AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Production ----
FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# ffmpeg převádí videa od hostů na verzi přehratelnou v prohlížeči (lib/media/worker.ts)
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy DB migrations for runtime
COPY --from=builder /app/db/migrations ./db/migrations

# Create data & upload dirs
RUN mkdir -p /app/data \
             /app/public/uploads/guestbook \
             /app/public/uploads/wedding-photos \
             /app/public/uploads/photobooth \
             /app/public/uploads/camera \
             /app/public/uploads/table-challenge \
             /app/public/uploads/quiz \
             /app/public/photobooth/couple

EXPOSE 3000
CMD ["node", "server.js"]
