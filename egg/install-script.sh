#!/bin/bash

set -ex

echo "==========================================="
echo "AutoDJ-Extreme Installation v2.0"
echo "Created by: @zeropointbruh"
echo "==========================================="
echo ""

echo "[1/6] Checking environment..."
cd /mnt/server || { echo "ERROR: Cannot access /mnt/server"; exit 1; }
echo "Working directory: $(pwd)"
echo "Git version: $(git --version)"
echo ""

echo "[2/6] Cloning repository..."
REPO_URL="${REPO_URL:-https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git}"
echo "Repository: $REPO_URL"
rm -rf repo
git clone --depth 1 "$REPO_URL" repo || { echo "ERROR: Git clone failed"; exit 1; }
echo "Clone successful!"
echo "Latest commit: $(cd repo && git log -1 --oneline)"
echo ""

echo "[3/6] Verifying files..."
ls -la repo/configs/ || { echo "ERROR: configs directory not found"; exit 1; }
echo ""

echo "[4/6] Copying configuration files..."
cp -v repo/configs/icecast.xml /mnt/server/icecast.xml
cp -v repo/configs/ezstream.v1.xml /mnt/server/ezstream.xml
cp -v repo/configs/radio.liq /mnt/server/radio.liq
cp -v repo/configs/run-enhanced.sh /mnt/server/run.sh
chmod +x /mnt/server/run.sh
echo ""
echo "Verifying radio.liq was copied..."
if [ ! -f /mnt/server/radio.liq ]; then
    echo "ERROR: radio.liq not found after copy!"
    exit 1
fi
echo "radio.liq exists: $(wc -c < /mnt/server/radio.liq) bytes"
echo "Config files copied successfully"
echo ""

echo "[5/6] Creating directory structure..."
mkdir -p /mnt/server/music
mkdir -p /mnt/server/log
mkdir -p /mnt/server/web
touch /mnt/server/playlist.m3u
echo "Directories created"
echo ""

echo "Installing modern web interface..."
cp -v repo/web/*.html /mnt/server/web/
cp -v repo/web/*.css /mnt/server/web/
cp -v repo/web/*.js /mnt/server/web/
cp -v repo/web/*.json /mnt/server/web/ 2>/dev/null || true
echo "Web UI installed successfully"
echo ""

if [ "${ENABLE_ADS}" = "true" ]; then
    echo "Setting up ads directory..."
    mkdir -p /mnt/server/ads
    echo "# Place ads here (MP3, OGG, OPUS, FLAC, M4A)" > /mnt/server/ads/README.txt
fi

if [ "${ENABLE_JINGLES}" = "true" ]; then
    echo "Setting up jingles directory..."
    mkdir -p /mnt/server/jingles
    echo "# Place jingles here (MP3, OGG, OPUS, FLAC, M4A)" > /mnt/server/jingles/README.txt
fi

if [ "${USE_MULTI_PLAYLIST}" = "true" ]; then
    echo "Setting up multi-playlist directories..."
    mkdir -p /mnt/server/playlists/playlist1
    mkdir -p /mnt/server/playlists/playlist2
    mkdir -p /mnt/server/playlists/playlist3
fi

echo "[6/6] Creating helper scripts..."
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
echo "Helper scripts created"
echo ""

echo "Cleaning up..."
rm -rf repo
echo ""

echo "==========================================="
echo "Installation completed successfully!"
echo "==========================================="
echo "Next steps:"
echo "  1. Upload music to /music directory"
echo "  2. Start the server"
echo ""
echo "Created by @zeropointbruh | https://banabyte.com"

exit 0
