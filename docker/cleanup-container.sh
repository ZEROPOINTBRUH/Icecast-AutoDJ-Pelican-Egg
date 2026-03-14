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
