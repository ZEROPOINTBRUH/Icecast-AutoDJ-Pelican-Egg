#!/bin/bash

###################################################################################
# AutoDJ-Extreme Installation Script
# Created by: @zeropointbruh (wegj1@hotmail.com)
# Website: https://banabyte.com
###################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "╔═══════════════════════════════════════════════════════════════╗"
log_info "║         AutoDJ-Extreme Installation v2.0                     ║"
log_info "║         Created by: @zeropointbruh                            ║"
log_info "╚═══════════════════════════════════════════════════════════════╝"

cd /mnt/server || exit 1

log_info "Downloading AutoDJ-Extreme repository..."
REPO_URL="${REPO_URL:-https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git}"

# Clear any existing repo to force fresh clone
rm -rf repo

if ! git clone --depth 1 "$REPO_URL" repo 2>&1; then
    log_error "Failed to clone repository"
    exit 1
fi

log_info "Repository cloned successfully"
log_info "Latest commit: $(cd repo && git log -1 --oneline)"

log_info "Copying configuration files..."
cp repo/configs/icecast.xml /mnt/server/icecast.xml
cp repo/configs/ezstream.v1.xml /mnt/server/ezstream.xml
cp repo/configs/radio.liq /mnt/server/radio.liq
cp repo/configs/autodj.conf /mnt/server/autodj.conf
cp repo/configs/run-enhanced.sh /mnt/server/run.sh
chmod +x /mnt/server/run.sh

log_info "Setting up directory structure..."
mkdir -p /mnt/server/music
mkdir -p /mnt/server/log
mkdir -p /mnt/server/web
mkdir -p /mnt/server/hls
mkdir -p /mnt/server/recordings
mkdir -p /mnt/server/playlists
touch /mnt/server/playlist.m3u

log_info "Installing modern web interface..."
cp -r repo/web/* /mnt/server/web/

# Optional features
if [ "${ENABLE_ADS}" = "true" ]; then
    log_success "Ads feature ENABLED"
    mkdir -p /mnt/server/ads
    echo "# Place ads here (MP3, OGG, OPUS, FLAC, M4A)" > /mnt/server/ads/README.txt
    echo "# Frequency: Every ${ADS_FREQUENCY:-5} songs" >> /mnt/server/ads/README.txt
fi

if [ "${ENABLE_JINGLES}" = "true" ]; then
    log_success "Jingles feature ENABLED"
    mkdir -p /mnt/server/jingles
    echo "# Place jingles here (MP3, OGG, OPUS, FLAC, M4A)" > /mnt/server/jingles/README.txt
    echo "# Frequency: Every ${JINGLE_FREQUENCY:-3} songs" >> /mnt/server/jingles/README.txt
fi

if [ "${USE_MULTI_PLAYLIST}" = "true" ]; then
    log_success "Multi-Playlist mode ENABLED"
    mkdir -p /mnt/server/playlists/playlist1
    mkdir -p /mnt/server/playlists/playlist2
    mkdir -p /mnt/server/playlists/playlist3
    echo "# Create subdirectories for different playlists" > /mnt/server/playlists/README.txt
fi

# Create helper scripts
cat > /mnt/server/refresh_playlist.sh << 'EOF'
#!/bin/bash
EZSTREAM_PID=$(pgrep ezstream | head -1)
[ -n "$EZSTREAM_PID" ] && kill -SIGHUP $EZSTREAM_PID && echo "Playlist refreshed"
EOF

cat > /mnt/server/skip_track.sh << 'EOF'
#!/bin/bash
EZSTREAM_PID=$(pgrep ezstream | head -1)
[ -n "$EZSTREAM_PID" ] && kill -SIGUSR1 $EZSTREAM_PID && echo "Track skipped"
EOF

chmod +x /mnt/server/refresh_playlist.sh
chmod +x /mnt/server/skip_track.sh

# Cleanup
rm -rf repo

log_success "═══════════════════════════════════════════════════════════════"
log_success "  Installation completed successfully!"
log_success "═══════════════════════════════════════════════════════════════"
echo ""
log_info "Next steps:"
log_info "  1. Upload music to /music directory"
[ "${ENABLE_ADS}" = "true" ] && log_info "  2. Upload ads to /ads directory"
[ "${ENABLE_JINGLES}" = "true" ] && log_info "  3. Upload jingles to /jingles directory"
log_info "  4. Start the server"
echo ""
log_info "Created by @zeropointbruh | https://banabyte.com"

exit 0
