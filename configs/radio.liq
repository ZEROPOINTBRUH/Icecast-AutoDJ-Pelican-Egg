#!/usr/bin/liquidsoap

# AutoDJ-EXTREME - Created by @zeropointbruh
# Star: github.com/ZEROPOINTBRUH/AutoDJ-Extreme | Donate: ko-fi.com/zeropointbruh

# SETTINGS
set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)
set("server.timeout", 30.0)

icecast_host = "localhost"
icecast_port = 8000
icecast_password = "autodjpassword"
station_name = "AutoDJ Extreme Radio"
station_url = "http://localhost:8000"
station_description = "Professional AutoDJ Radio Station"
station_genre = "Various"

###################################################################################
# REQUEST SYSTEM - Listeners can request songs
###################################################################################

# Request queue system
requests = request.queue(id="requests")

###################################################################################
# TIME-BASED SCHEDULING
###################################################################################

# Main playlist
music = playlist(mode="randomize", reload_mode="watch", "/home/container/playlist.m3u")

# Optional playlists
ads = playlist(mode="randomize", "/home/container/ads")
jingles = playlist(mode="randomize", "/home/container/jingles")

# Simple audio processing
music = crossfade(music)
music = normalize(music)

# Build source
radio = fallback(track_sensitive=true, [requests, music])
radio = normalize(radio)



###################################################################################
# OUTPUT STREAMS - Multiple Formats
###################################################################################

# MP3 128kbps - Maximum compatibility
output.icecast(
  %mp3(bitrate=128, samplerate=44100, stereo=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-128.mp3",
  name=station_name ^ " - MP3 128k",
  description=station_description,
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# MP3 64kbps - Mobile/Low bandwidth
output.icecast(
  %mp3(bitrate=64, samplerate=44100, stereo=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-64.mp3",
  name=station_name ^ " - MP3 64k (Mobile)",
  description=station_description ^ " - Mobile",
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# MP3 192kbps - High quality
output.icecast(
  %mp3(bitrate=192, samplerate=44100, stereo=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-192.mp3",
  name=station_name ^ " - MP3 192k (HQ)",
  description=station_description ^ " - High Quality",
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# MP3 320kbps - Highest quality
output.icecast(
  %mp3(bitrate=320, samplerate=44100, stereo=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-320.mp3",
  name=station_name ^ " - MP3 320k (Studio)",
  description=station_description ^ " - Studio Quality",
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# OGG Vorbis Q5 (~160kbps) - Better quality than MP3
output.icecast(
  %vorbis(quality=0.5, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.ogg",
  name=station_name ^ " - OGG Vorbis",
  description=station_description ^ " - OGG Format",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)

# OGG Vorbis Q8 (~256kbps) - High quality
output.icecast(
  %vorbis(quality=0.8, samplerate=44100),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-hq.ogg",
  name=station_name ^ " - OGG Vorbis HQ",
  description=station_description ^ " - OGG High Quality",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)

# AAC 128kbps - Modern codec with FDK-AAC
output.icecast(
  %ffmpeg(format="adts", %audio(codec="aac", b="128k", samplerate=44100)),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.aac",
  name=station_name ^ " - AAC",
  description=station_description ^ " - AAC Format",
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# AAC+ 64kbps HE-AAC for mobile
output.icecast(
  %ffmpeg(format="adts", %audio(codec="aac", b="64k", profile="aac_he", samplerate=44100)),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-mobile.aac",
  name=station_name ^ " - AAC+ Mobile",
  description=station_description ^ " - HE-AAC Mobile",
  genre=station_genre,
  url=station_url,
  public=false,
  icy_metadata="true",
  radio
)

# OPUS 96kbps - Best quality/bitrate ratio
output.icecast(
  %opus(bitrate=96, samplerate=48000),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.opus",
  name=station_name ^ " - OPUS",
  description=station_description ^ " - OPUS Format",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)

# OPUS 128kbps - High quality
output.icecast(
  %opus(bitrate=128, samplerate=48000),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-hq.opus",
  name=station_name ^ " - OPUS HQ",
  description=station_description ^ " - OPUS High Quality",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)

# FLAC - Lossless streaming
output.icecast(
  %ogg(%flac),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.flac",
  name=station_name ^ " - FLAC Lossless",
  description=station_description ^ " - Lossless Audio",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)



# Remote control
server.telnet(port=1234)

# Credit: Powered by @zeropointbruh | github.com/ZEROPOINTBRUH/AutoDJ-Extreme | ko-fi.com/zeropointbruh
thread.run(delay=3600.0, fun() -> log("[SYS] AutoDJ-Extreme by @zeropointbruh"))
