# AutoDJ-EXTREME v2.0
## Professional Icecast Radio Station Platform

![Status](https://img.shields.io/badge/status-production-success)
![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Clean, minimal Icecast streaming with Liquidsoap automation**

🎵 **Multi-format audio** • 🎛️ **Professional processing** • 📡 **Automatic playlist rotation** • � **Liquidsoap engine**

---

## ✨ What is AutoDJ-Extreme?

A streamlined, production-ready Icecast radio server powered by Liquidsoap. Default Icecast web interface only - no bloat, just pure streaming.

### 🎵 Audio Formats
- MP3 (64k, 128k, 192k, 320k)
- OGG Vorbis
- OPUS
- FLAC
- WAV
- M4A, AAC, and more

### 🎛️ Smart Audio Engine
- **Liquidsoap 2.0.2**: Same engine as AzuraCast, commercial radio
- **Automatic playlists**: Continuous rotation from your music folder
- **Clean audio**: No artifacts, professional quality
- **Efficient**: Low CPU, works on minimal hardware

### 📡 Simple Streaming
- **One stream endpoint**: `/autodj.mp3`
- **Standard Icecast**: Default web interface
- **Scalable**: Handles thousands of listeners
- **Reliable**: Auto-recovery if processes fail

## 🚀 Quick Start (5 Minutes) - Docker Compose

### 1. Prerequisites
- Docker Desktop installed (v29.2.1+)
- 512MB free memory
- Port 8000 available

### 2. Setup

```bash
# Clone repository
git clone https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git
cd AutoDJ-Extreme

# Create directories
mkdir -p music playlists ads jingles logs configs

# Add your music files
cp /path/to/your/music/*.mp3 music/
```

### 3. Start Services

```bash
# Using docker-compose (recommended)
docker-compose up -d

# Or customize via .env first
cp .env.docker .env
nano .env
docker-compose up -d
```

### 4. Access Your Stream

- **Stream URL**: `http://localhost:8000/autodj`
- **Icecast Web**: `http://localhost:8000`
- **Admin Panel**: `http://localhost:8000/admin`
- **Status JSON**: `http://localhost:8000/status-json.xsl`

### ✨ That's It! Your radio station is live!

**For detailed setup, see:**
- 📖 [Docker Compose Quick Reference](DOCKER_COMPOSE_QUICK.md)
- 📚 [Complete Docker Compose Guide](DOCKER_COMPOSE_GUIDE.md)
- ⚙️ [Configuration Reference](ENVIRONMENT_CONFIG.md)

## Can I Advertise on It?
Yes. Make money on it if you want.

## Is It Reliable?
Yes. Processes auto-restart if they fail. Production-ready.

## 📚 Features

### 🎵 Audio
- **Multi-format support**: MP3, M4A, AAC, OGG, FLAC, OPUS, WAV, WMA
- **Automatic playlists**: Continuous rotation from your music folder
- **Liquidsoap engine**: Professional audio processing
- **High quality**: 320kbps MP3 or lossless FLAC

### 📡 Streaming
- **Single stream endpoint**: `/autodj.mp3`
- **Standard Icecast**: Default web interface
- **Metadata**: Track info to players (ICY)
- **Multiple clients**: Scales to thousands of listeners

### ⚙️ Configuration
- **Environment variables**: Easy setup via `.env` file
- **Docker ready**: One command deployment
- **Systemd support**: Run as Linux service
- **Auto-recovery**: Services restart if they fail

### � Monitoring
- **Icecast admin**: Standard admin interface
- **Status endpoint**: `/status.xsl`
- **Logs**: Detailed logging for troubleshooting
- **Health checks**: Built-in monitoring

## 📦 What's Included

### Docker & Scripts
- `docker/Dockerfile` - Image with all dependencies
- `configs/radio.liq` - Liquidsoap configuration
- `configs/icecast.xml` - Icecast server configuration
- `configs/run-enhanced.sh` - Enhanced startup script
- `scripts/generate-configs.sh` - Configuration generator

### Configuration
- `.env.example` - Configuration template
- `.env.defaults` - Default values
- `CONFIGURATION.md` - Setup guide
- `ENVIRONMENT_CONFIG.md` - Variable reference

## 🗂️ Project Structure

```
AutoDJ-Extreme/
├── configs/
│   ├── radio.liq                # Liquidsoap config
│   ├── icecast.xml              # Icecast config
│   ├── run-enhanced.sh          # Startup script
│   └── ...
├── scripts/
│   └── generate-configs.sh      # Config generator
├── docker/
│   ├── Dockerfile               # Container image
│   └── docker-compose.yml       # Docker Compose
├── music/                       # Your music files
├── logs/                        # Log files
├── .env.example                 # Configuration template
└── README.md                    # This file
```

## 📋 System Requirements

- **OS**: Linux, macOS, or Windows (via Docker)
- **RAM**: 256MB minimum, 512MB recommended
- **CPU**: 1 core
- **Disk**: 1GB minimum (+ music storage)
- **Docker**: Recommended, or native Linux install
- **Port**: 1 port (typically 8000)

## 🔐 Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY!**

- **Admin Username**: `admin`
- **Admin Password**: `adminpassword123`
- **Source Password**: `autodjpassword123`

All can be changed in the `.env` file.

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
