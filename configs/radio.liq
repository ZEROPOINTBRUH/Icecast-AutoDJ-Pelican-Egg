#!/usr/bin/liquidsoap

###################################################################################
# AutoDJ-Extreme Liquidsoap Configuration
# Advanced multi-format streaming with professional features
# Created by: @zeropointbruh (wegj1@hotmail.com)
###################################################################################

# Set logging
set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)

# Server settings
icecast_host = "localhost"
icecast_port = 8000
icecast_password = "autodjpassword"

###################################################################################
# AUDIO SOURCES
###################################################################################

# Main music playlist
music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlist.m3u"
)

# Ads playlist (if enabled)
ads = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/ads.m3u"
)

# Jingles playlist (if enabled)
jingles = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/jingles.m3u"
)

# Emergency fallback (silence)
emergency = single("/home/container/silence.mp3")

###################################################################################
# AUDIO PROCESSING
###################################################################################

# Normalize audio levels across all tracks
music = normalize(music)
ads = normalize(ads)
jingles = normalize(jingles)

# Add smooth crossfading between tracks (3 second fade)
music = crossfade(duration=3.0, music)

# Smart track switching with ads and jingles
# Play ad every 5 songs
music_with_ads = rotate(weights=[5,1], [music, ads])

# Play jingle every 3 songs
radio = rotate(weights=[3,1], [music_with_ads, jingles])

# Apply audio normalization and compression
radio = normalize(target=-14.0, radio)
radio = compress(radio)

# Fallback chain (radio -> emergency)
radio = fallback(track_sensitive=false, [radio, emergency])

###################################################################################
# LIVE INPUT (DJ Override)
###################################################################################

# Live input from harbor (DJ can connect to stream live)
live = input.harbor(
  "live",
  port=8001,
  password="livepassword",
  buffer=5.0,
  max=20.0
)

# When live source is available, switch to it
radio = fallback(track_sensitive=false, [live, radio])

###################################################################################
# OUTPUT STREAMS - Multiple Formats
###################################################################################

# MP3 128kbps - Maximum compatibility
output.icecast(
  %mp3(bitrate=128, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-128.mp3",
  name="AutoDJ Radio - MP3 128k",
  description="AutoDJ Extreme Radio Stream",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

# MP3 64kbps - Mobile/Low bandwidth
output.icecast(
  %mp3(bitrate=64, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-64.mp3",
  name="AutoDJ Radio - MP3 64k (Mobile)",
  description="AutoDJ Extreme Radio Stream - Mobile Quality",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

# MP3 192kbps - High quality
output.icecast(
  %mp3(bitrate=192, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-192.mp3",
  name="AutoDJ Radio - MP3 192k (HQ)",
  description="AutoDJ Extreme Radio Stream - High Quality",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

# OGG Vorbis 128kbps - Better quality than MP3
output.icecast(
  %vorbis(quality=0.5, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.ogg",
  name="AutoDJ Radio - OGG Vorbis",
  description="AutoDJ Extreme Radio Stream - OGG Format",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

# AAC 128kbps - Modern codec, iOS/Safari compatible
output.icecast(
  %fdkaac(bitrate=128, samplerate=44100, afterburner=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.aac",
  name="AutoDJ Radio - AAC",
  description="AutoDJ Extreme Radio Stream - AAC Format",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

# OPUS - Best quality/bitrate ratio, modern browsers
output.icecast(
  %opus(bitrate=96, samplerate=48000),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.opus",
  name="AutoDJ Radio - OPUS",
  description="AutoDJ Extreme Radio Stream - OPUS Format",
  genre="Various",
  url="http://localhost:8000",
  public=false,
  radio
)

###################################################################################
# METADATA AND TELNET
###################################################################################

# Enable telnet server for remote control
server.telnet(port=1234)

# Log important events
def log_metadata(m) =
  log("Now playing: #{m["artist"]} - #{m["title"]}")
end

radio = on_metadata(log_metadata, radio)
