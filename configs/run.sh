#!/bin/bash

# Generate playlist from music directory with proper quoting
find /home/container/music/ -type f -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.flac" | sort > /home/container/playlist.m3u

# Check if playlist is empty
if [ ! -s /home/container/playlist.m3u ]; then
    echo "ERROR: No music files found in /home/container/music/" >&2
    exit 1
fi

# Start Icecast server
/usr/bin/icecast2 -b -c "/home/container/icecast.xml"
sleep 5

# Start ezstream (requires ezstream.xml to exist)
if [ ! -f "/home/container/ezstream.xml" ]; then
    echo "ERROR: ezstream.xml not found!" >&2
    exit 1
fi

/usr/bin/ezstream -c "/home/container/ezstream.xml"