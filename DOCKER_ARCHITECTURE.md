# 🏗️ AutoDJ-Extreme Docker Compose Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE ORCHESTRATION                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            DOCKER NETWORK (autodj-network)             │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │          AutoDJ-Extreme Container               │   │    │
│  │  │                                                   │   │    │
│  │  │  ┌────────────────────────────────────────────┐  │   │    │
│  │  │  │  ICECAST 2.4.x (Port 8000)                │  │   │    │
│  │  │  │  - Streaming server                        │  │   │    │
│  │  │  │  - Mount: /autodj (public=1)              │  │   │    │
│  │  │  │  - Max Clients: 100 (configurable)        │  │   │    │
│  │  │  │  - Bitrate: 192kbps (configurable)        │  │   │    │
│  │  │  │  - Admin interface at :8000/admin         │  │   │    │
│  │  │  └────────────────────────────────────────────┘  │   │    │
│  │  │                      ▲                            │   │    │
│  │  │                      │ (feeds stream to)         │   │    │
│  │  │  ┌────────────────────────────────────────────┐  │   │    │
│  │  │  │  LIQUIDSOAP 2.0.2 (Audio Engine)          │  │   │    │
│  │  │  │  - Playlist rotation                       │  │   │    │
│  │  │  │  - Audio transcoding                       │  │   │    │
│  │  │  │  - Format support: 11+ formats            │  │   │    │
│  │  │  │  - Metadata injection                      │  │   │    │
│  │  │  │  - Auto-recovery on failure               │  │   │    │
│  │  │  └────────────────────────────────────────────┘  │   │    │
│  │  │                      ▲                            │   │    │
│  │  │                      │ (reads music from)        │   │    │
│  │  │  ┌────────────────────────────────────────────┐  │   │    │
│  │  │  │  FFMPEG & AUDIO PROCESSING                 │  │   │    │
│  │  │  │  - Format detection                        │  │   │    │
│  │  │  │  - Transcoding                             │  │   │    │
│  │  │  │  - Codec support                           │  │   │    │
│  │  │  └────────────────────────────────────────────┘  │   │    │
│  │  │                                                   │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  │                                                          │    │
│  │  RESOURCE LIMITS                                        │    │
│  │  ├─ CPU: 1 core (soft: 0.5)                           │    │
│  │  ├─ Memory: 512MB (soft: 256MB)                        │    │
│  │  ├─ Restart: unless-stopped                           │    │
│  │  └─ Health Check: every 30s (40s startup grace)       │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

        ▼

    PORT MAPPING
    
    Host:8000 ────────────► Container:8000 (Icecast)
    
    
        ▼
    
    VOLUME MOUNTING (Data Persistence)
    
    ./music         ───────► /home/container/music         (preserved)
    ./playlists     ───────► /home/container/playlists     (preserved)
    ./ads           ───────► /home/container/ads
    ./jingles       ───────► /home/container/jingles
    ./logs          ───────► /home/container/log
    ./configs       ───────► /home/container/configs (auto-gen)
```

## Data Flow

```
┌──────────────────┐
│  Music Files     │
│  (11+ formats)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  LIQUIDSOAP             │
│  - Generates Playlist    │
│  - Reads music files     │
│  - Transcodes to MP3     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  ICECAST                 │
│  - Receives audio stream │
│  - Injects metadata      │
│  - Broadcasts to clients │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  CLIENT APPLICATIONS             │
│  - Media Players                 │
│  - Web Browsers                  │
│  - Custom Listeners              │
│  - Mobile Apps                   │
└──────────────────────────────────┘
```

## File Structure

```
AutoDJ-Extreme/
│
├── docker-compose.yml              ◄─ MAIN ORCHESTRATION FILE
├── .env.docker                     ◄─ Environment template
├── .env                            ◄─ User configuration (gitignored)
├── .dockerignore                   ◄─ Build optimization
│
├── docker/
│   ├── Dockerfile                  ◄─ Container image definition
│   ├── entrypoint.sh              ◄─ Container startup (UPDATE_CONFIGS logic)
│   ├── run-enhanced.sh             ◄─ Service runner with monitoring
│   └── cleanup-container.sh        ◄─ Smart cleanup utility
│
├── configs/                        ◄─ AUTO-GENERATED (preserved volume)
│   ├── icecast.xml                (generated from .env)
│   ├── radio.liq                  (generated from .env)
│   ├── ezstream.*.xml             (generated from .env)
│   └── [other auto-generated files]
│
├── music/                          ◄─ USER MUSIC (preserved volume)
│   ├── song1.mp3
│   ├── song2.flac
│   └── ...
│
├── playlists/                      ◄─ GENERATED PLAYLISTS (preserved volume)
│   ├── playlist.m3u
│   └── [other playlists]
│
├── ads/                            ◄─ ADVERTISEMENT FILES (optional)
│   └── ad-spot.mp3
│
├── jingles/                        ◄─ JINGLE FILES (optional)
│   └── station-id.mp3
│
├── logs/                           ◄─ SERVICE LOGS (volume mounted)
│   ├── icecast.log
│   ├── liquidsoap.log
│   └── access.log
│
├── scripts/
│   └── generate-configs.sh        ◄─ Config generator (called by startup)
│
└── docs/
    ├── README.md
    ├── DOCKER_COMPOSE_GUIDE.md    ◄─ Complete guide
    ├── DOCKER_COMPOSE_QUICK.md    ◄─ Quick reference
    ├── DEPLOYMENT_CHECKLIST.md    ◄─ Pre-flight checks
    ├── ENVIRONMENT_CONFIG.md      ◄─ All variables
    ├── DOCKER_UPDATES.md          ◄─ Update procedures
    └── DOCKER_COMPOSE_SUMMARY.md  ◄─ This summary
```

## Deployment States

### 1. Fresh Installation
```
docker-compose up -d
    ↓
Download image from registry
    ↓
Create container
    ↓
Mount volumes (empty music/ → /home/container/music)
    ↓
Start services (Icecast + Liquidsoap)
    ↓
Generate configs from .env
    ↓
Generate playlist from music/ (empty = no tracks yet)
    ↓
Running (waiting for music files)
```

### 2. Add Music & Start Streaming
```
cp /path/to/music/*.mp3 ./music/
docker-compose restart
    ↓
Liquidsoap rescans music/
    ↓
Regenerates playlist.m3u
    ↓
Begins streaming automatically
    ↓
Clients connect to :8000/autodj
    ↓
Audio flowing! 🎵
```

### 3. Smart Update (Preserves Data)
```
UPDATE_CONFIGS=true docker-compose up -d --build
    ↓
Rebuild image with latest code
    ↓
Start container with UPDATE_CONFIGS=true
    ↓
Trigger cleanup-container.sh:
  ✓ Backup music/ list
  ✓ Backup playlists/ list
  ✓ Delete old configs ← fresh from .env
  ✓ Delete old logs ← clean slate
  ✓ Delete cache
  ✓ Restore music/ ← PRESERVED
  ✓ Restore playlists/ ← PRESERVED
    ↓
Service starts with fresh config + old music
    ↓
Ready to stream again with latest version
```

## Environment Variable Mapping

```
.env File Variables
    │
    ├─► docker-compose.yml (loads via environment section)
    │        │
    │        ├─► ICECAST_PORT → Icecast listen port
    │        ├─► SOURCE_PASSWORD → Liquidsoap + Icecast auth
    │        ├─► ADMIN_PASSWORD → Admin panel access
    │        ├─► MP3_BITRATE → Stream quality
    │        └─► [22+ other variables]
    │
    ├─► Container Environment
    │        │
    │        └─► /home/container/run-enhanced.sh
    │                 │
    │                 ├─► generate-configs.sh
    │                 │    ├─► Creates /home/container/icecast.xml
    │                 │    └─► Creates /home/container/radio.liq
    │                 │
    │                 ├─► Starts Icecast with icecast.xml
    │                 └─► Starts Liquidsoap with radio.liq
```

## Health Check Flow

```
Every 30 seconds:
    │
    ├─► Docker Health Check Triggered
    │        │
    │        └─► curl http://localhost:8000/status-json.xsl
    │
    ├─ Success? (returns status JSON)
    │    └─► Health Status = "healthy"
    │
    └─ Failure? (connection refused or error)
         └─► Retries up to 3 times
             └─ Still failing?
                └─► Container marked as "unhealthy"
                    └─► May trigger restart policy
```

## Logging Architecture

```
┌─────────────────────────────────────────┐
│    Service Logs (inside container)      │
├─────────────────────────────────────────┤
│                                          │
│  /home/container/log/                   │
│  ├─ icecast.log (Icecast errors)        │
│  ├─ liquidsoap.log (Liquidsoap debug)   │
│  ├─ access.log (Client connections)     │
│  └─ liquidsoap-output.log               │
│                                          │
└─────────────────────────────────────────┘
         ▲
         │ (volume mount)
         │
┌─────────────────────────────────────────┐
│   Host Machine ./logs/                  │
│   (accessible from host)                │
└─────────────────────────────────────────┘
         ▲
         │
┌─────────────────────────────────────────┐
│   docker-compose logs autodj            │
│   (Docker logs + container STDOUT)      │
└─────────────────────────────────────────┘
```

## Network Architecture

```
┌─────────────────────────────────────────┐
│   Docker Bridge Network                 │
│   (autodj-network)                      │
│                                          │
│   ┌──────────────────────────────────┐  │
│   │  autodj container                │  │
│   │  IP: 172.20.0.2 (example)        │  │
│   │  Port: 8000 (internal)           │  │
│   └──────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
         ▲
         │ (port mapping)
         │
┌─────────────────────────────────────────┐
│   Host Machine                          │
│   127.0.0.1:8000                        │
│   (accessible from browser)             │
└─────────────────────────────────────────┘
```

## Smart Update Mechanism

```
BEFORE:                      AFTER:
┌────────────────┐          ┌────────────────┐
│ configs/       │          │ configs/ (NEW) │  ← Fresh from .env
│ - icecast.xml │          │ - icecast.xml  │
│ - radio.liq   │    Update │ - radio.liq    │
│ - old files   │ ───────►  │ - (no old!)    │
└────────────────┘          └────────────────┘

┌────────────────┐          ┌────────────────┐
│ music/         │          │ music/         │
│ - song1.mp3   │          │ - song1.mp3    │  ◄─ PRESERVED
│ - song2.flac  │    ────►  │ - song2.flac   │  ◄─ PRESERVED
│ (preserved!)  │          │ (preserved!)   │
└────────────────┘          └────────────────┘

┌────────────────┐          ┌────────────────┐
│ logs/          │          │ logs/ (CLEAN)  │  ← Fresh start
│ - icecast.log │          │ - (empty)      │
│ - old entries │    ───►   │ (new logs)     │
└────────────────┘          └────────────────┘
```

---

**Version**: 2.0  
**Architecture**: Docker Compose + Icecast + Liquidsoap  
**Created**: March 12, 2026  
**Maintained by**: @zeropointbruh
