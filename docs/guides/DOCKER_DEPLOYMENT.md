# 🐳 AutoDJ-Extreme Docker Deployment Guide

## Complete Guide to Deploying AutoDJ-Extreme v2.0 with Docker

This guide provides comprehensive instructions for deploying the Extreme Edition using Docker, with full configuration management, volume handling, and best practices.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
4. [Configuration Management](#configuration-management)
5. [Volume Mounting](#volume-mounting)
6. [Networking](#networking)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Deployments](#advanced-deployments)

---

## Prerequisites

### System Requirements

- **Docker**: Version 20.10+
- **Docker Compose**: Version 1.29+ (optional but recommended)
- **Disk Space**: 
  - Minimum 500MB for container image
  - Additional space for music files (varies)
  - Logs: ~100MB per week
- **Bandwidth**: Varies by stream count and bitrate
  - At 128kbps: ~1 Mbps per 8 listeners
  - Plan accordingly for peak load

### Knowledge Requirements

- Basic Docker CLI knowledge (recommended)
- Understanding of environment variables
- File permission basics (chmod, chown)

### Supported Docker Environments

- ✅ Docker Desktop (Windows, Mac)
- ✅ Docker CE/Engine (Linux)
- ✅ Docker Swarm
- ✅ Kubernetes (see advanced section)
- ✅ Cloud services (AWS ECS, GCP Cloud Run, Azure Container Instances, etc.)

---

## Quick Start (5 minutes)

### Using Docker Compose (Recommended)

**Step 1: Create project directory**

```bash
mkdir autodj-extreme
cd autodj-extreme
```

**Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    container_name: autodj-extreme
    
    # Ports: Icecast (8000) and Web UI (8080)
    ports:
      - "8000:8000"    # Icecast streaming
      - "8080:8080"    # Web UI
    
    # Mount volumes for persistent data
    volumes:
      - ./music:/home/container/music        # Music files
      - ./logs:/home/container/log           # Log files
      - ./configs:/mnt/configs               # Config backups
    
    # Load environment variables
    env_file: .env
    
    # Restart policy
    restart: unless-stopped
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/status.xsl"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Step 3: Create .env file**

```bash
cp .env.example .env
nano .env  # Edit with your settings
```

```bash
# Example .env
ADMIN_USER=admin
ADMIN_PASSWORD=YourSecurePass123!
SOURCE_PASSWORD=SourcePass456!
ICECAST_PORT=8000
AUTODJ_PUBLIC=1
STATION_NAME=My Radio
ADMIN_EMAIL=admin@example.com
```

**Step 4: Create music directory**

```bash
mkdir -p music logs configs
# Copy music files into ./music/
cp /path/to/music/*.mp3 music/
```

**Step 5: Start the service**

```bash
docker-compose up -d
```

**Step 6: Verify**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f autodj

# Test stream
curl http://localhost:8000/status.xsl
```

**Access the station:**

- Web UI: http://localhost:8080
- Stream: http://localhost:8000/autodj.mp3
- Icecast Admin: http://localhost:8000/admin/

---

## Detailed Setup

### Using Docker CLI

If not using Docker Compose:

```bash
# Create directories
mkdir -p autodj-data/music autodj-data/logs autodj-data/configs

# Create .env file
cp .env.example autodj-data/.env
nano autodj-data/.env
```

**Run container:**

```bash
docker run -d \
  --name autodj-extreme \
  --restart unless-stopped \
  -p 8000:8000 \
  -p 8080:8080 \
  --env-file ./autodj-data/.env \
  -v ./autodj-data/music:/home/container/music \
  -v ./autodj-data/logs:/home/container/log \
  -v ./autodj-data/configs:/mnt/configs \
  zeropointbruh/autodj-extreme:latest
```

**View logs:**

```bash
docker logs -f autodj-extreme
```

**Stop container:**

```bash
docker stop autodj-extreme
docker rm autodj-extreme
```

---

## Configuration Management

### Using Environment Variables

**Method 1: Via .env file (Recommended)**

```bash
# .env
ADMIN_PASSWORD=SecureAdminPass123!
SOURCE_PASSWORD=SecureSourcePass456!
STATION_NAME=My Radio Station
ADMIN_EMAIL=admin@example.com
```

Load with:
```yaml
services:
  autodj:
    env_file: .env
```

Or with CLI:
```bash
docker run --env-file .env ...
```

**Method 2: Individual environment variables**

```yaml
services:
  autodj:
    environment:
      ADMIN_PASSWORD: SecureAdminPass123!
      SOURCE_PASSWORD: SecureSourcePass456!
      STATION_NAME: My Radio Station
      ADMIN_EMAIL: admin@example.com
```

Or with CLI:
```bash
docker run \
  -e ADMIN_PASSWORD=SecureAdminPass123! \
  -e SOURCE_PASSWORD=SecureSourcePass456! \
  ...
```

### Regenerating Configurations

Inside container:

```bash
# Execute configuration generator
docker exec autodj-extreme /mnt/scripts/generate-configs.sh

# Or if using compose:
docker-compose exec autodj /mnt/scripts/generate-configs.sh
```

To regenerate and restart:

```bash
docker exec autodj-extreme /mnt/scripts/generate-configs.sh && \
docker restart autodj-extreme
```

### Viewing Current Configuration

```bash
# View icecast configuration
docker exec autodj-extreme cat /mnt/server/icecast.xml

# View Liquidsoap configuration
docker exec autodj-extreme cat /mnt/server/radio.liq

# View environment variables used
docker exec autodj-extreme env | grep -E "^(ADMIN|SOURCE|ICECAST|MP3|LOG|STATION)"
```

---

## Volume Mounting

### Directory Structure

```
autodj-extreme/
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables (PRIVATE!)
├── .env.example               # Template (public)
├── music/                     # Music files
│   ├── track1.mp3
│   ├── track2.mp3
│   └── ...
├── logs/                      # Log files (created by container)
│   ├── access.log
│   ├── error.log
│   └── autodj.log
├── configs/                   # Config backups
│   ├── icecast.xml
│   ├── radio.liq
│   ├── ezstream.v0.xml
│   └── ezstream.v1.xml
└── ads/                       # Ad files (optional)
    └── ad.mp3
```

### Volume Mount Points

| Host Path | Container Path | Purpose | Required |
|-----------|-----------------|---------|----------|
| `./music` | `/home/container/music` | Music library | Yes |
| `./logs` | `/home/container/log` | Log files | Yes |
| `./configs` | `/mnt/configs` | Config storage | Recommended |
| `./ads` | `/home/container/ads` | Ad files | Optional |

### Example: Extended Volume Configuration

```yaml
version: '3.8'

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    
    volumes:
      # Music library (read-only is safer)
      - ./music:/home/container/music:ro
      
      # Logs (writable)
      - ./logs:/home/container/log
      
      # Playlists
      - ./playlists:/home/container/playlists
      
      # Ads and jingles
      - ./ads:/home/container/ads:ro
      - ./jingles:/home/container/jingles:ro
      
      # Config backups
      - ./configs:/mnt/configs
```

### Backup Strategy

**Daily backup script:**

```bash
#!/bin/bash
# backup-autodj.sh

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup configs
docker exec autodj-extreme tar czf /tmp/configs.tar.gz /mnt/configs
docker cp autodj-extreme:/tmp/configs.tar.gz "$BACKUP_DIR/"

# Backup logs (optional, large files)
# docker cp autodj-extreme:/home/container/log "$BACKUP_DIR/logs"

# Backup .env (CRITICAL!)
cp .env "$BACKUP_DIR/.env"

echo "✓ Backup created: $BACKUP_DIR"

# Keep only last 7 days
find ./backups -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
```

Run as cron job:

```bash
# Backup daily at 2 AM
0 2 * * * cd /path/to/autodj-extreme && ./backup-autodj.sh
```

---

## Networking

### Exposing Ports

**Local access only:**

```yaml
# Only access from localhost
ports:
  - "127.0.0.1:8000:8000"  # Icecast
  - "127.0.0.1:8080:8080"  # Web UI
```

**Network access:**

```yaml
# Access from entire network
ports:
  - "8000:8000"  # All interfaces
  - "8080:8080"
```

**Custom ports:**

```yaml
# Use different external ports
ports:
  - "3000:8000"    # External 3000 → Internal 8000
  - "8090:8080"    # External 8090 → Internal 8080
```

### Using Reverse Proxy

**Nginx configuration (outside Docker):**

```nginx
upstream autodj {
    server localhost:8000;
}

server {
    listen 80;
    server_name radio.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name radio.example.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # Icecast streaming
    location /autodj.mp3 {
        proxy_pass http://autodj;
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Web UI
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Docker Compose with reverse proxy:**

```yaml
version: '3.8'

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    # Don't expose ports directly
    # Only internal network communication
    networks:
      - proxy-network
    env_file: .env
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    networks:
      - proxy-network
    restart: unless-stopped

networks:
  proxy-network:
    driver: bridge
```

### Docker Network Communication

Multiple containers example:

```yaml
version: '3.8'

networks:
  autodj-net:
    driver: bridge

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    container_name: autodj
    networks:
      - autodj-net
    env_file: .env
    restart: unless-stopped

  # Optional: Monitoring service
  prometheus:
    image: prom/prometheus:latest
    networks:
      - autodj-net
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    # Access Icecast at: http://autodj:8000 (internal network)
```

---

## Monitoring & Maintenance

### Health Monitoring

**Docker Compose:**

```yaml
services:
  autodj:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/status.xsl"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Check container health:**

```bash
# View status
docker ps --format "{{.Names}}\t{{.Status}}"

# View health details
docker inspect autodj-extreme --format='{{json .State.Health}}' | jq
```

### Log Monitoring

**View real-time logs:**

```bash
# With Compose
docker-compose logs -f

# With CLI
docker logs -f autodj-extreme

# Last 100 lines
docker logs --tail 100 autodj-extreme

# With timestamps
docker logs -f --timestamps autodj-extreme
```

**Log rotation setup:**

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "com.example.vendor=Acme,com.example.license=GPL"
  }
}
```

In `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "10"
  }
}
```

### Updating the Container

**Pull latest image:**

```bash
docker pull zeropointbruh/autodj-extreme:latest
```

**Restart with new image:**

```bash
# With Compose
docker-compose down
docker-compose pull
docker-compose up -d

# With CLI
docker stop autodj-extreme
docker rm autodj-extreme
docker run -d ... zeropointbruh/autodj-extreme:latest
```

### Backup & Restore

**Backup container data:**

```bash
docker exec autodj-extreme tar czf - /home/container | gzip > autodj-backup.tar.gz
```

**Restore from backup:**

```bash
docker exec -i autodj-extreme tar xzf - < autodj-backup.tar.gz
```

---

## Troubleshooting

### Container won't start

**Check logs:**

```bash
docker logs autodj-extreme
```

**Common issues:**

| Error | Solution |
|-------|----------|
| `Port already in use` | Change port in compose file or kill process |
| `Permission denied` | Fix directory permissions: `chmod -R 755 music logs` |
| `Environment variable not found` | Verify `.env` file exists and is loaded |
| `Out of memory` | Increase Docker memory limit |

### No sound / Stream not playing

```bash
# 1. Check if stream is accessible
curl -I http://localhost:8000/autodj.mp3

# 2. Check if Icecast is running
docker exec autodj-extreme ps aux | grep icecast

# 3. Check Liquidsoap status
docker exec autodj-extreme ps aux | grep liquidsoap

# 4. View logs
docker exec autodj-extreme tail -50 /home/container/log/icecast.log
docker exec autodj-extreme tail -50 /home/container/log/liquidsoap.log
```

### Can't access web UI

```bash
# Verify port mapping
docker port autodj-extreme

# Test connectivity
curl -I http://localhost:8080

# Check if web server is running
docker exec autodj-extreme curl -I http://localhost:8080
```

### Music not loading

```bash
# Check music directory
docker exec autodj-extreme ls -la /home/container/music

# Check permissions
docker exec autodj-extreme stat /home/container/music

# Verify file formats
docker exec autodj-extreme file /home/container/music/*

# Check playlist generation
docker exec autodj-extreme cat /home/container/playlist.m3u
```

---

## Advanced Deployments

### Kubernetes Deployment

**autodj-deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: autodj-extreme
  labels:
    app: autodj
spec:
  replicas: 1
  selector:
    matchLabels:
      app: autodj
  template:
    metadata:
      labels:
        app: autodj
    spec:
      containers:
      - name: autodj
        image: zeropointbruh/autodj-extreme:latest
        imagePullPolicy: Always
        
        ports:
        - containerPort: 8000
          name: icecast
        - containerPort: 8080
          name: webui
        
        envFrom:
        - configMapRef:
            name: autodj-config
        - secretRef:
            name: autodj-secrets
        
        volumeMounts:
        - name: music
          mountPath: /home/container/music
        - name: logs
          mountPath: /home/container/log
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        
        livenessProbe:
          exec:
            command:
            - curl
            - -f
            - http://localhost:8000/status.xsl
          initialDelaySeconds: 40
          periodSeconds: 30
      
      volumes:
      - name: music
        persistentVolumeClaim:
          claimName: autodj-music-pvc
      - name: logs
        persistentVolumeClaim:
          claimName: autodj-logs-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: autodj-service
spec:
  type: LoadBalancer
  selector:
    app: autodj
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
    name: icecast
  - protocol: TCP
    port: 8080
    targetPort: 8080
    name: webui
```

**Deploy:**

```bash
kubectl apply -f autodj-deployment.yaml
kubectl get pods
kubectl port-forward svc/autodj-service 8000:8000
```

### Docker Swarm

**Stack file:**

```yaml
version: '3.8'

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    ports:
      - target: 8000
        published: 8000
        protocol: tcp
      - target: 8080
        published: 8080
        protocol: tcp
    volumes:
      - music:/home/container/music
      - logs:/home/container/log
    env_file: .env

volumes:
  music:
  logs:
```

**Deploy to swarm:**

```bash
docker stack deploy -c docker-compose.yml autodj
docker stack services autodj
```

### Cloud Deployment

**AWS ECS:**

```json
{
  "family": "autodj-extreme",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "autodj",
      "image": "zeropointbruh/autodj-extreme:latest",
      "portMappings": [
        { "containerPort": 8000 },
        { "containerPort": 8080 }
      ],
      "environment": [
        { "name": "ADMIN_USER", "value": "admin" }
      ],
      "secrets": [
        {
          "name": "ADMIN_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

---

## Best Practices Checklist

- ✅ Use `.env` files for secrets (not in Dockerfile or compose)
- ✅ Implement health checks
- ✅ Use restart policies
- ✅ Mount volumes for persistence
- ✅ Set resource limits
- ✅ Monitor logs regularly
- ✅ Backup configurations daily
- ✅ Keep images updated
- ✅ Use reverse proxy for production
- ✅ Implement SSL/TLS encryption
- ✅ Restrict port access
- ✅ Use strong passwords
- ✅ Regular security updates
- ✅ Document your setup

---

## Support & Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Reference**: https://docs.docker.com/compose
- **AutoDJ-Extreme Issues**: https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues
- **Email**: wegj1@hotmail.com

---

**Last Updated:** March 12, 2026  
**Version:** 2.0 - Extreme Edition  
**Maintained by:** @zeropointbruh
