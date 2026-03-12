# 🐳 Docker Update & Cleanup Guide

## Overview

AutoDJ-Extreme now supports **clean updates while preserving your music library and playlists**.

When you need to:
- Update to a new version
- Fix configuration issues
- Refresh all system files
- Clean up corrupted configs

The container will:
- ✅ Remove old configuration files
- ✅ Remove old logs
- ✅ Remove ads/jingles cache
- ✅ **Preserve all music files**
- ✅ **Preserve all playlists**
- ✅ Regenerate fresh configs from `.env`

---

## 🔄 How to Update

### Docker Compose

```bash
# Option 1: Set environment variable in docker-compose.yml
docker-compose down

# Edit docker-compose.yml and add:
# environment:
#   - UPDATE_CONFIGS=true

docker-compose pull              # Get latest image
docker-compose up -d             # Restart with cleanup
```

Or use environment override:

```bash
docker-compose down
UPDATE_CONFIGS=true docker-compose up -d
```

### Docker CLI

```bash
# Stop and remove old container
docker stop autodj-extreme
docker rm autodj-extreme

# Pull latest image
docker pull zeropointbruh/autodj-extreme:latest

# Run with UPDATE_CONFIGS flag
docker run -d \
  --name autodj-extreme \
  --restart unless-stopped \
  -p 8000:8000 \
  -e UPDATE_CONFIGS=true \
  --env-file .env \
  -v ./music:/home/container/music \
  -v ./logs:/home/container/log \
  zeropointbruh/autodj-extreme:latest
```

### Systemd

```bash
# Set environment variable
UPDATE_CONFIGS=true sudo systemctl restart icecast2

# Or edit service file
sudo nano /etc/systemd/system/autodj.service
# Add: Environment="UPDATE_CONFIGS=true"
sudo systemctl daemon-reload
sudo systemctl restart autodj
```

---

## 📁 What Gets Preserved

### ✅ Preserved (SAFE TO UPDATE)

```
/home/container/music/              # All music files
/home/container/playlists/          # All playlist files
/home/container/.env                # Your configuration
```

### ❌ Removed on UPDATE (REGENERATED)

```
/home/container/icecast.xml         # Regenerated from .env
/home/container/radio.liq           # Regenerated from .env
/home/container/playlist.m3u        # Auto-generated on startup
/home/container/log/*               # Old logs removed
/home/container/ads/*               # Ads cache cleared
/home/container/jingles/*           # Jingles cache cleared
*.conf, *.xml, *.liq files         # Old configs removed
```

---

## 🚨 Safety Features

### Backup Before Update (Recommended)

```bash
# Create backup of music and playlists
tar czf backup-$(date +%Y%m%d).tar.gz music/ playlists/

# Or just music
tar czf music-backup-$(date +%Y%m%d).tar.gz music/
```

### Verify After Update

```bash
# Check music files
ls -la music/ | wc -l

# Check playlists
ls -la playlists/

# View logs
docker logs autodj-extreme | tail -50

# Test stream
curl http://localhost:8000/autodj.mp3 -I
```

---

## 📋 Update Process Step-by-Step

### Step 1: Stop Services

```bash
# Docker Compose
docker-compose down

# Or Docker CLI
docker stop autodj-extreme
```

### Step 2: Backup (Optional but Recommended)

```bash
tar czf backup-$(date +%Y%m%d_%H%M%S).tar.gz music/ playlists/
```

### Step 3: Pull Latest Image

```bash
docker pull zeropointbruh/autodj-extreme:latest
```

### Step 4: Start with Cleanup

```bash
# Docker Compose
UPDATE_CONFIGS=true docker-compose up -d

# Or Docker CLI
docker run -d \
  --name autodj-extreme \
  -e UPDATE_CONFIGS=true \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  -v ./music:/home/container/music \
  -v ./logs:/home/container/log \
  zeropointbruh/autodj-extreme:latest
```

### Step 5: Verify

```bash
# Check logs
docker logs -f autodj-extreme

# Verify music loaded
docker exec autodj-extreme ls -la /home/container/music | head -10

# Test stream
ffplay http://localhost:8000/autodj.mp3
```

---

## 🔧 Cleanup Script Details

### What Happens Internally

```bash
# 1. Backup music and playlists (in memory)
MUSIC_PRESERVE=($(find /home/container/music -type f))
PLAYLISTS_PRESERVE=($(find /home/container/playlists -type f))

# 2. Delete old files
find /home/container -maxdepth 1 -type f -delete
rm -rf /home/container/ads /home/container/jingles
rm -rf /home/container/log

# 3. Recreate fresh directories
mkdir -p /home/container/{music,playlists,ads,jingles,log}

# 4. Data already preserved (still on disk - never deleted)
# Music and playlists untouched!

# 5. Fix permissions
chown -R container:container /home/container
chmod -R 755 /home/container
```

### Manual Cleanup (Without Docker)

If you need to manually clean configs:

```bash
# Backup first!
tar czf backup.tar.gz music/ playlists/

# Remove only old config files
rm -f *.xml *.liq *.conf *.m3u

# Remove only old logs
rm -rf log/*

# Remove only cache
rm -rf ads/ jingles/

# Keep music and playlists untouched!
ls music/        # Should still have files
ls playlists/    # Should still have files
```

---

## 🎯 Common Scenarios

### Scenario 1: Regular Stable Update

```bash
# Just want latest version, keep everything as-is
docker-compose pull
docker-compose up -d
# No UPDATE_CONFIGS needed - configs preserved automatically
```

### Scenario 2: Fix Broken Configuration

```bash
# Something broke, want fresh configs but keep music
UPDATE_CONFIGS=true docker-compose up -d
# Old configs removed, new ones generated from .env
# Music preserved!
```

### Scenario 3: Major Version Upgrade

```bash
# Upgrading from v1 to v2, want fresh everything except music
docker-compose down
docker pull zeropointbruh/autodj-extreme:latest
UPDATE_CONFIGS=true docker-compose up -d
# Complete fresh install, music library intact
```

### Scenario 4: Start Fresh

```bash
# Delete EVERYTHING and start over (dangerous!)
docker-compose down -v  # Removes volumes!
docker-compose up -d    # Fresh start
# This WILL delete music - don't do this unless you want to!
```

---

## 🆘 Troubleshooting

### Music Files Gone After Update

**Cause:** Docker volumes not properly mounted  
**Solution:**
```bash
# Check volume mounting
docker inspect autodj-extreme | grep -A 5 Mounts

# Verify volume exists
docker volume ls | grep music

# Re-add music
cp your-music/*.mp3 music/
```

### Playlist Not Regenerating

**Cause:** Music files not detected  
**Solution:**
```bash
# Check music directory
docker exec autodj-extreme ls -la /home/container/music

# Manually regenerate playlist
docker exec autodj-extreme find /home/container/music -type f > /home/container/playlist.m3u

# Restart
docker restart autodj-extreme
```

### Config Update Not Running

**Cause:** UPDATE_CONFIGS not set correctly  
**Solution:**
```bash
# Verify environment variable
docker exec autodj-extreme env | grep UPDATE_CONFIGS

# Check logs for cleanup message
docker logs autodj-extreme | grep CLEANUP

# Re-run with explicit flag
docker-compose down
UPDATE_CONFIGS=1 docker-compose up -d
```

### Disk Space Issues

**Cause:** Old backups accumulating  
**Solution:**
```bash
# Clean old backups
rm backup-*.tar.gz

# Check disk usage
du -sh *

# Clean docker images
docker image prune -a
```

---

## 📊 Update Checklist

- [ ] Backup music and playlists: `tar czf backup.tar.gz music/ playlists/`
- [ ] Stop current container: `docker-compose down`
- [ ] Pull latest image: `docker pull zeropointbruh/autodj-extreme:latest`
- [ ] Start with cleanup: `UPDATE_CONFIGS=true docker-compose up -d`
- [ ] Check logs: `docker logs -f autodj-extreme`
- [ ] Verify music count: `ls music/ | wc -l`
- [ ] Test stream: `ffplay http://localhost:8000/autodj.mp3`
- [ ] Check admin panel: `http://localhost:8000/admin/`

---

## 🔐 Safety Notes

### ✅ Safe Operations

- Running with `UPDATE_CONFIGS=true` - Music always preserved
- Using Docker volumes for music directory
- Regular backups of music folder
- Testing in development before production

### ❌ Dangerous Operations

- Using `docker-compose down -v` - Deletes volumes!
- Manually deleting `/home/container/music/`
- Running as root without volume mounts
- Storing music in container (no persistent storage)

---

## 📞 Support

If something goes wrong:

1. **Check logs**: `docker logs autodj-extreme`
2. **Restore from backup**: `tar xzf backup.tar.gz`
3. **Report issue**: https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues
4. **Email**: wegj1@hotmail.com

---

**Last Updated:** March 12, 2026  
**Version:** 2.0 - Streamlined  
**Maintained by:** @zeropointbruh
