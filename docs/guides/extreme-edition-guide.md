# Ultra-Enhanced Icecast AutoDJ - Extreme Edition Guide

**Created by:** @zeropointbruh  
**Email:** wegj1@hotmail.com  
**Discord:** @zeropointbruh  
**Website:** https://banabyte.com

---

## 🎯 What Makes This "Extreme"?

This isn't your average radio streaming setup. This is the **EXTREME EDITION** with features that blow the original out of the water:

### 🔥 Revolutionary Features

#### 1. **Multi-Playlist Support**
- Create multiple playlist directories
- Intelligently rotates between different music collections
- Perfect for varied programming (Rock, Pop, Jazz, etc.)
- Weighted rotation based on content

#### 2. **Ads Rotation System**
- Dedicated `/ads` folder for advertisements
- Configurable frequency (e.g., every 5 songs)
- Random ad selection
- Seamless integration with music flow

#### 3. **Jingle Injection**
- Dedicated `/jingles` folder for station IDs
- Configurable frequency (e.g., every 3 songs)
- Professional station branding
- Perfect timing between tracks

#### 4. **Advanced Format Support**
- MP3, OGG, OPUS, FLAC, M4A
- Automatic format detection
- Transcoding on-the-fly
- Consistent stream quality

#### 5. **Process Monitoring**
- Automatic restart if Icecast crashes
- Auto-recovery for ezstream failures
- Health checks every 30 seconds
- Zero downtime during recoveries

#### 6. **Pelican Panel Compatible**
- Works with Pterodactyl AND Pelican Panel
- Modern egg format (PTDL_v2)
- Proper startup detection
- Clean shutdown handling

---

## 📦 Installation

### Step 1: Import the Egg

1. Download `radio-extreme.json`
2. Open your Pterodactyl/Pelican Panel admin area
3. Navigate to **Nests** → **Import Egg**
4. Upload the file
5. Configure the nest settings

### Step 2: Create Your Server

1. Create a new server using the "Icecast-AutoDJ-Extreme" egg
2. Allocate a port (default: 8000)
3. Set your memory and CPU limits
4. Click "Create Server"

### Step 3: Configure Environment Variables

**Critical Settings (Change These!):**
```
SOURCE_PASSWORD = YourSecurePassword123!
ADMIN_PASSWORD = AnotherSecurePassword456!
RELAY_PASSWORD = RelaySecurePassword789!
AUTODJ_PASSWORD = AutoDJPassword012!
LIVE_PASSWORD = LivePassword345!
```

**Feature Toggles:**
```
ENABLE_ADS = true          # Enable ad rotation
ENABLE_JINGLES = true      # Enable jingle injection
USE_MULTI_PLAYLIST = true  # Enable multi-playlist mode
```

**Frequency Settings:**
```
ADS_FREQUENCY = 5          # Play ad every 5 songs
JINGLE_FREQUENCY = 3       # Play jingle every 3 songs
```

**Station Info:**
```
STATION_NAME = Your Radio Name
STATION_GENRE = Your Genre
STATION_DESCRIPTION = Your Description
ADMIN_EMAIL = wegj1@hotmail.com  # Change to your email
```

### Step 4: Install & Start

1. Click "Install" in the server panel
2. Watch the beautiful colored installation logs
3. Wait for: "Installation completed successfully!"
4. Start the server
5. Wait for: "Enhanced AutoDJ is now LIVE!"

---

## 📁 Directory Structure

After installation, you'll have this structure:

```
/mnt/server/
├── icecast-autodj/           # Core application
│   ├── run.sh               # Enhanced startup script
│   ├── configs/             # Configuration templates
│   └── scripts/             # Helper scripts
├── music/                   # 🎵 Main music directory
│   ├── song1.mp3
│   ├── song2.mp3
│   └── ...
├── ads/                     # 📢 Advertisements (if enabled)
│   ├── ad1.mp3
│   ├── ad2.mp3
│   └── README.txt
├── jingles/                 # 🎙️ Station IDs (if enabled)
│   ├── jingle1.mp3
│   ├── jingle2.mp3
│   └── README.txt
├── playlists/               # 📂 Multi-playlists (if enabled)
│   ├── playlist1/
│   │   ├── rock1.mp3
│   │   └── rock2.mp3
│   ├── playlist2/
│   │   ├── pop1.mp3
│   │   └── pop2.mp3
│   └── README.txt
├── log/                     # 📝 Server logs
├── icecast.xml              # Icecast configuration
├── ezstream.xml             # ezstream configuration
├── playlist.m3u             # Generated master playlist
├── refresh_playlist.sh      # Helper: Refresh playlist
└── skip_track.sh            # Helper: Skip current track
```

---

## 🎮 Usage Examples

### Basic Setup (Single Playlist)

**Environment Variables:**
```
ENABLE_ADS = false
ENABLE_JINGLES = false
USE_MULTI_PLAYLIST = false
```

**Upload Music:**
```bash
# Upload to /music directory
/music/song1.mp3
/music/song2.mp3
/music/song3.mp3
```

**Result:** Simple rotation through all music files.

---

### Professional Station (Ads + Jingles)

**Environment Variables:**
```
ENABLE_ADS = true
ENABLE_JINGLES = true
USE_MULTI_PLAYLIST = false
ADS_FREQUENCY = 5
JINGLE_FREQUENCY = 3
```

**Upload Files:**
```bash
# Music
/music/song1.mp3
/music/song2.mp3
/music/song3.mp3

# Ads
/ads/commercial1.mp3
/ads/commercial2.mp3

# Jingles
/jingles/stationid1.mp3
/jingles/stationid2.mp3
```

**Result:** 
```
Song 1
Song 2
Song 3 → Jingle
Song 4
Song 5 → Ad
Song 6 → Jingle
...
```

---

### Advanced Multi-Genre Station

**Environment Variables:**
```
ENABLE_ADS = true
ENABLE_JINGLES = true
USE_MULTI_PLAYLIST = true
ADS_FREQUENCY = 10
JINGLE_FREQUENCY = 5
```

**Upload Files:**
```bash
# Rock Playlist
/playlists/rock/song1.mp3
/playlists/rock/song2.mp3

# Pop Playlist
/playlists/pop/song1.mp3
/playlists/pop/song2.mp3

# Jazz Playlist
/playlists/jazz/song1.mp3
/playlists/jazz/song2.mp3

# Main music (gets mixed in)
/music/general1.mp3

# Ads & Jingles
/ads/ad1.mp3
/jingles/jingle1.mp3
```

**Result:** Intelligent mixing of all playlists with ads and jingles.

---

## 🛠️ Helper Scripts

### Refresh Playlist
Regenerates the playlist without restarting:
```bash
bash /mnt/server/refresh_playlist.sh
```

### Skip Current Track
Skips to the next song:
```bash
bash /mnt/server/skip_track.sh
```

---

## 🌐 Accessing Your Stream

### For Listeners:
```
http://YOUR_IP:PORT/autodj
```

### Admin Panel:
```
http://YOUR_IP:PORT/admin
Username: admin (or your configured username)
Password: Your ADMIN_PASSWORD
```

### Status Page:
```
http://YOUR_IP:PORT/status.xsl
```

---

## 🔧 Configuration Deep Dive

### Mount Points

The extreme edition configures 3 mount points:

1. **`/stream`** - Main listener endpoint
   - Falls back to `/live` if available
   - Otherwise plays `/autodj`

2. **`/live`** - For live DJ broadcasts
   - Password protected (LIVE_PASSWORD)
   - Falls back to `/autodj` when no live source

3. **`/autodj`** - 24/7 automated playlist
   - Password protected (AUTODJ_PASSWORD)
   - Never goes offline

### Playlist Generation Logic

**Without Ads/Jingles:**
```
Music files → Shuffle → Play
```

**With Ads:**
```
Song 1
Song 2
Song 3
Song 4
Song 5 → AD
Song 6
Song 7
...
```

**With Jingles:**
```
Song 1
Song 2
Song 3 → JINGLE
Song 4
Song 5
Song 6 → JINGLE
...
```

**With Both:**
```
Song 1
Song 2
Song 3 → JINGLE
Song 4
Song 5 → AD
Song 6 → JINGLE
Song 7
Song 8
Song 9 → JINGLE
Song 10 → AD
...
```

---

## 🚨 Troubleshooting

### Stream Won't Start

**Check:**
1. Music files uploaded to `/music`
2. Icecast.xml exists
3. ezstream.xml exists
4. Ports are allocated correctly
5. Logs in `/log` directory

**Fix:**
```bash
# Check logs
cat /mnt/server/log/error.log

# Verify files
ls -la /mnt/server/music/

# Check processes
ps aux | grep icecast
ps aux | grep ezstream
```

### No Ads Playing (When Enabled)

**Check:**
1. `ENABLE_ADS = true` in environment variables
2. Ad files in `/ads` directory
3. Ad files are valid audio format

**Verify:**
```bash
ls -la /mnt/server/ads/
```

### Jingles Not Injecting

**Check:**
1. `ENABLE_JINGLES = true` in environment variables
2. Jingle files in `/jingles` directory
3. JINGLE_FREQUENCY is reasonable (not too high)

**Verify:**
```bash
ls -la /mnt/server/jingles/
```

### Multi-Playlist Not Working

**Check:**
1. `USE_MULTI_PLAYLIST = true`
2. Playlists are in subdirectories of `/playlists/`
3. Not just in `/playlists/` root

**Correct:**
```
/playlists/rock/song.mp3     ✅
/playlists/pop/song.mp3      ✅
```

**Incorrect:**
```
/playlists/song.mp3          ❌
```

---

## 💡 Pro Tips

### 1. Organizing Multi-Playlists
```bash
/playlists/
├── morning-show/      # 6am-12pm content
├── afternoon-drive/   # 12pm-6pm content
├── evening-mix/       # 6pm-12am content
└── overnight/         # 12am-6am content
```

### 2. Creating Professional Ads
- Keep ads short (15-30 seconds)
- Match audio levels with music
- Use consistent format (MP3 128kbps recommended)
- Create variety to avoid repetition

### 3. Effective Jingles
- Station IDs: 5-10 seconds
- Time announcements
- Contest promos
- Show transitions

### 4. Optimizing Frequencies
```
Short sessions (1-2 hours):
ADS_FREQUENCY = 8-10
JINGLE_FREQUENCY = 5-7

Long sessions (24/7):
ADS_FREQUENCY = 5-7
JINGLE_FREQUENCY = 3-5

Heavy monetization:
ADS_FREQUENCY = 3-5
JINGLE_FREQUENCY = 2-3
```

---

## 📊 Performance Tuning

### For Small Audiences (<50 listeners)
```
MAX_CLIENTS = 50
MAX_SOURCES = 2
Memory: 512MB
CPU: 1 core
```

### For Medium Audiences (50-500 listeners)
```
MAX_CLIENTS = 500
MAX_SOURCES = 3
Memory: 1GB
CPU: 2 cores
```

### For Large Audiences (500+ listeners)
```
MAX_CLIENTS = 1000+
MAX_SOURCES = 5
Memory: 2GB+
CPU: 4+ cores
```

---

## 🔐 Security Best Practices

### Password Requirements
- **Minimum 12 characters** (enforced by egg)
- Use mix of letters, numbers, symbols
- Different password for each service
- Change default passwords immediately

### Generate Secure Passwords
```bash
# Linux/Mac
openssl rand -base64 16

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})
```

### Firewall Configuration
```bash
# Allow Icecast port
ufw allow 8000/tcp

# Block admin from internet (use SSH tunnel)
ufw deny from any to any port 8000 proto tcp
```

---

## 📜 License & Attribution

### Using This Commercially?

**YOU MUST CREDIT:**
- **Creator:** @zeropointbruh
- **Email:** wegj1@hotmail.com
- **Website:** https://banabyte.com

**Example Attribution:**
```
"Powered by Enhanced Icecast AutoDJ 
by @zeropointbruh (wegj1@hotmail.com) - https://banabyte.com"
```

### Non-Commercial Use
Attribution appreciated but not required.

### Full License
See `LICENSE-ENHANCED` file for complete terms.

---

## 🆘 Support

### Get Help
- **GitHub Issues:** (your repo URL here)
- **Discord:** @zeropointbruh
- **Email:** wegj1@hotmail.com
- **Website:** https://banabyte.com

### Bug Reports
Include:
1. Egg version
2. Panel type (Pterodactyl/Pelican)
3. Environment variable configuration
4. Error logs from `/log` directory
5. Steps to reproduce

---

## 🎉 Credits

**Enhanced by:** @zeropointbruh (wegj1@hotmail.com)  
**Website:** https://banabyte.com  
**Original Icecast-AutoDJ:** jensjeflensje/Renaud11232  
**Icecast:** Xiph.Org Foundation  
**ezstream:** Xiph.Org Foundation  

---

## 🚀 What's Next?

### Planned Features (Future Versions)
- [ ] Scheduled programming (time-based playlists)
- [ ] Web-based playlist editor
- [ ] Listener statistics dashboard
- [ ] Song request system
- [ ] API for remote control
- [ ] Mobile app integration

### Contribute
Want to improve this? Fork it, enhance it, submit a PR!

---

**Remember:** If you use this commercially, credit @zeropointbruh. It's free software, but attribution matters! 🎵

**Questions?** wegj1@hotmail.com or Discord: @zeropointbruh
