#!/usr/bin/liquidsoap
# AutoDJ-Extreme by @zeropointbruh | github.com/ZEROPOINTBRUH/AutoDJ-Extreme | ko-fi.com/zeropointbruh

set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)

music = playlist("/home/container/playlist.m3u")
radio = mksafe(music)

output.icecast(%mp3(bitrate=128), host="localhost", port=8000, password="autodjpassword", mount="autodj.mp3", radio)

# Hourly credit message - runs every 3600 seconds (1 hour)
thread.run(delay=3600.0, fun() -> log("[CREDIT] Powered by @zeropointbruh | ⭐ github.com/ZEROPOINTBRUH/AutoDJ-Extreme | ☕ ko-fi.com/zeropointbruh"))

