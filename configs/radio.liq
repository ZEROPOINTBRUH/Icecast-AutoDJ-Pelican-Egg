#!/usr/bin/liquidsoap
# AutoDJ-Extreme by @zeropointbruh | github.com/ZEROPOINTBRUH/AutoDJ-Extreme
# Single port configuration - Pelican Panel compatible
# All services run on one port (default: 8000)

set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)

music = playlist("/home/container/playlist.m3u")
radio = mksafe(music)

# Output to Icecast - single port, mount point /autodj
# Note: run-enhanced.sh auto-generates this file with correct env var values
output.icecast(%mp3(bitrate=128), host="localhost", port=8000, password="autodjpassword123", mount="autodj", radio)