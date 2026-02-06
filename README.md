# AutoDJ-EXTREME v2.0
## Enterprise-Grade Professional Radio Station Platform

![Status](https://img.shields.io/badge/status-production-success)
![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**The most advanced AutoDJ platform for Pelican/Pterodactyl Panel**

🎵 **13 simultaneous stream formats** • 🎛️ **Professional audio processing** • 🌐 **Modern Spotify-style web UI** • ⏰ **Time-based scheduling** • 📡 **REST API** • 🎙️ **Live DJ support**

---

## ✨ What Makes This EXTREME?

### 🚀 Powered by Liquidsoap (Not ezstream!)
This is the **ONLY** Pelican/Pterodactyl egg using **Liquidsoap** - the same engine that powers AzuraCast and commercial radio stations.

### 🎨 Beautiful Spotify-Grade Web UI
- Modern dark theme with gradient effects
- Real-time now playing display
- Admin controls (skip tracks, refresh playlists)
- Live statistics dashboard
- One-click stream URL copying
- Mobile responsive design

### 🎵 13 Simultaneous Output Streams
- **MP3**: 64k, 128k, 192k, 320k
- **OGG Vorbis**: Q5 (~160k), Q8 (~256k)
- **AAC**: 128k standard, 64k HE-AAC mobile
- **OPUS**: 96k, 128k HQ
- **FLAC**: Lossless audiophile quality
- **HLS**: Apple TV/iOS/Safari streaming

### 🎛️ Broadcast-Grade Audio Processing
- Professional 3-band EQ
- Multiband compression
- ReplayGain normalization
- Stereo enhancement
- Peak limiting
- Smart crossfading (4 seconds)
- Loudness normalization (-13 LUFS)

### ⏰ Advanced Features
- Time-based playlist scheduling
- Song request system
- Automatic recording & archiving
- Station ID insertion (top of hour)
- Ads/jingles rotation
- Live DJ input support
- REST API for automation

## 🚀 Quick Start (5 Minutes)

### 1. Import the Egg
```bash
https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/raw/main/egg/radio-extreme.json
```

### 2. Create Server
- **Lazy mode**: Just click through - all defaults are set!
- **Secure mode**: Change the default passwords (they have "CHANGE THIS!" warnings)

### 3. Upload Music
- Upload any audio format (MP3, M4A, FLAC, OGG, etc.) to `/music` folder
- Optionally add ads to `/ads` and jingles to `/jingles`

### 4. Start & Access
- **Web UI**: `http://YOUR_IP:PORT/`
- **Admin Panel**: `http://YOUR_IP:PORT/admin/`
- **Streams**: Click any format in the web UI

### 5. Done! 🎉
Your professional radio station is live with 13+ stream formats!

## Can I Advertise on It?
Hell yeah, make money on it. I'm not a huge financial nerd.

## Can NASA Hear It?
Become a popular first nerd and on the double.

## 📚 Complete Features List

### 🎵 Audio Features
- **Multi-format support**: MP3, M4A, AAC, OGG, FLAC, OPUS, WAV, WMA
- **Mixed format playlists**: Play different formats in same playlist
- **Professional processing**: EQ, compression, normalization
- **Smart crossfading**: 4-second intelligent transitions
- **ReplayGain**: Consistent volume across tracks
- **Stereo enhancement**: Wider stereo image

### ⏰ Scheduling & Automation
- **Time-based playlists**: Different playlists for morning/day/evening/night
- **Station IDs**: Auto-play at top of hour
- **Ads rotation**: Play ad every X songs (configurable)
- **Jingles**: Play jingle every X songs (configurable)
- **Request queue**: Listener song requests

### 🌐 Web Interface
- **Modern UI**: Spotify-style dark theme
- **Real-time updates**: Auto-refresh every 5 seconds
- **Admin controls**: Skip tracks, refresh playlists
- **Stream manager**: All formats with copy buttons
- **Statistics**: Listeners, uptime, bitrate
- **Mobile responsive**: Works on all devices

### 📡 Streaming
- **13 simultaneous formats**: MP3, OGG, AAC, OPUS, FLAC, HLS
- **Adaptive bitrates**: 64k to 320k MP3
- **HLS streaming**: Apple devices compatible
- **ICY metadata**: Song info to players
- **Multiple mount points**: Choose your format

### 🎙️ Live Broadcasting
- **Harbor input**: DJ can connect on port 8001
- **Seamless switching**: Auto-fallback to AutoDJ
- **Same processing**: Live audio gets same quality
- **Metadata support**: Update track info live

### 🔧 Administration
- **REST API**: Full remote control
- **Telnet server**: Advanced control (port 1234)
- **Health monitoring**: `/api/health` endpoint
- **Statistics API**: `/api/stats` endpoint
- **Recording**: Automatic hourly archives
- **Track logging**: Full playback history

### ⚙️ Easy Configuration
- **autodj.conf**: Simple config file for beginners
- **Environment variables**: Panel-based configuration
- **Sensible defaults**: Works out of the box
- **No technical knowledge required**: Plain English settings

## 📦 What's Included

### Pterodactyl/Pelican Eggs
- `egg/radio.json` - Original (legacy)
- `egg/radio-improved.json` - Enhanced version
- `egg/radio-extreme.json` - **🔥 EXTREME EDITION** (recommended)

### Docker & Scripts
- `docker/Dockerfile` - Custom image with all dependencies
- `docker/run-enhanced.sh` - Beautiful output & logging
- `icecast-autodj-backup/` - Preserved original repo

### Web Interface
- `webui/` - Modern player UI with visualizer

### Legal
- `LICENSE` - MIT License
- `LICENSE-ENHANCED` - Enhanced terms
- `ATTRIBUTION.md` - Commercial use requirements

## 🗂️ Project Structure

```
AutoDJ-Extreme/
├── egg/
│   └── radio-extreme.json       # Pelican/Pterodactyl egg
├── docker/
│   ├── Dockerfile               # Liquidsoap + all dependencies
│   └── entrypoint.sh            # Container entrypoint
├── configs/
│   ├── radio.liq                # Liquidsoap configuration (528 lines)
│   ├── icecast.xml              # Icecast server config
│   ├── run-enhanced.sh          # Startup script (557 lines)
│   ├── autodj.conf              # Simple user config
│   └── install.sh               # Installation script
├── web/
│   ├── index.html               # Modern web UI
│   ├── style.css                # Spotify-style theme
│   └── app.js                   # Control panel logic
└── README.md                    # You are here
```

## 📋 System Requirements

- **Panel**: Pelican Panel or Pterodactyl Panel
- **RAM**: 512MB minimum, 1GB recommended
- **CPU**: 1 core minimum, 2+ cores for multiple streams
- **Disk**: 2GB minimum (more for recordings)
- **Docker**: Required (provided by panel)
- **Port**: 1 port assigned by panel

## 🔌 Port Configuration

**ONE port does everything:**
- All 13 stream formats
- Web control panel
- Admin interface
- REST API
- HLS streaming
- Statistics

**Optional second port** for live DJ input (requires manual setup)

## 🎨 Web UI Screenshots

**Access**: `http://YOUR_IP:PORT/`

### Features:
- **Dashboard**: Now playing, stats, quick controls
- **Streams**: All 13 formats with copy buttons
- **Queue**: Upcoming tracks
- **Stats**: Detailed analytics
- **Settings**: Station configuration

### Admin Controls:
- ⏭️ Skip current track
- 🔄 Refresh playlist
- 📊 View live statistics
- 📋 Copy stream URLs

## 🔐 Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY!**

- **Admin Username**: `admin`
- **Admin Password**: `adminpassword123`
- **Source Password**: `autodjpassword123`
- **Relay Password**: `relaypassword123`

All can be changed in Pelican Panel during server creation.

## 📡 Stream URLs

After starting, access your streams at:

```
MP3 64k:   http://YOUR_IP:PORT/autodj-64.mp3
MP3 128k:  http://YOUR_IP:PORT/autodj-128.mp3
MP3 192k:  http://YOUR_IP:PORT/autodj-192.mp3
MP3 320k:  http://YOUR_IP:PORT/autodj-320.mp3
OGG:       http://YOUR_IP:PORT/autodj.ogg
OGG HQ:    http://YOUR_IP:PORT/autodj-hq.ogg
AAC:       http://YOUR_IP:PORT/autodj.aac
AAC+ Mobile: http://YOUR_IP:PORT/autodj-mobile.aac
OPUS:      http://YOUR_IP:PORT/autodj.opus
OPUS HQ:   http://YOUR_IP:PORT/autodj-hq.opus
FLAC:      http://YOUR_IP:PORT/autodj.flac
HLS:       http://YOUR_IP:PORT/hls/live.m3u8
```

## 🛠️ Configuration Files

### For Beginners: `autodj.conf`
Simple configuration file with plain English:
```bash
STATION_NAME="AutoDJ Extreme Radio"
ENABLE_ADS=true
ADS_FREQUENCY=5
ENABLE_CROSSFADE=true
```

### For Advanced Users: `radio.liq`
Full Liquidsoap configuration (528 lines) with:
- Audio processing chain
- Scheduling logic
- Stream output configuration
- API endpoints
- Recording settings

## 🔧 REST API

### Endpoints:
- `GET /api/health` - Server health check
- `GET /api/stats` - Stream statistics
- `GET /api/request?uri=FILE` - Request a song
- `GET /status-json.xsl` - Icecast stats (JSON)
- `GET /now_playing.json` - Current track metadata

### Examples:
```bash
# Check server health
curl http://YOUR_IP:PORT/api/health

# Get statistics
curl http://YOUR_IP:PORT/api/stats

# Request a song
curl "http://YOUR_IP:PORT/api/request?uri=file:///music/song.mp3"
```

## 📝 Easy Config Example

### Time-Based Playlists:
```
/playlists/morning.m3u    # 6am-10am
/playlists/daytime.m3u    # 10am-6pm
/playlists/evening.m3u    # 6pm-10pm
/playlists/night.m3u      # 10pm-6am
```

### Folder Structure:
```
/home/container/
├── music/              # Main music library
├── ads/                # Advertisement audio
├── jingles/            # Station IDs
├── playlists/          # Time-based playlists
├── recordings/         # Auto-recorded streams
├── hls/                # HLS segments
├── log/                # Server logs
└── web/                # Web interface
```

## 👤 Created By

**@zeropointbruh**  
📧 Email: wegj1@hotmail.com  
💬 Discord: @zeropointbruh  
🌐 Website: https://banabyte.com

### Commercial Use?
If you use the extreme edition commercially, please credit @zeropointbruh.  
See `LICENSE-ENHANCED` for details.

## MIT License
Copyright (c) 2022 Banabyte Network  
Enhanced Edition © 2026 @zeropointbruh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM,
OUT OF, OR IN CONNECTION WITH THE SOFTWARE, OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## For People Who Don't Understand Humor or Are Too Lazy to Read the License
It means, "Forget you; I'm not responsible. Do this at your own risk. I'm not a rocket scientist."
