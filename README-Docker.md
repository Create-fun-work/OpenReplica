# OpenReplica Unified Docker Runtime

This repository now includes a unified Docker image that contains both the frontend and backend components of OpenReplica in a single container.

## Docker Image

The unified Docker image is automatically built and published to GitHub Container Registry (ghcr.io) as `openreplica-runtime`.

### Image Details

- **Registry**: `ghcr.io/create-fun-work/openreplica-runtime`
- **Architecture**: Multi-platform (linux/amd64, linux/arm64)
- **Components**:
  - Python FastAPI backend (port 3000 internal)
  - React frontend served by nginx (port 3001 external)
  - Supervisor manages both processes

### Available Tags

- `latest` - Latest build from main branch
- `main` - Latest build from main branch
- `develop` - Latest build from develop branch
- `v*` - Semantic version tags
- `{branch}-{sha}` - Branch-specific builds with commit SHA

## Running the Image

### Quick Start

```bash
# Pull and run the latest image
docker run -p 3001:3001 ghcr.io/create-fun-work/openreplica-runtime:latest
```

### Production Deployment

```bash
# Run with volume mounts for persistence
docker run -d \
  --name openreplica \
  -p 3001:3001 \
  -v openreplica_data:/app/data \
  --restart unless-stopped \
  ghcr.io/create-fun-work/openreplica-runtime:latest
```

### With Docker Compose

```yaml
version: '3.8'
services:
  openreplica:
    image: ghcr.io/create-fun-work/openreplica-runtime:latest
    ports:
      - "3001:3001"
    volumes:
      - openreplica_data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  openreplica_data:
```

## Configuration

### Environment Variables

You can configure the application using environment variables:

```bash
docker run -p 3001:3001 \
  -e OPENREPLICA_ENV=production \
  -e BACKEND_HOST=0.0.0.0 \
  -e BACKEND_PORT=3000 \
  ghcr.io/create-fun-work/openreplica-runtime:latest
```

### Health Checks

The image includes health checks that verify both the frontend and backend are running:

- **Endpoint**: `http://localhost:3001/health`
- **Internal Backend Check**: `http://127.0.0.1:3000/health`

## Development

### Building Locally

```bash
# Build the unified image
docker build -t openreplica-runtime .

# Run locally built image
docker run -p 3001:3001 openreplica-runtime
```

### Multi-stage Build Process

1. **Frontend Build Stage**: Builds React app using Node.js
2. **Production Stage**: Sets up Python backend with nginx serving frontend
3. **Supervisor**: Manages both nginx and FastAPI processes

## Accessing the Application

Once running, access the application at:

- **Web Interface**: http://localhost:3001
- **API Endpoints**: http://localhost:3001/api/*
- **WebSocket**: ws://localhost:3001/ws/*

The nginx reverse proxy automatically routes:
- `/api/*` → Backend FastAPI server
- `/ws/*` → Backend WebSocket endpoints  
- `/*` → Frontend React application

## GitHub Actions

The image is automatically built and pushed to ghcr.io on:

- **Push to main/develop**: Creates `latest`, `main`, or `develop` tags
- **Pull requests**: Creates PR-specific tags
- **Git tags**: Creates semantic version tags (v1.0.0, etc.)

### Required Permissions

The GitHub Actions workflow requires:
- `contents: read` - To checkout repository
- `packages: write` - To push to GitHub Container Registry

## Logs

Container logs include both nginx and backend output:

```bash
# View logs
docker logs openreplica

# Follow logs
docker logs -f openreplica
```

Internal log files (accessible via shell):
- `/var/log/backend.out.log` - Backend stdout
- `/var/log/backend.err.log` - Backend stderr  
- `/var/log/nginx.out.log` - Nginx stdout
- `/var/log/nginx.err.log` - Nginx stderr

## Security

- Runs as non-root user (`openreplica`)
- Includes security headers in nginx configuration
- Multi-platform builds for better compatibility
- Artifact attestation for supply chain security
