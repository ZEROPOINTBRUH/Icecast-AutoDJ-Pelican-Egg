# 🚀 Quick Start Guide - Extreme Edition

**Created by:** @zeropointbruh (wegj1@hotmail.com)  
**Website:** https://banabyte.com

---

## 🎯 Choose Your Version

| Version | Best For | File |
|---------|----------|------|
| **Original** | Legacy systems, minimal needs | `egg/radio.json` |
| **Enhanced** | Better security, more options | `egg/radio-improved.json` |
| **🔥 EXTREME** | **Full-featured radio station** | `egg/radio-extreme.json` |

**→ We recommend the EXTREME edition!**

---

## ⚡ 5-Minute Setup (Extreme Edition)

### Step 1: Import Egg (2 minutes)
1. Open Pterodactyl/Pelican Panel admin
2. Navigate to **Nests** → **Import Egg**
3. Upload `egg/radio-extreme.json`
4. Done!

### Step 2: Create Server (1 minute)
1. Create new server with "Icecast-AutoDJ-Extreme" egg
2. Allocate port (default: 8000)
3. Set RAM: 512MB minimum
4. Click Create

### Step 3: Configure Features (2 minutes)

**CHANGE THESE PASSWORDS:**
```
SOURCE_PASSWORD = YourStrongPassword123!
ADMIN_PASSWORD = YourAdminPassword456!
RELAY_PASSWORD = YourRelayPassword789!
AUTODJ_PASSWORD = YourAutoDJPassword012!
LIVE_PASSWORD = YourLivePassword345!
```

**Enable Features You Want:**
```
ENABLE_ADS = true          ← Want to monetize?
ENABLE_JINGLES = true      ← Want station branding?
USE_MULTI_PLAYLIST = true  ← Multiple genres?
```

**Customize Your Station:**
```
STATION_NAME = Your Radio Name
STATION_GENRE = Your Genre
STATION_DESCRIPTION = Your Description
ADMIN_EMAIL = your@email.com
```

### Step 4: Install & Upload Music
1. Click "Install" button
2. Wait for green "Installation completed successfully!"
3. Upload music files to `/music` folder
4. If enabled: Upload ads to `/ads` folder
5. If enabled: Upload jingles to `/jingles` folder

### Step 5: Start & Listen! 🎵
1. Click "Start"
2. Wait for "Enhanced AutoDJ is now LIVE!"
3. Listen at: `http://YOUR_IP:PORT/autodj`
4. Admin panel: `http://YOUR_IP:PORT/admin`

**Done! You're broadcasting!**

---

## 📁 What to Upload Where

### Music (Required)
```
/music/
├── song1.mp3
├── song2.mp3
├── album1/
│   ├── track1.mp3
│   └── track2.mp3
└── ...
```

### Ads (Optional - if ENABLE_ADS=true)
```
/ads/
├── commercial1.mp3
├── sponsor_message.mp3
├── promo.mp3
└── ...
```

### Jingles (Optional - if ENABLE_JINGLES=true)
```
/jingles/
├── station_id_1.mp3
├── station_id_2.mp3
├── time_check.mp3
└── ...
```

### Multi-Playlists (Optional - if USE_MULTI_PLAYLIST=true)
```
/playlists/
├── rock/
│   ├── song1.mp3
│   └── song2.mp3
├── pop/
│   ├── song1.mp3
│   └── song2.mp3
└── jazz/
    ├── song1.mp3
    └── song2.mp3
```

---

## 🎛️ Feature Examples

### Example 1: Simple Radio (No Ads/Jingles)
```
ENABLE_ADS = false
ENABLE_JINGLES = false
USE_MULTI_PLAYLIST = false
```
Upload music to `/music` → Done!

### Example 2: Professional Station (Ads + Jingles)
```
ENABLE_ADS = true
ENABLE_JINGLES = true
USE_MULTI_PLAYLIST = false
ADS_FREQUENCY = 5
JINGLE_FREQUENCY = 3
```
Upload:
- Music → `/music`
- Ads → `/ads`
- Jingles → `/jingles`

### Example 3: Multi-Genre Station
```
ENABLE_ADS = true
ENABLE_JINGLES = true
USE_MULTI_PLAYLIST = true
ADS_FREQUENCY = 10
JINGLE_FREQUENCY = 5
```
Upload:
- Rock → `/playlists/rock/`
- Pop → `/playlists/pop/`
- Jazz → `/playlists/jazz/`
- Ads → `/ads`
- Jingles → `/jingles`

---

## 🔧 Common Settings

### Small Station (1-50 listeners)
```
MAX_CLIENTS = 50
Memory: 512MB
CPU: 1 core
```

### Medium Station (50-500 listeners)
```
MAX_CLIENTS = 500
Memory: 1GB
CPU: 2 cores
```

### Large Station (500+ listeners)
```
MAX_CLIENTS = 1000+
Memory: 2GB+
CPU: 4+ cores
```

---

## 🎵 Supported Audio Formats

✅ MP3 (most common)  
✅ OGG Vorbis  
✅ OPUS  
✅ FLAC (lossless)  
✅ M4A/AAC  

**Recommended:** MP3 at 128kbps or 192kbps for streaming

---

## 🔗 Access Your Stream

### For Listeners:
```
Main Stream: http://YOUR_IP:PORT/autodj
Alternative: http://YOUR_IP:PORT/stream
```

### For Admin:
```
Admin Panel: http://YOUR_IP:PORT/admin
Username: admin (or your configured username)
Password: Your ADMIN_PASSWORD
```

### Status Page:
```
http://YOUR_IP:PORT/status.xsl
```

---

## 💡 Pro Tips

### 1. Audio Quality
- Use consistent bitrate (128kbps or 192kbps)
- Normalize volume levels
- Remove silence at start/end

### 2. Ads Strategy
- Keep ads 15-30 seconds
- Don't overdo frequency (5-10 songs is good)
- Match ad volume to music

### 3. Jingles
- Short station IDs (5-10 seconds)
- Variety prevents repetition
- Professional voice = professional station

### 4. Playlists
- Organize by genre/mood/time
- Mix popular and deep cuts
- Refresh regularly

---

## 🆘 Troubleshooting

### Stream Won't Start
```bash
# Check if music exists
ls /mnt/server/music/

# View logs
cat /mnt/server/log/error.log
```

### No Audio Playing
- Verify audio files uploaded
- Check file formats (MP3, OGG, etc.)
- Ensure files aren't corrupted

### Can't Login to Admin
- Double-check ADMIN_PASSWORD
- Try default: admin/hackme (if not changed)
- Check browser console for errors

### Ads/Jingles Not Playing
- Verify ENABLE_ADS=true or ENABLE_JINGLES=true
- Check files exist in `/ads` or `/jingles`
- Verify frequencies aren't too high

---

## 📚 Need More Help?

### Documentation
- **Full Guide:** `egg/EXTREME-GUIDE.md`
- **Installation:** `egg/INSTALLATION.md`
- **Migration:** `egg/MIGRATION.md`
- **Improvements:** `egg/IMPROVEMENTS.md`

### Support
- **Discord:** @zeropointbruh
- **Email:** wegj1@hotmail.com
- **Website:** https://banabyte.com

---

## 📜 License & Attribution

### Using Commercially?
**YOU MUST CREDIT:** @zeropointbruh

**Example:**
```
"Powered by Enhanced Icecast AutoDJ by @zeropointbruh"
Email: wegj1@hotmail.com
Website: https://banabyte.com
```

### Non-Commercial?
Attribution appreciated but not required!

See `LICENSE-ENHANCED` for full terms.

---

## 🎉 You're All Set!

Your radio station is ready to broadcast. Upload your content and start streaming!

**Questions?** wegj1@hotmail.com or Discord: @zeropointbruh

**Enjoying this?** Give credit if using commercially - it helps keep this project alive!

🎵 **Happy Broadcasting!** 🎵

---

*Created with ❤️ by @zeropointbruh - https://banabyte.com*
