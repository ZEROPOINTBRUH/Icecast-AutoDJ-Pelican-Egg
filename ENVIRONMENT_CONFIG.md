# 🔐 AutoDJ-Extreme Environment Configuration Guide

## Overview

This document describes the centralized environment variable system for AutoDJ-Extreme Extreme Edition. All passwords, ports, and configurations should be managed through environment variables for security, consistency, and ease of deployment.

## Required Environment Variables

### 🔐 Security Credentials

```bash
# Admin panel credentials
ADMIN_USER=admin                          # Default username for admin panel
ADMIN_PASSWORD=adminpassword123          # CHANGE THIS IMMEDIATELY - min 12 characters

# Icecast source streaming password
SOURCE_PASSWORD=autodjpassword123        # CHANGE THIS - min 12 characters
RELAY_PASSWORD=relaypassword123          # CHANGE THIS - min 12 characters

# Stream mount passwords
AUTODJ_PASSWORD=autodjpassword123        # Password for /autodj mount point
LIVE_PASSWORD=livepassword123            # Password for /live mount point
STREAM_PASSWORD=streampassword123        # Password for /stream mount point
```

### 📡 Network Configuration

```bash
# Icecast Server
ICECAST_HOST=localhost                   # Icecast server hostname
ICECAST_PORT=8000                        # Icecast listening port
ICECAST_MAX_CLIENTS=1000                 # Max concurrent clients
ICECAST_BURST_SIZE=65535                 # Burst size for new connections

# Web Interface
WEB_HOST=0.0.0.0                         # Web server bind address
WEB_PORT=8080                            # Web server port
WEB_MOUNT=/                              # Mount point for web interface
```

### 🎵 Stream Configuration

```bash
# Stream Mount Points (public access settings)
AUTODJ_PUBLIC=1                          # 1=public (no auth), 0=private (requires password)
LIVE_PUBLIC=0                            # 1=public, 0=private
STREAM_PUBLIC=1                          # 1=public, 0=private

# Bitrate & Quality
MP3_BITRATE=128                          # MP3 bitrate in kbps (96, 128, 192, 256)
OGG_BITRATE=128                          # OGG bitrate in kbps
```

### 🎼 Content Configuration

```bash
# Directory Paths
MUSIC_DIR=/home/container/music          # Location of music files
PLAYLIST_DIR=/home/container/playlists   # Location of playlists
ADS_DIR=/home/container/ads              # Location of ad files
JINGLES_DIR=/home/container/jingles      # Location of jingle files
LOG_DIR=/home/container/log              # Location for logs

# Feature Flags
ENABLE_ADS=true                          # Enable ad rotation
AD_FREQUENCY=5                           # Play ad every N tracks
ENABLE_JINGLES=true                      # Enable jingle rotation
JINGLE_FREQUENCY=3                       # Play jingle every N tracks
ENABLE_LIQUIDSOAP=true                   # Use Liquidsoap (vs ezstream)
```

### 📊 Logging & Monitoring

```bash
# Logging
LOG_LEVEL=3                              # 0=critical, 1=error, 2=warn, 3=info, 4=debug
LOG_FILE=/home/container/log/autodj.log
ERROR_LOG=/home/container/log/autodj-error.log
ACCESS_LOG=/home/container/log/autodj-access.log

# Monitoring
MONITOR_INTERVAL=30                      # Process monitoring check interval (seconds)
HEALTH_CHECK_PORT=8001                   # Health check endpoint port
```

### 🌍 Metadata & Hosting

```bash
# Station Information
STATION_NAME=AutoDJ-Extreme              # Station name
STATION_DESCRIPTION=Professional Radio   # Station description
STATION_URL=https://banabyte.com         # Station website
STATION_GENRE=Various                    # Primary genre
STATION_LOCATION=Earth                   # Station location

# Admin Contact
ADMIN_EMAIL=admin@example.com             # Administrator email
ADMIN_PHONE=+1234567890                  # Administrator phone (optional)
```

## Variable Scope & Usage

### Used by Icecast
- `ICECAST_HOST`, `ICECAST_PORT`, `ICECAST_MAX_CLIENTS`, `ICECAST_BURST_SIZE`
- `SOURCE_PASSWORD`, `RELAY_PASSWORD`, `ADMIN_USER`, `ADMIN_PASSWORD`
- `AUTODJ_PUBLIC`, `LIVE_PUBLIC`, `STREAM_PUBLIC`
- `AUTODJ_PASSWORD`, `LIVE_PASSWORD`, `STREAM_PASSWORD`
- `STATION_NAME`, `STATION_DESCRIPTION`, `STATION_LOCATION`

### Used by Liquidsoap
- `ICECAST_HOST`, `ICECAST_PORT`, `SOURCE_PASSWORD`
- `MP3_BITRATE`, `OGG_BITRATE`
- `MUSIC_DIR`, `PLAYLIST_DIR`, `ADS_DIR`, `JINGLES_DIR`
- `ENABLE_ADS`, `AD_FREQUENCY`, `ENABLE_JINGLES`, `JINGLE_FREQUENCY`
- `LOG_DIR`, `LOG_LEVEL`

### Used by Web Interface
- `ADMIN_USER`, `ADMIN_PASSWORD` (for form validation hints)
- `STATION_NAME`, `STATION_URL`, `ADMIN_EMAIL` (display only)
- `AUTODJ_PUBLIC`, `LIVE_PUBLIC`, `STREAM_PUBLIC` (public access logic)

### Used by Monitoring
- `MONITOR_INTERVAL`, `HEALTH_CHECK_PORT`, `LOG_DIR`

## Implementation in Docker

### .env File Example
Create a `.env` file in your deployment directory:

```bash
# Security - CHANGE THESE!
ADMIN_USER=admin
ADMIN_PASSWORD=YourSecureAdminPassword123!
SOURCE_PASSWORD=YourSecureSourcePassword456!
RELAY_PASSWORD=YourSecureRelayPassword789!
AUTODJ_PASSWORD=YourSecureAutoDJPassword012!
LIVE_PASSWORD=YourSecureLivePassword345!
STREAM_PASSWORD=YourSecureStreamPassword678!

# Network
ICECAST_HOST=0.0.0.0
ICECAST_PORT=8000
WEB_PORT=8080

# Stream Public Access
AUTODJ_PUBLIC=1
LIVE_PUBLIC=0
STREAM_PUBLIC=1

# Content
ENABLE_ADS=false
ENABLE_JINGLES=false

# Station Info
STATION_NAME=My Radio Station
STATION_DESCRIPTION=24/7 Music Streaming
ADMIN_EMAIL=admin@myradio.com
```

### Docker Compose
```yaml
version: '3.8'
services:
  autodj:
    image: zeropointbruh/autodj-extreme:latest
    ports:
      - "8000:8000"  # Icecast
      - "8080:8080"  # Web UI
    volumes:
      - ./music:/home/container/music
      - ./logs:/home/container/log
    env_file:
      - .env
    restart: unless-stopped
```

### Docker CLI
```bash
docker run -d \
  -p 8000:8000 \
  -p 8080:8080 \
  --env-file .env \
  -v ./music:/home/container/music \
  -v ./logs:/home/container/log \
  zeropointbruh/autodj-extreme:latest
```

## Security Best Practices

### ✅ DO

- ✅ Change **all** default passwords immediately
- ✅ Use **16+ character** passwords with mixed case, numbers, symbols
- ✅ Use **different passwords** for each service
- ✅ Store `.env` file in **secure location** (not in git)
- ✅ Use `.env.example` in version control (without real passwords)
- ✅ Restrict file permissions: `chmod 600 .env`
- ✅ Use HTTPS with reverse proxy in production
- ✅ Rotate passwords quarterly

### ❌ DON'T

- ❌ Don't hardcode passwords in scripts or configs
- ❌ Don't use default passwords in production
- ❌ Don't share `.env` files publicly
- ❌ Don't commit `.env` to git repository
- ❌ Don't use weak passwords (< 12 characters)
- ❌ Don't reuse passwords across services
- ❌ Don't expose Icecast admin port to internet
- ❌ Don't store plain-text passwords in logs

## Password Generation

### Linux/Mac
```bash
# Generate 16-character random password
openssl rand -base64 16

# Or for URL-safe characters
openssl rand -base64 16 | tr '+/' '-_'
```

### Windows PowerShell
```powershell
# Generate 16-character random password
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})
```

### Online Generator
Use a secure password generator: https://www.lastpass.com/features/password-generator

## Troubleshooting

### "Authentication Failed" Messages

**Cause:** Password mismatch between configs  
**Solution:** Verify all configs use the same environment variables:

```bash
# Check current values
grep -r "SOURCE_PASSWORD" configs/
grep -r "ADMIN_PASSWORD" configs/
grep -r "password=" configs/icecast.xml
```

**Fix:** Regenerate all configs from environment variables

### "Cannot Connect to Stream" (Public Access)

**Cause:** `AUTODJ_PUBLIC=0` blocks unauthenticated access  
**Solution:** Set `AUTODJ_PUBLIC=1` for public stream

### Mount Point Mismatches

**Cause:** Different mount names in Icecast vs Liquidsoap  
**Solution:** Standardize on `/autodj`, `/live`, `/stream`

## Configuration Template Generator

Run this script to validate your environment setup:

```bash
#!/bin/bash
echo "🔍 Validating AutoDJ-Extreme Environment Configuration..."

# Required variables
REQUIRED_VARS=(
  "ADMIN_PASSWORD"
  "SOURCE_PASSWORD"
  "RELAY_PASSWORD"
  "AUTODJ_PASSWORD"
  "LIVE_PASSWORD"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    MISSING=$((MISSING + 1))
  else
    LEN=${#!var}
    if [ $LEN -lt 12 ]; then
      echo "⚠️  Warning: $var is only $LEN chars (recommend 16+)"
    else
      echo "✅ $var configured ($LEN chars)"
    fi
  fi
done

if [ $MISSING -eq 0 ]; then
  echo "✅ All required variables configured!"
else
  echo "❌ $MISSING variable(s) missing"
  exit 1
fi
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-12 | Initial centralized environment config system |
| 1.1 | TBD | Enhanced security validation |
| 2.0 | TBD | Config management UI |

---

**Last Updated:** March 12, 2026  
**Maintained by:** @zeropointbruh  
**Contact:** wegj1@hotmail.com
