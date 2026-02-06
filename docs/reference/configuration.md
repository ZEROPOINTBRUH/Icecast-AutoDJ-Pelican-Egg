# ⚙️ Configuration Reference

**Enhanced Icecast AutoDJ - All Settings Explained**  
Created by: @zeropointbruh (wegj1@hotmail.com)

---

## Environment Variables

The Extreme Edition uses 22 environment variables for complete control.

---

## 🎛️ Feature Toggles

### ENABLE_ADS
- **Type:** Boolean (`true` or `false`)
- **Default:** `false`
- **Description:** Enable advertisements rotation system
- **Creates:** `/ads` directory on installation
- **Example:** `ENABLE_ADS=true`

### ENABLE_JINGLES
- **Type:** Boolean (`true` or `false`)
- **Default:** `false`
- **Description:** Enable jingle injection between tracks
- **Creates:** `/jingles` directory on installation
- **Example:** `ENABLE_JINGLES=true`

### USE_MULTI_PLAYLIST
- **Type:** Boolean (`true` or `false`)
- **Default:** `false`
- **Description:** Enable multi-playlist mode with subdirectories
- **Creates:** `/playlists` directory structure
- **Example:** `USE_MULTI_PLAYLIST=true`

---

## 🎵 Playback Configuration

### ADS_FREQUENCY
- **Type:** Integer (1-100)
- **Default:** `5`
- **Description:** Play one ad every X songs
- **Requires:** `ENABLE_ADS=true`
- **Example:** `ADS_FREQUENCY=7` (ad every 7 songs)

### JINGLE_FREQUENCY
- **Type:** Integer (1-100)
- **Default:** `3`
- **Description:** Play one jingle every X songs
- **Requires:** `ENABLE_JINGLES=true`
- **Example:** `JINGLE_FREQUENCY=5` (jingle every 5 songs)

---

## 🔐 Security Settings

### SOURCE_PASSWORD
- **Type:** String (12-64 characters)
- **Default:** None (must set)
- **Description:** Password for streaming sources
- **Required:** Yes
- **Security:** High priority - change immediately
- **Example:** `SOURCE_PASSWORD=MySecurePass123!`

### ADMIN_PASSWORD
- **Type:** String (12-64 characters)
- **Default:** None (must set)
- **Description:** Password for admin panel access
- **Required:** Yes
- **Security:** High priority - change immediately
- **Example:** `ADMIN_PASSWORD=AdminSecure456!`

### ADMIN_USER
- **Type:** String (max 32 characters)
- **Default:** `admin`
- **Description:** Username for admin panel
- **Example:** `ADMIN_USER=broadcaster`

### RELAY_PASSWORD
- **Type:** String (12-64 characters)
- **Default:** None (must set)
- **Description:** Password for relay servers
- **Required:** Yes
- **Example:** `RELAY_PASSWORD=RelayPass789!`

### AUTODJ_PASSWORD
- **Type:** String (12-64 characters)
- **Default:** None (must set)
- **Description:** Password for AutoDJ mount point
- **Required:** Yes
- **Example:** `AUTODJ_PASSWORD=AutoDJPass012!`

### LIVE_PASSWORD
- **Type:** String (12-64 characters)
- **Default:** None (must set)
- **Description:** Password for live streaming mount point
- **Required:** Yes
- **Example:** `LIVE_PASSWORD=LivePass345!`

---

## 📻 Stream Configuration

### MOUNT_POINT
- **Type:** String (max 64 characters)
- **Default:** `/autodj`
- **Description:** Mount point for AutoDJ stream
- **Format:** Must start with `/`
- **Example:** `MOUNT_POINT=/radio`

### STREAM_FORMAT
- **Type:** Enum (`MP3`, `OGG`, `OPUS`)
- **Default:** `MP3`
- **Description:** Audio codec for stream output
- **Recommended:** `MP3` for compatibility
- **Example:** `STREAM_FORMAT=OPUS`

### STATION_NAME
- **Type:** String (max 128 characters)
- **Default:** `Enhanced AutoDJ Radio`
- **Description:** Your radio station name
- **Example:** `STATION_NAME=Best Hits Radio`

### STATION_GENRE
- **Type:** String (max 64 characters)
- **Default:** `Various`
- **Description:** Music genre or category
- **Example:** `STATION_GENRE=Rock & Pop`

### STATION_DESCRIPTION
- **Type:** String (max 256 characters)
- **Default:** `Enhanced AutoDJ Stream by @zeropointbruh`
- **Description:** Station description for listeners
- **Example:** `STATION_DESCRIPTION=24/7 Best Music Hits`

---

## 🌐 Server Settings

### HOSTNAME
- **Type:** String (max 128 characters)
- **Default:** `localhost`
- **Description:** Server hostname or IP address
- **Used in:** Stream URLs, web interface
- **Example:** `HOSTNAME=radio.example.com`

### LOCATION
- **Type:** String (max 64 characters)
- **Default:** `Earth`
- **Description:** Geographic location of server
- **Example:** `LOCATION=New York, USA`

### ADMIN_EMAIL
- **Type:** Email (max 128 characters)
- **Default:** `wegj1@hotmail.com`
- **Description:** Contact email for station admin
- **Validation:** Must be valid email format
- **Example:** `ADMIN_EMAIL=admin@radiostation.com`

---

## 👥 Capacity Settings

### MAX_CLIENTS
- **Type:** Integer (1-10000)
- **Default:** `100`
- **Description:** Maximum concurrent listeners
- **Scaling:** Set based on bandwidth/CPU
- **Example:** `MAX_CLIENTS=500`

**Recommendations:**
- Small station: 50-100
- Medium station: 100-500
- Large station: 500-2000

### MAX_SOURCES
- **Type:** Integer (1-10)
- **Default:** `2`
- **Description:** Maximum streaming sources
- **Example:** `MAX_SOURCES=3`

**Use cases:**
- AutoDJ only: 1
- AutoDJ + Live: 2
- Multiple DJs: 3-5

---

## 🗂️ Repository Configuration

### REPO_URL
- **Type:** String (max 256 characters)
- **Default:** `https://github.com/zeropointbruh/icecast-autodj.git`
- **Description:** Git repository for icecast-autodj
- **Example:** Custom fork URL

---

## 📊 Configuration Examples

### Minimal Setup
```bash
# Required settings only
SOURCE_PASSWORD=SecureSource123!
ADMIN_PASSWORD=SecureAdmin456!
RELAY_PASSWORD=SecureRelay789!
AUTODJ_PASSWORD=SecureAutoDJ012!
LIVE_PASSWORD=SecureLive345!
```

### Professional Station
```bash
# All features enabled
ENABLE_ADS=true
ENABLE_JINGLES=true
USE_MULTI_PLAYLIST=false
ADS_FREQUENCY=7
JINGLE_FREQUENCY=4

SOURCE_PASSWORD=SecureSource123!
ADMIN_PASSWORD=SecureAdmin456!
RELAY_PASSWORD=SecureRelay789!
AUTODJ_PASSWORD=SecureAutoDJ012!
LIVE_PASSWORD=SecureLive345!

STATION_NAME=Best Hits Radio
STATION_GENRE=Top 40 Hits
STATION_DESCRIPTION=Playing the best music 24/7
HOSTNAME=radio.example.com
ADMIN_EMAIL=admin@example.com

MAX_CLIENTS=500
MAX_SOURCES=3
STREAM_FORMAT=MP3
```

### Multi-Genre Station
```bash
# Multi-playlist with all features
ENABLE_ADS=true
ENABLE_JINGLES=true
USE_MULTI_PLAYLIST=true
ADS_FREQUENCY=10
JINGLE_FREQUENCY=5

# ... (passwords)

STATION_NAME=Multi-Genre Radio
STATION_GENRE=Various
MAX_CLIENTS=1000
```

---

## 🔍 Configuration Files

### icecast.xml
Located: `/mnt/server/icecast.xml`

Key sections:
- **Authentication** - Passwords and users
- **Limits** - Client/source limits
- **Mounts** - Stream endpoints
- **Paths** - Directory locations

### ezstream.xml
Located: `/mnt/server/ezstream.xml`

Key sections:
- **Server** - Connection settings
- **Streams** - Format and encoding
- **Intakes** - Playlist source

---

## 📝 Logging Configuration

### Log Files
```
/mnt/server/log/
├── autodj.log          # All events
├── autodj-error.log    # Errors only
├── autodj-access.log   # Access log
├── access.log          # Icecast access
└── error.log           # Icecast errors
```

### Log Levels
- **INFO** - Normal operations
- **WARN** - Warnings (non-critical)
- **ERROR** - Errors (critical)
- **SUCCESS** - Successful operations
- **DEBUG** - Detailed debugging

### Log Format
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] Message
```

Example:
```
[2026-02-05 18:30:45] [INFO] Starting Icecast server...
[2026-02-05 18:30:50] [SUCCESS] Icecast started (PID: 1234)
```

---

## 🎯 Best Practices

### Security
1. **Change all passwords** from defaults
2. **Use 16+ character passwords** with mixed characters
3. **Different password** for each service
4. **Secure admin email** - use real address

### Performance
1. **Set MAX_CLIENTS** based on bandwidth
2. **Use MP3 format** for maximum compatibility
3. **128 kbps bitrate** for good quality/bandwidth balance
4. **Monitor logs** regularly

### Content
1. **Organize music** in logical folders
2. **Test ads/jingles** before enabling
3. **Consistent audio levels** across files
4. **Tag metadata** properly

---

## 🐛 Troubleshooting

### "Configuration not applied"
**Check:** Environment variables set in panel, not in file  
**Fix:** Set in Pterodactyl/Pelican server settings

### "Passwords not working"
**Check:** Minimum 12 characters required  
**Fix:** Use longer, more complex passwords

### "Features not enabled"
**Check:** Variables set to `true` (lowercase)  
**Fix:** `ENABLE_ADS=true` not `True` or `TRUE`

---

## 📞 Support

**Configuration help?**
- 📧 Email: wegj1@hotmail.com
- 💬 Discord: @zeropointbruh
- 🌐 Website: https://banabyte.com
