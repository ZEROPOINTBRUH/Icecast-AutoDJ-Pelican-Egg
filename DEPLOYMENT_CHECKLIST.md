# 📋 AutoDJ-Extreme Deployment Checklist

Complete checklist for deploying AutoDJ-Extreme in Docker.

## Pre-Deployment ✓

### System Requirements
- [ ] Docker Desktop v29.2.1 or higher installed
- [ ] Docker Compose v5.0+ available
- [ ] At least 512MB RAM free
- [ ] Port 8000 available (or alternative)
- [ ] 1GB disk space for base image
- [ ] Stable internet connection

### Preparation
- [ ] Repository cloned: `git clone https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git`
- [ ] Working directory: `cd AutoDJ-Extreme`
- [ ] Required directories created:
  ```bash
  mkdir -p music playlists ads jingles logs configs
  ```
- [ ] Music files added to `./music` directory (11+ formats supported)
- [ ] At least 1 audio file present for testing

## Configuration ✓

### Environment Setup
- [ ] `.env` file created (from `.env.docker` template)
- [ ] `STATION_NAME` customized
- [ ] `STATION_LOCATION` set
- [ ] Passwords changed from defaults:
  - [ ] `SOURCE_PASSWORD` (12+ chars, mixed case, numbers, symbols)
  - [ ] `RELAY_PASSWORD` (12+ chars, mixed case, numbers, symbols)
  - [ ] `ADMIN_PASSWORD` (12+ chars, mixed case, numbers, symbols)
- [ ] `ICECAST_PORT` set (default: 8000)
- [ ] `MP3_BITRATE` configured (default: 192)
- [ ] `ENABLE_ADS` set appropriately (default: 0)
- [ ] `ENABLE_JINGLES` set appropriately (default: 0)

### Optional Configuration
- [ ] `.gitignore` updated (includes `.env`)
- [ ] Resource limits adjusted in `docker-compose.yml` if needed
- [ ] Custom port configured if 8000 is unavailable
- [ ] Health check settings reviewed

## Docker Build ✓

### Image Build
```bash
# Option 1: Let docker-compose handle it
docker-compose up -d

# Option 2: Manual build
docker build -t autodj-extreme:latest -f docker/Dockerfile .
```

- [ ] Build completes without errors
- [ ] Image size reasonable (under 500MB)
- [ ] No security warnings in build output

### Pre-Flight Checks
- [ ] Verify Docker image exists: `docker images | grep autodj`
- [ ] Verify Docker Compose config valid: `docker-compose config`
- [ ] Port 8000 not in use: `netstat -ano | findstr :8000` (Windows)

## Deployment ✓

### Start Services

```bash
docker-compose up -d
```

- [ ] Command executes without errors
- [ ] No port conflicts reported
- [ ] Containers start successfully

### Verify Running

```bash
docker-compose ps
```

- [ ] Status shows "Up" for autodj container
- [ ] Health status shows "healthy" (after 40s wait period)
- [ ] All required ports mapped correctly

### Check Logs

```bash
docker-compose logs -f autodj
```

- [ ] No ERROR messages present
- [ ] Service initialization messages visible
- [ ] Music playlist generation logged
- [ ] Icecast and Liquidsoap both started
- [ ] No unexpected warnings

## Post-Deployment ✓

### Stream Verification

- [ ] **Stream accessible**: `curl http://localhost:8000/autodj`
- [ ] **Icecast Web Interface**: Access `http://localhost:8000` in browser
- [ ] **Admin Panel**: Access `http://localhost:8000/admin` (use credentials from `.env`)
- [ ] **Status Page**: Check `http://localhost:8000/status-json.xsl`

### Audio Test

- [ ] **Connect with player**: Use media player to open `http://localhost:8000/autodj`
- [ ] **Verify audio plays**: Music from your library should stream
- [ ] **Check metadata**: Title/artist info displayed correctly
- [ ] **Listen for 30 seconds**: Stream stable and continuous

### Container Health

```bash
docker inspect autodj-extreme --format='{{.State.Health.Status}}'
```

- [ ] Health status: "healthy"
- [ ] CPU usage reasonable (< 20%)
- [ ] Memory usage acceptable (< 256MB)
- [ ] Disk space not consumed excessively

### Monitoring Setup (Optional)

```bash
docker stats autodj-extreme
```

- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Monitor network I/O

## Security ✓

### Credentials
- [ ] All default passwords changed ✅
- [ ] `.env` file permissions restricted: `chmod 600 .env`
- [ ] `.env` in `.gitignore` (never commit)
- [ ] No credentials in version control

### Network
- [ ] Port access restricted if on public network
- [ ] Firewall rules configured (if applicable)
- [ ] Admin panel not publicly exposed (or behind auth)

### Backups
- [ ] Music library backed up
- [ ] Configuration backed up
- [ ] Backup procedure documented

## Operations ✓

### Daily Operations

**Monitor:**
- [ ] Service running: `docker-compose ps`
- [ ] Logs checked: `docker-compose logs`
- [ ] Resource usage: `docker stats`

**Manage:**
- [ ] Add music: Copy to `./music/` and restart
- [ ] View playlist: `docker-compose exec autodj cat /home/container/playlist.m3u`
- [ ] Check listeners: Access Icecast web interface

### Maintenance

**Weekly:**
- [ ] Disk space check: `df -h`
- [ ] Log rotation: `docker-compose logs --tail 1000`
- [ ] Performance review: `docker stats`

**Monthly:**
- [ ] Update check: `docker pull zeropointbruh/autodj-extreme`
- [ ] Configuration review
- [ ] Backup verification

## Update Procedure ✓

### Smart Update (Preserves Music)

```bash
# Method 1: Via environment variable
UPDATE_CONFIGS=true docker-compose up -d --build

# Method 2: Edit .env
UPDATE_CONFIGS=true
docker-compose down
docker-compose up -d --build
```

- [ ] Backup music directory (if critical)
- [ ] Run smart update command
- [ ] Verify music/playlists preserved
- [ ] Verify stream still working
- [ ] Check logs for any issues

### Full Reset (Clears Everything)

```bash
docker-compose down -v
rm -rf music playlists logs configs
docker-compose up -d
```

- [ ] All data removed as expected
- [ ] Fresh installation working
- [ ] Ready to add new content

## Troubleshooting ✓

### Common Issues

**Stream won't play:**
- [ ] Check container running: `docker-compose ps`
- [ ] Check logs: `docker-compose logs autodj`
- [ ] Verify URL: `http://localhost:8000/autodj`
- [ ] Check firewall rules

**No music:**
- [ ] Check music files exist: `docker-compose exec autodj ls /home/container/music`
- [ ] Check playlist generated: `docker-compose exec autodj cat /home/container/playlist.m3u`
- [ ] Verify file formats supported (MP3, OGG, FLAC, etc.)

**Port in use:**
- [ ] Find process: `netstat -ano | findstr :8000`
- [ ] Use different port: Edit `docker-compose.yml`
- [ ] Or stop conflicting service

**High resource usage:**
- [ ] Reduce bitrate: Set `MP3_BITRATE=128`
- [ ] Reduce clients: Set `ICECAST_MAX_CLIENTS=50`
- [ ] Restart service: `docker-compose restart`

## Documentation ✓

- [ ] All team members have access to:
  - [ ] `README.md` - Quick start
  - [ ] `DOCKER_COMPOSE_QUICK.md` - Quick reference
  - [ ] `DOCKER_COMPOSE_GUIDE.md` - Complete guide
  - [ ] `ENVIRONMENT_CONFIG.md` - Configuration reference
  - [ ] `DOCKER_UPDATES.md` - Update procedures
  
- [ ] Deployment log saved
- [ ] Emergency contact info documented
- [ ] Support contacts documented

## Go Live ✓

- [ ] All checks passed
- [ ] Team notified of go-live
- [ ] URL documented
- [ ] Stream link shared
- [ ] Support team trained
- [ ] Emergency procedure tested

---

## Rollback Plan (If Needed)

```bash
# Stop current deployment
docker-compose down

# Revert to previous version
git checkout HEAD~1

# Restore from backup
cp music-backup/* music/

# Restart
docker-compose up -d
```

- [ ] Previous version available
- [ ] Backup accessible
- [ ] Rollback tested

---

## Success Criteria

✅ All above items checked  
✅ Stream playing reliably  
✅ Metadata displaying correctly  
✅ No errors in logs  
✅ Resource usage acceptable  
✅ Team trained and ready  

**Deployment Status**: 🟢 **READY FOR PRODUCTION**

---

**Checklist Version:** 1.0  
**Last Updated:** March 12, 2026  
**Maintained by:** @zeropointbruh  
**Contact:** wegj1@hotmail.com
