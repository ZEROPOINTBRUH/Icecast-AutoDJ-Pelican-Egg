# 🚀 AutoDJ-Extreme Docker Compose - Quick Reference

## Get Started in 30 Seconds

```bash
# 1. Create directories
mkdir -p music playlists ads jingles logs configs

# 2. Add your music
cp /path/to/music/*.mp3 music/

# 3. Start
docker-compose up -d

# 4. Access stream at: http://localhost:8000/autodj
```

## Essential Commands

| Command | What It Does |
|---------|------------|
| `docker-compose up -d` | Start services in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View live logs |
| `docker-compose ps` | Show running containers |
| `docker-compose restart` | Restart services |
| `docker-compose build` | Rebuild Docker image |

## Environment Variables

Create `.env` file to customize:

```env
STATION_NAME=My Radio
STATION_LOCATION=My City
SOURCE_PASSWORD=MyPassword123!
ADMIN_PASSWORD=AdminPass456!
MP3_BITRATE=192
ENABLE_ADS=1
ENABLE_JINGLES=1
```

## Quick Test

```bash
# Check if running
docker-compose ps

# Test stream
curl http://localhost:8000/autodj

# View logs
docker-compose logs autodj
```

## Smart Update

```bash
# Update with music preserved
UPDATE_CONFIGS=true docker-compose up -d --build
```

## File Structure

```
AutoDJ-Extreme/
├── docker-compose.yml          # Main config
├── .env.docker                 # Template
├── docker/Dockerfile           # Image definition
├── music/                       # Your music files
├── playlists/                  # Generated playlists
├── logs/                        # Service logs
└── configs/                     # Generated configs
```

## Access Points

- **Stream**: http://localhost:8000/autodj
- **Icecast Web**: http://localhost:8000
- **Admin**: http://localhost:8000/admin (password required)
- **Status**: http://localhost:8000/status-json.xsl

## Common Issues

**Port 8000 already in use?**
```yaml
# Edit docker-compose.yml
ports:
  - "8001:8000"  # Use port 8001 instead
```

**No music playing?**
```bash
# Check music folder
docker-compose exec autodj ls /home/container/music

# Restart
docker-compose restart autodj
```

**High memory usage?**
```env
# Reduce in .env
MP3_BITRATE=128
ICECAST_MAX_CLIENTS=50
```

## More Help

- Full guide: `DOCKER_COMPOSE_GUIDE.md`
- Config reference: `ENVIRONMENT_CONFIG.md`
- All documentation: `docs/`

---

**Need help?** Email: wegj1@hotmail.com | Website: https://banabyte.com
