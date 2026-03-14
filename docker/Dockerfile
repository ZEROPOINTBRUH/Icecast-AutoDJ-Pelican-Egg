FROM ubuntu:24.04

LABEL description="Enhanced Icecast AutoDJ Radio Server with multi-playlist, ads, and jingle support"
LABEL version="2.1"
LABEL org.opencontainers.image.source="https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme"
LABEL org.opencontainers.image.licenses="MIT"

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

# Add cleanup script - removes all old files except music/playlists on reinstall
COPY --chown=container:container docker/cleanup-container.sh /usr/local/bin/cleanup-container.sh
RUN chmod +x /usr/local/bin/cleanup-container.sh

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

# Healthcheck for Pelican / container runtime
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/status-json.xsl || exit 1

# Copy entrypoint script
COPY --chown=container:container ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint (Pelican Panel compatible)
ENTRYPOINT ["/entrypoint.sh"]

# Run as container user for Pelican compatibility
USER container
