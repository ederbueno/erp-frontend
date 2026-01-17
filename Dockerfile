# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (including devDependencies)
RUN pnpm install --recursive

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (needed for runtime)
RUN pnpm install --recursive

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]