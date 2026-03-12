# 🎵 AutoDJ-Extreme Configuration System

## Overview

AutoDJ-Extreme Extreme Edition - A clean, minimal Icecast streaming server with automatic playlist rotation via Liquidsoap. Default Icecast web interface only, no custom website.

## ⚡ Quick Start

### 1. Create Configuration

```bash
cp .env.example .env
nano .env  # Linux/Mac or notepad .env # Windows
```

### 2. Generate Configs

```bash
chmod +x scripts/generate-configs.sh
./scripts/generate-configs.sh
```

### 3. Add Music

```bash
mkdir music
cp /path/to/your/music/*.mp3 music/
```

### 4. Start

```bash
# Docker Compose
docker-compose up -d

# Or systemd
sudo systemctl restart icecast2
```

### 5. Stream

```bash
# Stream URL
http://localhost:8000/autodj.mp3

# Status
http://localhost:8000/status.xsl

# Admin
http://localhost:8000/admin/
```

---

## 📋 Configuration Files

| File | Purpose |
|------|---------|
| `configs/icecast.xml` | Icecast server configuration |
| `configs/radio.liq` | Liquidsoap audio engine |
| `.env` | Environment variables (private) |
| `.env.example` | Configuration template |
| `.env.defaults` | Default values |

---

## 🔐 Environment Variables

### Security

```bash
ADMIN_USER=admin
ADMIN_PASSWORD=SecurePass123!           # Min 12 chars
SOURCE_PASSWORD=SourcePass456!          # For Liquidsoap
RELAY_PASSWORD=RelayPass789!            # For relay servers
AUTODJ_PASSWORD=AutoPass012!            # Mount point password
```

### Network

```bash
ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_MAX_CLIENTS=1000
```

### Stream Access

```bash
AUTODJ_PUBLIC=1                         # 1=public, 0=private
```

### Audio

```bash
MP3_BITRATE=128                         # 96, 128, 192, 256 kbps
MUSIC_DIR=/home/container/music
LOG_DIR=/home/container/log
```

---

## 🐳 Docker

### Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    container_name: autodj-extreme
    ports:
      - "8000:8000"
    volumes:
      - ./music:/home/container/music
      - ./logs:/home/container/log
    env_file: .env
    restart: unless-stopped
```

**Start:**

```bash
docker-compose up -d
```

### Docker CLI

```bash
docker run -d \
  --name autodj \
  -p 8000:8000 \
  --env-file .env \
  -v ./music:/home/container/music \
  -v ./logs:/home/container/log \
  zeropointbruh/autodj-extreme:latest
```

### Systemd (Linux)

**`/etc/systemd/system/autodj.service`:**

```ini
[Unit]
Description=AutoDJ Extreme Radio Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/autodj
ExecStart=/home/autodj/configs/run-enhanced.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Start:**

```bash
sudo systemctl enable autodj
sudo systemctl start autodj
```

---

## 🎵 Adding Music

### Directory

```
music/
├── song1.mp3
├── song2.ogg
├── song3.flac
└── ...
```

### Supported Formats

MP3, OGG, OPUS, FLAC, WAV, M4A, AAC, and more

### Playlist

Auto-generated on startup from `MUSIC_DIR`:

```bash
cat /home/container/playlist.m3u
```

---

## 📊 Monitoring

### Stream Status

```bash
curl http://localhost:8000/status.xsl
curl http://localhost:8000/admin/stats.json
```

### Logs

```bash
# Docker
docker logs -f autodj-extreme

# Systemd
journalctl -u autodj -f

# Direct
tail -f /home/container/log/icecast.log
```

### Test Stream

```bash
ffplay http://localhost:8000/autodj.mp3
```

---

## 🔄 Update Configuration

1. Edit `.env`:
   ```bash
   nano .env
   ```

2. Regenerate:
   ```bash
   ./scripts/generate-configs.sh
   ```

3. Restart:
   ```bash
   docker restart autodj-extreme
   # OR
   systemctl restart icecast2
   ```

---

## 🔒 Security

### Change Passwords

```bash
ADMIN_PASSWORD=YourSecure16Char123!
SOURCE_PASSWORD=YourSecure16Char456!
```

### Protect .env

```bash
chmod 600 .env
echo ".env" >> .gitignore
```

### Use HTTPS (Production)

Use nginx reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name radio.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

---

## 🐛 Troubleshooting

### Stream not working

```bash
# Check service
docker ps | grep autodj
systemctl status icecast2

# Check logs
docker logs autodj-extreme
tail -f /home/container/log/icecast.log

# Check music
ls -la /home/container/music/
cat /home/container/playlist.m3u
```

### Port in use

```bash
# Change port in .env
ICECAST_PORT=8001

# Regenerate
./scripts/generate-configs.sh
docker restart autodj-extreme
```

### No audio playing

```bash
# Verify playlist exists
ls -la /home/container/playlist.m3u

# Regenerate configs
./scripts/generate-configs.sh

# Check Liquidsoap
docker logs autodj-extreme | grep liquidsoap
```

---

## 📚 Resources

- **[ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md)** - Complete variable reference
- **[Icecast Documentation](https://icecast.org/docs/)** - Official Icecast docs
- **[Liquidsoap Documentation](https://www.liquidsoap.info/)** - Liquidsoap guide

---

## 🆘 Support

- **GitHub**: https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme
- **Email**: wegj1@hotmail.com
- **Website**: https://banabyte.com

---

**Version:** 2.0 - Extreme Edition (Streamlined)  
**Last Updated:** March 12, 2026  
**Maintained by:** @zeropointbruh
