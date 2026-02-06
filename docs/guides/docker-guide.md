# 🐳 Docker Guide

**Enhanced Icecast AutoDJ - Docker Configuration**  
Created by: @zeropointbruh (wegj1@hotmail.com)

---

## Overview

This guide covers building custom Docker images, understanding the Dockerfile, and working with containers.

---

## 📦 Dockerfile Explanation

Location: `docker/Dockerfile`

### Base Image
```dockerfile
FROM ubuntu:22.04
```
Uses Ubuntu 22.04 LTS for stability and compatibility.

### Dependencies Installed
- `icecast2` - Streaming server
- `ezstream` - Stream automation
- `madplay` - MP3 decoder
- `lame` - MP3 encoder
- `vorbis-tools` - OGG support
- `opus-tools` - OPUS support
- `ffmpeg` - Universal media processing

### Directory Structure
```dockerfile
RUN mkdir -p /home/container/music \
    /home/container/ads \
    /home/container/jingles \
    /home/container/playlists \
    /home/container/log
```

---

## 🔨 Building Custom Image

### Method 1: Manual Build

```bash
cd docker
docker build -t zeropointbruh/icecast-autodj:latest .
```

### Method 2: With GitHub Container Registry

```bash
docker build -t ghcr.io/zeropointbruh/icecast-autodj:latest .
docker push ghcr.io/zeropointbruh/icecast-autodj:latest
```

### Method 3: Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  radio:
    build: ./docker
    ports:
      - "8000:8000"
    volumes:
      - ./music:/home/container/music
      - ./log:/home/container/log
    environment:
      - ENABLE_ADS=true
      - ENABLE_JINGLES=true
```

---

## 🚀 Running Container

### Basic Run
```bash
docker run -d \
  --name radio \
  -p 8000:8000 \
  -v $(pwd)/music:/home/container/music \
  zeropointbruh/icecast-autodj:latest
```

### With All Features
```bash
docker run -d \
  --name radio \
  -p 8000:8000 \
  -v $(pwd)/music:/home/container/music \
  -v $(pwd)/ads:/home/container/ads \
  -v $(pwd)/jingles:/home/container/jingles \
  -v $(pwd)/log:/home/container/log \
  -e ENABLE_ADS=true \
  -e ENABLE_JINGLES=true \
  -e USE_MULTI_PLAYLIST=true \
  zeropointbruh/icecast-autodj:latest
```

---

## 📜 Run Scripts

### Basic Script (`run.sh`)
Simple startup script for basic functionality.

### Enhanced Script (`run-enhanced.sh`)
Advanced script with:
- Beautiful formatted output
- Comprehensive logging
- Process monitoring
- 11+ format support
- Intelligent playlist generation

**Use enhanced script for production!**

---

## 🛠️ Customization

### Modify Dockerfile

Add custom software:
```dockerfile
RUN apt-get update && apt-get install -y \
    your-package-here
```

### Custom Run Script

Replace `run-enhanced.sh` with your own:
```bash
#!/bin/bash
# Your custom logic here
```

---

## 📊 Container Management

### View Logs
```bash
docker logs radio
docker logs -f radio  # Follow mode
```

### Enter Container
```bash
docker exec -it radio bash
```

### Restart Container
```bash
docker restart radio
```

### Stop Container
```bash
docker stop radio
docker rm radio
```

---

## 🔍 Debugging

### Check Container Status
```bash
docker ps
docker inspect radio
```

### View Resource Usage
```bash
docker stats radio
```

### Access Logs Inside Container
```bash
docker exec radio cat /home/container/log/autodj.log
```

---

## 🌐 GitHub Container Registry Setup

### 1. Create Personal Access Token
GitHub Settings → Developer Settings → Personal Access Tokens

Permissions needed:
- `write:packages`
- `read:packages`

### 2. Login to GHCR
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u zeropointbruh --password-stdin
```

### 3. Build and Push
```bash
docker build -t ghcr.io/zeropointbruh/icecast-autodj:latest .
docker push ghcr.io/zeropointbruh/icecast-autodj:latest
```

### 4. Pull and Use
```bash
docker pull ghcr.io/zeropointbruh/icecast-autodj:latest
```

---

## 🔄 Updating Images

### Rebuild After Changes
```bash
docker build --no-cache -t zeropointbruh/icecast-autodj:latest .
```

### Update Running Container
```bash
docker pull zeropointbruh/icecast-autodj:latest
docker stop radio
docker rm radio
# Run with new image
```

---

## 📦 Volume Management

### Backup Volumes
```bash
docker run --rm \
  -v radio_music:/music \
  -v $(pwd)/backup:/backup \
  ubuntu tar czf /backup/music-backup.tar.gz /music
```

### Restore Volumes
```bash
docker run --rm \
  -v radio_music:/music \
  -v $(pwd)/backup:/backup \
  ubuntu tar xzf /backup/music-backup.tar.gz -C /
```

---

## 🎯 Best Practices

1. **Use volumes** for persistent data
2. **Tag versions** of your images
3. **Test locally** before pushing
4. **Document changes** in commit messages
5. **Clean up** unused images regularly

```bash
# Clean up
docker system prune -a
```

---

## 📞 Support

- 📧 Email: wegj1@hotmail.com
- 💬 Discord: @zeropointbruh
- 🌐 Website: https://banabyte.com
