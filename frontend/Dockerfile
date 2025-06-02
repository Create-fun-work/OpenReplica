# OpenReplica Frontend Dockerfile
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S openreplica -u 1001

# Set ownership
RUN chown -R openreplica:nodejs /usr/share/nginx/html
RUN chown -R openreplica:nodejs /var/cache/nginx
RUN chown -R openreplica:nodejs /var/log/nginx
RUN chown -R openreplica:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R openreplica:nodejs /var/run/nginx.pid

USER openreplica

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
