# 🐳 Docker Compose Guide - AutoDJ-Extreme

Quick and easy deployment of AutoDJ-Extreme using Docker Compose.

## 📋 Quick Start

### 1. **Prerequisites**
- Docker Desktop installed (v29.2.1 or higher)
- Docker Compose (v5.0.2 or higher - included with Docker Desktop)
- 512MB available memory
- Port 8000 available

### 2. **Basic Setup**

```bash
# Clone the repository (if not already done)
git clone https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git
cd AutoDJ-Extreme

# Create required directories
mkdir -p music playlists ads jingles logs configs

# Add music files to the music directory
# (Supported: MP3, OGG, OPUS, FLAC, M4A, WAV, AAC, WMA, AIFF, APE, ALAC)
cp /path/to/your/music/*.mp3 music/

# Start the service
docker-compose up -d
```

### 3. **Verify It's Running**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f autodj

# Test the stream
curl http://localhost:8000/autodj
```

## 🔧 Configuration

### Using .env File

Create a `.env` file in your project root:

```bash
cp .env.docker .env
```

Edit the `.env` file to customize:

```env
STATION_NAME=My Radio Station
STATION_LOCATION=My City
SOURCE_PASSWORD=MySecurePassword123!
ADMIN_PASSWORD=MyAdminPassword456!
MP3_BITRATE=192
ENABLE_ADS=0
ENABLE_JINGLES=0
```

Then reload:

```bash
docker-compose down
docker-compose up -d
```

### Common Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STATION_NAME` | AutoDJ-Extreme | Your station name |
| `STATION_LOCATION` | Earth | Station location |
| `SOURCE_PASSWORD` | autodjpassword123 | Password for stream source |
| `ADMIN_PASSWORD` | adminpassword123 | Admin panel password |
| `ICECAST_PORT` | 8000 | Icecast server port |
| `MP3_BITRATE` | 192 | Stream bitrate (128-320) |
| `ENABLE_ADS` | 0 | Enable ad rotation (0=off, 1=on) |
| `ENABLE_JINGLES` | 0 | Enable jingle injection (0=off, 1=on) |
| `UPDATE_CONFIGS` | false | Clean configs on startup (true/false) |

See [ENVIRONMENT_CONFIG.md](../ENVIRONMENT_CONFIG.md) for all variables.

## 🚀 Common Commands

### Start Services

```bash
# Start in background
docker-compose up -d

# Start with logs displayed
docker-compose up

# Start with rebuild
docker-compose up -d --build
```

### Stop Services

```bash
# Stop gracefully
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

### View Logs

```bash
# Show recent logs
docker-compose logs -n 100

# Follow logs in real-time
docker-compose logs -f

# Show logs for specific service
docker-compose logs -f autodj

# Show only error logs
docker-compose logs autodj | grep ERROR
```

### Access Container

```bash
# Open shell inside container
docker-compose exec autodj bash

# Run a command inside container
docker-compose exec autodj ls -la /home/container/music
```

### Rebuild & Update

```bash
# Rebuild image with latest code
docker-compose build --no-cache

# Update and restart
docker-compose build --no-cache
docker-compose down
docker-compose up -d

# Smart update (preserves music/playlists)
UPDATE_CONFIGS=true docker-compose up -d --build
```

## 🎵 Managing Music Library

### Add Music Files

1. **While running:**
   ```bash
   # Copy files to your local music directory
   cp /path/to/music.mp3 ./music/
   
   # Restart to reload playlist
   docker-compose restart autodj
   ```

2. **Via container:**
   ```bash
   docker-compose exec autodj cp /source/music.mp3 /home/container/music/
   docker-compose exec autodj /home/container/run-enhanced.sh
   ```

### View Playlist

```bash
# See what's in the playlist
docker-compose exec autodj cat /home/container/playlist.m3u

# Count music files
docker-compose exec autodj find /home/container/music -type f | wc -l
```

### Backup Music

```bash
# Backup locally
docker cp autodj-extreme:/home/container/music ./music-backup

# Or use volumes directly
tar -czf music-backup.tar.gz ./music
```

## 🔒 Security Best Practices

### ⚠️ Change Default Passwords

**Before deploying to production:**

Edit your `.env` file:

```env
# ❌ DON'T use defaults in production!
SOURCE_PASSWORD=MyComplexPassword123!@#$
RELAY_PASSWORD=AnotherComplexPass456!@#$
ADMIN_PASSWORD=AdminSecurePass789!@#$
```

Requirements:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common words or dictionary terms

### Network Security

```bash
# Restrict port access (Linux/Mac)
sudo ufw allow from 192.168.1.0/24 to any port 8000

# Or in docker-compose.yml
ports:
  - "192.168.1.100:8000:8000"  # Only accessible from specific IP
```

### Environment File Security

```bash
# Prevent .env from being committed
echo ".env" >> .gitignore

# Set restrictive permissions
chmod 600 .env
```

## 📊 Monitoring

### Container Health

```bash
# Check health status
docker-compose ps

# Extended health info
docker inspect autodj-extreme --format='{{.State.Health.Status}}'

# Health check logs
docker-compose logs autodj | grep health
```

### Resource Usage

```bash
# Monitor CPU and memory
docker stats autodj-extreme

# Detailed stats
docker stats --no-stream autodj-extreme
```

### Stream Status

```bash
# Check Icecast status
curl http://localhost:8000/status-json.xsl | python -m json.tool

# Active listeners
curl -s http://localhost:8000/status-json.xsl | grep -o '"listeners"[^,}]*'
```

## 🔄 Smart Update Feature

The `UPDATE_CONFIGS` flag enables intelligent updates that:
- ✅ Remove old configuration files
- ✅ Clear old logs
- ✅ Clean cache
- ✅ **Preserve** all music files
- ✅ **Preserve** all playlists

### How to Use

```bash
# Option 1: Update via docker-compose
UPDATE_CONFIGS=true docker-compose up -d --build

# Option 2: Edit .env
UPDATE_CONFIGS=true

# Then restart
docker-compose down
docker-compose up -d

# Option 3: Individual startup
docker-compose exec autodj UPDATE_CONFIGS=true /home/container/run-enhanced.sh
```

## 🆘 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs autodj

# Verify image built successfully
docker images | grep autodj

# Rebuild from scratch
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Stream Not Playing

```bash
# Check if Icecast is running
curl http://localhost:8000/

# Verify mount point
curl http://localhost:8000/autodj

# Check error logs
docker-compose logs autodj | grep -i error
```

### No Music Playing

```bash
# Check if music files exist
docker-compose exec autodj ls -la /home/container/music

# Check playlist generation
docker-compose exec autodj cat /home/container/playlist.m3u

# Check Liquidsoap logs
docker-compose exec autodj cat /home/container/log/liquidsoap.log
```

### Port Already in Use

```bash
# Find what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                # Mac/Linux

# Use different port in docker-compose.yml
ports:
  - "8001:8000"  # External port 8001 -> Container port 8000
```

### High Memory Usage

```bash
# Check resource limits
docker-compose exec autodj ps aux

# Reduce bitrate
MP3_BITRATE=128 docker-compose up -d

# Lower max clients
ICECAST_MAX_CLIENTS=50 docker-compose up -d
```

## 📈 Performance Tuning

### For Low-Bandwidth Networks

```env
MP3_BITRATE=128
ICECAST_MAX_CLIENTS=50
ICECAST_BURST_SIZE=32768
```

### For High-Bandwidth Networks

```env
MP3_BITRATE=320
ICECAST_MAX_CLIENTS=500
ICECAST_BURST_SIZE=131072
```

### For Limited RAM

```yaml
# In docker-compose.yml
deploy:
  resources:
    limits:
      memory: 256M
    reservations:
      memory: 128M
```

## 🔗 Useful Links

- **[Icecast Documentation](https://icecast.org/docs/)**
- **[Liquidsoap Documentation](https://www.liquidsoap.info/)**
- **[Docker Compose Reference](https://docs.docker.com/compose/compose-file/)**
- **[Environment Config Reference](../ENVIRONMENT_CONFIG.md)**

## 📝 Example: Complete Production Setup

```bash
# 1. Clone and setup
git clone https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git
cd AutoDJ-Extreme

# 2. Create directories
mkdir -p music playlists ads jingles logs configs

# 3. Add music
cp /your/music/library/*.mp3 music/

# 4. Configure environment
cat > .env << EOF
STATION_NAME=Professional Radio
STATION_LOCATION=New York
SOURCE_PASSWORD=UltraSecurePass123!@#$%
ADMIN_PASSWORD=AdminSecurePass456!@#$%
ICECAST_MAX_CLIENTS=200
MP3_BITRATE=192
ENABLE_ADS=1
ENABLE_JINGLES=1
EOF

# 5. Start service
docker-compose up -d

# 6. Verify
docker-compose ps
docker-compose logs -f
curl http://localhost:8000/status-json.xsl
```

## 🎉 Getting Help

- **Issues**: https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues
- **Email**: wegj1@hotmail.com
- **Website**: https://banabyte.com

---

**Version:** 2.0  
**Last Updated:** March 12, 2026  
**Maintained by:** @zeropointbruh
