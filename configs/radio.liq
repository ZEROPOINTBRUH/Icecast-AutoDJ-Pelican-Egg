#!/usr/bin/liquidsoap

# AutoDJ-EXTREME by @zeropointbruh
# github.com/ZEROPOINTBRUH/AutoDJ-Extreme | ko-fi.com/zeropointbruh

set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)

# Main playlist source
music = playlist("/home/container/playlist.m3u")

# Make source infallible (safe for streaming)
radio = mksafe(music)



###################################################################################
# OUTPUT STREAMS - Multiple Formats
###################################################################################

# MP3 128k output
output.icecast(
  %mp3(bitrate=128),
  host="localhost",
  port=8000,
  password="autodjpassword",
  mount="autodj.mp3",
  radio
)

