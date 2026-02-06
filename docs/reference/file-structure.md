# 📁 Repository File Organization

**Created by:** @zeropointbruh (wegj1@hotmail.com)

---

## 📊 Directory Structure

```
pterodactyl-radio-streaming/
│
├── 📄 README.md                    # Main project overview
├── 📄 LICENSE                      # Original MIT License
├── 📄 LICENSE-ENHANCED             # Enhanced license (references ATTRIBUTION)
├── 📄 ATTRIBUTION.md               # ⭐ Attribution requirements & credits
├── 📄 QUICKSTART.md                # 5-minute quick start guide
├── 📄 DEPLOYMENT.md                # Complete deployment guide
├── 📄 FILE-STRUCTURE.md            # This file - organization guide
│
├── 📂 egg/                         # ⭐ Pterodactyl/Pelican Panel Eggs
│   ├── 📄 README.md                # Egg directory overview
│   ├── 📄 radio.json               # Original egg (legacy)
│   ├── 📄 radio-improved.json      # Enhanced egg
│   ├── 📄 radio-extreme.json       # 🔥 EXTREME EDITION (recommended)
│   ├── 📄 INSTALLATION.md          # Installation guide
│   ├── 📄 MIGRATION.md             # Migration/upgrade guide
│   ├── 📄 IMPROVEMENTS.md          # Detailed comparison
│   ├── 📄 EXTREME-GUIDE.md         # Ultimate feature guide
│   └── 📄 GITHUB_SETUP.md          # Old placeholder guide (deprecated)
│
├── 📂 docker/                      # 🐳 Docker Configuration
│   ├── 📄 Dockerfile               # Custom image definition
│   ├── 📄 run.sh                   # Basic run script
│   └── 📄 run-enhanced.sh          # ⭐ Enhanced script with logging & formatting
│
├── 📂 webui/                       # 🎨 Modern Web Interface
│   ├── 📄 README.md                # Web interface documentation
│   ├── 📄 index.html               # Main player page
│   ├── 📄 style.css                # Modern styling
│   └── 📄 player.js                # Player functionality
│
├── 📂 icecast-autodj-backup/       # 💾 Preserved Original Repository
│   ├── 📂 configs/                 # Original config templates
│   ├── 📂 scripts/                 # Original helper scripts
│   ├── 📄 run.sh                   # Original run script
│   └── 📄 ...                      # Other original files
│
└── 📂 .github/                     # GitHub specific files
    └── 📄 workflows/               # CI/CD workflows (if added)
```

---

## 🎯 File Categories

### 📘 Documentation Files
These help you understand and use the project:

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Project overview, quick info | Everyone |
| `QUICKSTART.md` | Get started in 5 minutes | New users |
| `DEPLOYMENT.md` | Complete deployment process | Deployers |
| `ATTRIBUTION.md` | Credits and attribution rules | Commercial users |
| `FILE-STRUCTURE.md` | This file - navigation guide | Developers |

### 🥚 Egg Files (Pterodactyl/Pelican)
Choose ONE based on your needs:

| File | Level | Use When |
|------|-------|----------|
| `egg/radio.json` | Basic | Need minimal setup (legacy) |
| `egg/radio-improved.json` | Enhanced | Want security + config |
| `egg/radio-extreme.json` | **Ultimate** | **Want all features** ⭐ |

**Documentation:**
- `egg/INSTALLATION.md` - How to install
- `egg/EXTREME-GUIDE.md` - Feature guide for extreme edition
- `egg/MIGRATION.md` - Upgrade from old versions
- `egg/IMPROVEMENTS.md` - What changed and why

### 🐳 Docker Files
For building custom images:

| File | Purpose |
|------|---------|
| `docker/Dockerfile` | Image definition with all dependencies |
| `docker/run.sh` | Basic startup script |
| `docker/run-enhanced.sh` | **Advanced script with logging** ⭐ |

### 🎨 Web Interface Files
Modern player UI:

| File | Purpose |
|------|---------|
| `webui/index.html` | Player structure |
| `webui/style.css` | Beautiful styling |
| `webui/player.js` | Functionality |
| `webui/README.md` | Customization guide |

### 📜 Legal Files

| File | Purpose |
|------|---------|
| `LICENSE` | Original MIT license |
| `LICENSE-ENHANCED` | Enhanced license with notice |
| `ATTRIBUTION.md` | **Full attribution requirements** ⭐ |

---

## 🗂️ Recommended Reading Order

### For New Users:
1. `README.md` - Understand what this is
2. `QUICKSTART.md` - Get it running quickly
3. `egg/EXTREME-GUIDE.md` - Learn the features
4. `ATTRIBUTION.md` - Understand credits (if commercial)

### For Experienced Users:
1. `DEPLOYMENT.md` - Complete setup process
2. `egg/radio-extreme.json` - Import and configure
3. `docker/run-enhanced.sh` - Understand the logic
4. `webui/README.md` - Customize the interface

### For Developers:
1. `FILE-STRUCTURE.md` - This file (you are here)
2. `docker/Dockerfile` - Image structure
3. `docker/run-enhanced.sh` - Core logic
4. `egg/IMPROVEMENTS.md` - Technical details
5. `webui/` - Frontend code

---

## 📂 Content Directory Layout

When installed, the server creates this structure:

```
/mnt/server/                        # Server root
│
├── 📂 icecast-autodj/              # Application directory
│   ├── run.sh                      # Startup script
│   ├── 📂 configs/                 # Config templates
│   └── 📂 scripts/                 # Helper scripts
│
├── 📄 icecast.xml                  # Icecast configuration
├── 📄 ezstream.xml                 # ezstream configuration
├── 📄 playlist.m3u                 # Generated playlist
│
├── 📂 music/                       # 🎵 Your music files
│   ├── song1.mp3
│   ├── song2.mp3
│   └── ...
│
├── 📂 ads/                         # 📢 Advertisement files (optional)
│   ├── ad1.mp3
│   └── ...
│
├── 📂 jingles/                     # 🎙️ Station IDs (optional)
│   ├── jingle1.mp3
│   └── ...
│
├── 📂 playlists/                   # 📁 Multi-playlists (optional)
│   ├── 📂 rock/
│   ├── 📂 pop/
│   └── 📂 jazz/
│
├── 📂 log/                         # 📝 Server logs
│   ├── autodj.log                  # Main log
│   ├── autodj-error.log            # Error log
│   ├── autodj-access.log           # Access log
│   ├── access.log                  # Icecast access
│   └── error.log                   # Icecast errors
│
├── 📂 webui/                       # 🎨 Web interface (optional)
│   ├── index.html
│   ├── style.css
│   └── player.js
│
└── 📄 Helper scripts
    ├── refresh_playlist.sh         # Reload playlist
    └── skip_track.sh               # Skip current song
```

---

## 🎯 Which Files Do I Need?

### Minimum Viable Setup:
```
✅ egg/radio-extreme.json          # Import this to panel
✅ Upload music to /music          # At least 1 audio file
```

### Professional Setup:
```
✅ egg/radio-extreme.json          # Import to panel
✅ /music                          # Your music library
✅ /ads                            # Advertisement files
✅ /jingles                        # Station IDs
✅ /webui                          # Modern web interface
✅ Configure environment variables # Passwords, features
```

### Developer Setup:
```
✅ All repository files            # Clone the repo
✅ docker/Dockerfile               # Build custom image
✅ Modify docker/run-enhanced.sh   # Custom logic
✅ Customize webui/*               # Brand your interface
```

---

## 🔍 Finding What You Need

### "I want to..."

**Install the radio server**
→ `QUICKSTART.md` → `egg/radio-extreme.json`

**Learn all features**
→ `egg/EXTREME-GUIDE.md`

**Customize the look**
→ `webui/README.md` → `webui/style.css`

**Understand logging**
→ `docker/run-enhanced.sh` (lines 50-100)

**See what changed**
→ `egg/IMPROVEMENTS.md`

**Know about attribution**
→ `ATTRIBUTION.md`

**Build custom Docker image**
→ `docker/Dockerfile`

**Upgrade from old version**
→ `egg/MIGRATION.md`

**Troubleshoot issues**
→ `egg/EXTREME-GUIDE.md` (Troubleshooting section)

---

## 📦 Supported Audio Formats

The system supports **11+ audio formats**:

| Format | Extension | Common Use |
|--------|-----------|------------|
| MP3 | .mp3 | Most common, universal support |
| OGG Vorbis | .ogg | Open source, good quality |
| OPUS | .opus | Modern, efficient codec |
| FLAC | .flac | Lossless quality |
| M4A/AAC | .m4a, .aac | Apple/iTunes format |
| WAV | .wav | Uncompressed audio |
| WMA | .wma | Windows Media Audio |
| AIFF | .aiff | Apple uncompressed |
| APE | .ape | Monkey's Audio lossless |
| ALAC | .alac | Apple Lossless |

All formats work in:
- `/music` directory
- `/ads` directory
- `/jingles` directory
- `/playlists/*` directories

---

## 🗑️ Deprecated Files

These files are kept for compatibility but not recommended:

| File | Status | Use Instead |
|------|--------|-------------|
| `egg/radio.json` | Legacy | `egg/radio-extreme.json` |
| `egg/GITHUB_SETUP.md` | Outdated | Already configured |
| `docker/run.sh` | Basic | `docker/run-enhanced.sh` |

---

## 🆕 Recent Additions

Latest improvements to the repository:

### February 2026
- ✨ Created `ATTRIBUTION.md` (separate from license)
- ✨ Enhanced `docker/run-enhanced.sh` with beautiful output
- ✨ Added `webui/` modern interface
- ✨ Expanded format support to 11+ types
- ✨ Fixed logging system (proper file output)
- ✨ Created `FILE-STRUCTURE.md` (this file)

---

## 💡 Organization Tips

### For Maintainers:
1. Keep documentation in sync with code
2. Update version numbers in headers
3. Test all scripts before committing
4. Document breaking changes
5. Keep deprecated files in separate branch

### For Users:
1. Read `QUICKSTART.md` first
2. Don't modify original files directly
3. Keep backups of custom configurations
4. Update environment variables, not code
5. Check logs in `/mnt/server/log/`

---

## 📞 Support Channels

**Questions about files/structure?**
- 📧 Email: wegj1@hotmail.com
- 💬 Discord: @zeropointbruh
- 🌐 Website: https://banabyte.com

**Found a typo/error?**
- Open GitHub issue
- Or email with details

---

## ✅ Quick Reference

| Want to... | File/Folder |
|------------|-------------|
| Install radio server | `egg/radio-extreme.json` |
| Upload music | `/music` |
| Upload ads | `/ads` |
| Upload jingles | `/jingles` |
| View logs | `/log` |
| Customize web UI | `webui/` |
| Check attribution | `ATTRIBUTION.md` |
| Read license | `LICENSE-ENHANCED` |
| Get help | `QUICKSTART.md` |

---

**Last Updated:** February 5, 2026  
**Repository Version:** Extreme Edition v2.0  
**Maintainer:** @zeropointbruh (wegj1@hotmail.com)
