FROM ubuntu:24.04

LABEL description="Enhanced Icecast AutoDJ Radio Server with multi-playlist, ads, and jingle support"
LABEL version="2.1"

ENV DEBIAN_FRONTEND=noninteractive

# Create container user (required by Pelican Panel)
RUN useradd -m -d /home/container -s /bin/bash container

# Install all dependencies including audio codecs and processing tools
RUN apt-get update && apt-get install -y \
    icecast2 \
    liquidsoap \
    ezstream \
    madplay \
    lame \
    vorbis-tools \
    opus-tools \
    ffmpeg \
    libfdk-aac2 \
    libfdk-aac-dev \
    flac \
    libsamplerate0 \
    libsamplerate0-dev \
    libmad0 \
    libmad0-dev \
    libmp3lame0 \
    libmp3lame-dev \
    libvorbis0a \
    libvorbis-dev \
    libopus0 \
    libopus-dev \
    libavcodec-extra \
    libavformat-dev \
    libavutil-dev \
    libswresample-dev \
    sox \
    libsox-fmt-all \
    git \
    curl \
    wget \
    nano \
    bash \
    coreutils \
    procps \
    findutils \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create cleanup script - removes all old files except music/playlists on reinstall
RUN cat > /usr/local/bin/cleanup-container.sh << 'CLEANUP_EOF'
#!/bin/bash
# Cleanup old container files while preserving user data
# Runs on container startup if UPDATE_CONFIGS environment variable is set

MUSIC_PRESERVE=()
PLAYLISTS_PRESERVE=()

# Backup existing music and playlists
if [ -d /home/container/music ]; then
    MUSIC_PRESERVE=($(find /home/container/music -type f 2>/dev/null))
fi

if [ -d /home/container/playlists ]; then
    PLAYLISTS_PRESERVE=($(find /home/container/playlists -type f 2>/dev/null))
fi

# Remove all config/log files EXCEPT music and playlists
echo "[CLEANUP] Removing old configuration files..."
find /home/container -maxdepth 1 -type f -delete 2>/dev/null || true
rm -rf /home/container/ads /home/container/jingles /home/container/log 2>/dev/null || true
rm -f /home/container/*.conf /home/container/*.xml /home/container/*.liq 2>/dev/null || true

# Recreate directories
mkdir -p /home/container/music
mkdir -p /home/container/playlists
mkdir -p /home/container/ads
mkdir -p /home/container/jingles
mkdir -p /home/container/log
mkdir -p /etc/ezstream

# Restore music files
if [ ${#MUSIC_PRESERVE[@]} -gt 0 ]; then
    echo "[CLEANUP] Restoring ${#MUSIC_PRESERVE[@]} music files..."
    for file in "${MUSIC_PRESERVE[@]}"; do
        [ -f "$file" ] && echo "  ✓ $file" || echo "  ! Missing: $file"
    done
fi

# Restore playlist files
if [ ${#PLAYLISTS_PRESERVE[@]} -gt 0 ]; then
    echo "[CLEANUP] Restoring ${#PLAYLISTS_PRESERVE[@]} playlist files..."
    for file in "${PLAYLISTS_PRESERVE[@]}"; do
        [ -f "$file" ] && echo "  ✓ $file" || echo "  ! Missing: $file"
    done
fi

# Fix permissions
chown -R container:container /home/container
chmod -R 755 /home/container

echo "[CLEANUP] Cleanup complete. Ready for fresh configuration."
CLEANUP_EOF
chmod +x /usr/local/bin/cleanup-container.sh

# Create necessary directories
RUN mkdir -p /home/container \
    && mkdir -p /home/container/music \
    && mkdir -p /home/container/ads \
    && mkdir -p /home/container/jingles \
    && mkdir -p /home/container/playlists \
    && mkdir -p /home/container/log \
    && mkdir -p /etc/ezstream \
    && chown -R container:container /home/container

# Set working directory
WORKDIR /home/container

# Expose Icecast port
EXPOSE 8000

# Copy entrypoint script
COPY --chown=container:container ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint (Pelican Panel compatible)
ENTRYPOINT ["/entrypoint.sh"]
