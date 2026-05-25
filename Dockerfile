FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
COPY package.json package-lock.json ./
RUN npm --version && npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000
RUN npm cache clean --force && npm ci --no-audit --no-fund
RUN node -e "const pkg=require('./node_modules/next/package.json'); if (pkg.version !== '16.2.6') throw new Error(`Unexpected next version ${pkg.version}`)" && test -f node_modules/next/dist/bin/next
COPY . .
RUN npm exec -- next build
RUN npm prune --omit=dev && npm cache clean --force
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/proxy.ts ./proxy.ts
EXPOSE 3000
CMD ["npm", "exec", "--", "next", "start"]
