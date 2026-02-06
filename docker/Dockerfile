FROM ubuntu:22.04

LABEL maintainer="zeropointbruh <wegj1@hotmail.com>"
LABEL description="Enhanced Icecast AutoDJ Radio Server with multi-playlist, ads, and jingle support"
LABEL version="2.0"

ENV DEBIAN_FRONTEND=noninteractive

# Create container user (required by Pelican Panel)
RUN useradd -m -d /home/container -s /bin/bash container

# Install all dependencies
RUN apt-get update && apt-get install -y \
    icecast2 \
    ezstream \
    madplay \
    lame \
    vorbis-tools \
    opus-tools \
    ffmpeg \
    git \
    curl \
    wget \
    nano \
    bash \
    coreutils \
    procps \
    findutils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /home/container \
    && mkdir -p /home/container/music \
    && mkdir -p /home/container/ads \
    && mkdir -p /home/container/jingles \
    && mkdir -p /home/container/playlists \
    && mkdir -p /home/container/log \
    && mkdir -p /etc/ezstream

# Set working directory
WORKDIR /home/container

# Expose Icecast port
EXPOSE 8000

# Copy entrypoint script
COPY --chown=container:container ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint (Pelican Panel compatible)
ENTRYPOINT ["/entrypoint.sh"]
