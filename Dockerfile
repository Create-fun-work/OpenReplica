# OpenReplica Unified Runtime Dockerfile
# This builds both frontend and backend into a single container

FROM node:20-alpine AS frontend-builder

# Build frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY frontend/ ./
RUN npm run build

# Python backend with nginx frontend serving
FROM python:3.12-slim

# Install system dependencies including nginx
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set up backend
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# Copy built frontend assets
COPY --from=frontend-builder /frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Create supervisor configuration for running both services
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Update nginx config to proxy to localhost instead of backend service
RUN sed -i 's/backend:3000/127.0.0.1:3000/g' /etc/nginx/nginx.conf

# Create directories for logs
RUN mkdir -p /var/log/supervisor
RUN touch /var/log/backend.err.log /var/log/backend.out.log
RUN touch /var/log/nginx.err.log /var/log/nginx.out.log

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash openreplica
RUN chown -R openreplica:openreplica /app
RUN chown -R openreplica:openreplica /usr/share/nginx/html
RUN chown -R openreplica:openreplica /var/log
RUN chown -R openreplica:openreplica /var/lib/nginx
RUN chown -R openreplica:openreplica /run

# Switch to non-root user
USER openreplica

# Expose port (nginx will serve on 3001, backend on 3000 internally)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start supervisor to manage both services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
