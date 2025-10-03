# syntax=docker/dockerfile:1

# -------- Base image --------
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app
ENV NODE_ENV=production \
    PORT=8080

# Enable Yarn 4 via Corepack and add common alpine compat
RUN corepack enable && apk add --no-cache libc6-compat

# -------- Dependencies layer (immutable) --------
# Copy only manifest files to maximize cache hits
COPY package.json yarn.lock .yarnrc.yml ./

# Install only production deps for runtime. If you have a TypeScript build step,
# switch to a two-stage build (see comments below) and install full deps in builder.
# Use correct Yarn v4 flag --mode=skip-build (not skip-builds). Keep a fallback
# for older yarn versions that may not support --mode.
RUN yarn install --immutable --mode=skip-build || yarn install --immutable

# -------- App source --------
# Copy the rest of the source files
COPY . .

# Create and use non-root user
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /usr/src/app
USER app

EXPOSE 8080

# Optional: basic healthcheck hitting your Express health route
# HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["yarn", "start"]

# ---------------- Optional TypeScript build (uncomment to use) ----------------
# If your Express app is written in TypeScript and needs `yarn build` to emit `dist/`,
# use the following two-stage build instead of the single-stage above:
#
# FROM base AS deps
# COPY package.json yarn.lock .yarnrc.yml ./
# RUN yarn install --immutable
#
# FROM deps AS builder
# COPY . .
# ENV NODE_ENV=production
# RUN yarn build
#
# FROM base AS runner
# COPY package.json yarn.lock .yarnrc.yml ./
# COPY .yarn/ .yarn/
# RUN yarn install --immutable --production --mode=skip-builds
# COPY --from=builder /usr/src/app/dist ./dist
# COPY --from=builder /usr/src/app/package.json ./package.json
# RUN addgroup -S app && adduser -S app -G app && chown -R app:app /usr/src/app
# USER app
# EXPOSE 8080
# CMD ["node", "dist/index.js"]
