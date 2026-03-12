#!/usr/bin/liquidsoap
# Enhanced AutoDJ - Single port configuration

set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)

music = playlist("/home/container/playlist.m3u")

# Log track changes to console and file
def on_track_change(m) =
  title = m["title"]
  artist = m["artist"]
  filename = m["filename"]
  log("NOW PLAYING: #{artist} - #{title} [#{filename}]")
  system("echo \"$(date '+%Y-%m-%d %H:%M:%S') NOW PLAYING: #{artist} - #{title} [#{filename}]\" >> /home/container/log/track-history.log")
end

# Apply safety wrapper and register track change callback
radio = mksafe(music)
radio.on_track(on_track_change)

# Output to Icecast - single port, mount point /autodj
output.icecast(%mp3(bitrate=128), host="localhost", port=8000, password="autodjpassword123", mount="autodj", radio)