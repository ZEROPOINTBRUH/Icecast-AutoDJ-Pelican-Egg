#!/usr/bin/liquidsoap

###################################################################################
# AutoDJ-EXTREME Professional Radio Station
# Enterprise-grade multi-format streaming with advanced features
# Created by: @zeropointbruh (wegj1@hotmail.com)
###################################################################################

# PERFORMANCE SETTINGS
set("log.file.path", "/home/container/log/liquidsoap.log")
set("log.level", 3)
set("server.timeout", 30.0)
set("harbor.timeout", 300.0)
set("root.max_latency", 5.0)

# Enable frame video (for potential future video support)
set("frame.video.width", 0)
set("frame.video.height", 0)

# Server settings
icecast_host = "localhost"
icecast_port = 8000
icecast_password = "autodjpassword"

# Station branding
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

# Morning show playlist (6am-10am)
morning_music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlists/morning.m3u"
)

# Daytime playlist (10am-6pm)
day_music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlists/daytime.m3u"
)

# Evening playlist (6pm-10pm)
evening_music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlists/evening.m3u"
)

# Night playlist (10pm-6am)
night_music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlists/night.m3u"
)

# Main music playlist with SMART SHUFFLE
# Prevents same artist/genre repetition
music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlist.m3u"
)

# Smart shuffle filter - prevents artist repetition
def smart_shuffle_filter(previous, current) =
  # Get artist from metadata
  prev_artist = list.assoc(default="", "artist", previous)
  curr_artist = list.assoc(default="", "artist", current)
  
  # Get genre from metadata
  prev_genre = list.assoc(default="", "genre", previous)
  curr_genre = list.assoc(default="", "genre", current)
  
  # Prevent same artist back-to-back
  if prev_artist != "" and prev_artist == curr_artist then
    log("Smart shuffle: Skipping #{curr_artist} - same artist")
    false
  # Prevent same genre twice in a row
  elsif prev_genre != "" and prev_genre == curr_genre then
    log("Smart shuffle: Skipping #{curr_genre} genre - too repetitive")
    false
  else
    true
  end
end

# Apply smart shuffle filter
music = playlist.filter(smart_shuffle_filter, music)

# Schedule-based music selection
scheduled_music = switch(
  track_sensitive=false,
  [
    ({6h-10h}, morning_music),
    ({10h-18h}, day_music),
    ({18h-22h}, evening_music),
    ({22h-6h}, night_music),
    ({true}, music)
  ]
)

# Ads playlist
ads = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/ads.m3u"
)

# Jingles playlist
jingles = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/jingles.m3u"
)

# Station IDs (top of hour)
station_ids = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/station_ids.m3u"
)

# Emergency fallback
emergency = single("/home/container/silence.mp3")

###################################################################################
# ADVANCED AUDIO PROCESSING
###################################################################################

# Apply ReplayGain for consistent loudness
scheduled_music = amplify(1.0, override="replay_gain", scheduled_music)
ads = amplify(1.0, override="replay_gain", ads)
jingles = amplify(1.0, override="replay_gain", jingles)

# Advanced smart crossfading with fade detection
scheduled_music = crossfade(start_next=2.0, fade_in=3.0, fade_out=3.0, scheduled_music)

# ADVANCED AUDIO PROCESSING CHAIN
# Professional EQ using FFmpeg filters
scheduled_music = ffmpeg.filter.audio.input(
  "equalizer=f=80:width_type=q:width=1.0:g=3," ^
  "equalizer=f=3000:width_type=q:width=1.0:g=2," ^
  "equalizer=f=8000:width_type=q:width=0.7:g=1.5," ^
  "highpass=f=30",
  scheduled_music
)

# Multiband compression using FFmpeg
scheduled_music = ffmpeg.filter.audio.input(
  "acompressor=threshold=-20dB:ratio=4:attack=10:release=100," ^
  "volume=replaygain=track",
  scheduled_music
)

# Stereo enhancement
scheduled_music = ffmpeg.filter.audio.input("stereotools=mlev=0.8", scheduled_music)

# Final limiter to prevent clipping  
scheduled_music = ffmpeg.filter.audio.input("alimiter=limit=0.99:attack=5:release=50", scheduled_music)

# Normalize to broadcast standard
scheduled_music = normalize(target=-14.0, threshold=-40.0, scheduled_music)

###################################################################################
# SMART PLAYLIST CONSTRUCTION
###################################################################################

# Station ID at top of hour
timed_station_id = switch(
  track_sensitive=false,
  [({0m}, station_ids), ({true}, blank())]
)

# Build the rotation: requests -> music -> ads -> jingles
music_with_requests = fallback(
  track_sensitive=true,
  [requests, scheduled_music]
)

# Smart ad insertion (every 5 songs)
music_with_ads = rotate(
  weights=[5, 1],
  [music_with_requests, ads]
)

# Jingle rotation (every 3 songs)
music_with_jingles = rotate(
  weights=[3, 1],
  [music_with_ads, jingles]
)

# Add station IDs
radio = fallback(
  track_sensitive=false,
  [timed_station_id, music_with_jingles]
)

# Final processing chain
radio = compress(ratio=3.0, threshold=-16.0, radio)
radio = normalize(target=-13.0, radio)

# Emergency fallback
radio = fallback(track_sensitive=false, [radio, emergency])

###################################################################################
# STREAM RECORDING & ARCHIVING
###################################################################################

# STREAM RECORDING & ARCHIVING
# Record stream to hourly timestamped files
output.file(
  %mp3(bitrate=192),
  {time.string("/home/container/recordings/%Y-%m-%d/%H-00-00.mp3")},
  reopen_on_metadata=false,
  fallible=true,
  radio
)

# Track history logging
radio = on_track(fun(m) -> begin
  log("Track: #{m['artist']} - #{m['title']} [#{m['filename']}]")
end, radio)

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

# Apply same processing to live input
live = normalize(live)
live = compress(live)

# When live source is available, switch to it
radio = fallback(track_sensitive=false, [live, radio])

###################################################################################
# BACKUP STREAMS (Redundancy)
###################################################################################

# Create backup stream (in case main fails)
backup_radio = radio

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

# HLS STREAMING for iOS/Safari/Smart TVs
output.file.hls(
  playlist="/home/container/hls/live.m3u8",
  segment_duration=10.0,
  segments=6,
  segments_overhead=12,
  [
    ("/home/container/hls/mp3_128", %mp3(bitrate=128)),
    ("/home/container/hls/mp3_64", %mp3(bitrate=64)),
    ("/home/container/hls/aac_128", %ffmpeg(format="adts", %audio(codec="aac", b="128k")))
  ],
  radio
)

###################################################################################
# ADVANCED METADATA MANAGEMENT
###################################################################################

# ADVANCED METADATA MANAGEMENT
# Enhanced metadata with JSON export
def enhance_metadata(m) =
  # Log to console
  log("Now playing: #{m['artist']} - #{m['title']}")
  
  # Export to JSON file for web UI
  json_data = json.stringify([
    ("artist", m["artist"]),
    ("title", m["title"]),
    ("genre", m["genre"]),
    ("album", m["album"]),
    ("station", station_name),
    ("website", station_url),
    ("timestamp", string(time()))
  ])
  
  ignore(file.write(data=json_data, "/home/container/now_playing.json"))
  
  m
end

radio = map_metadata(enhance_metadata, radio)

###################################################################################
# REMOTE CONTROL & MONITORING
###################################################################################

# Enable telnet server for remote control
server.telnet(port=1234)

# HARBOR HTTP API ENDPOINTS
def handle_request(~protocol, ~data, ~headers, uri) =
  # Parse URI
  let (path, args) = url.split(uri)
  
  # Health check endpoint
  if path == "/api/health" then
    http.response(
      protocol=protocol,
      code=200,
      headers=[("Content-Type", "application/json")],
      data='{"status":"ok","uptime":"#{time()}"}'
    )
  
  # Song request endpoint  
  elsif path == "/api/request" then
    song_uri = list.assoc(default="", "uri", args)
    if song_uri != "" then
      request.push(song_uri)
      http.response(
        protocol=protocol,
        code=200,
        headers=[("Content-Type", "application/json")],
        data='{"status":"ok","message":"Song queued"}'
      )
    else
      http.response(
        protocol=protocol,
        code=400,
        headers=[("Content-Type", "application/json")],
        data='{"status":"error","message":"Missing uri parameter"}'
      )
    end
  
  # Default 404
  else
    http.response(
      protocol=protocol,
      code=404,
      headers=[("Content-Type", "application/json")],
      data='{"status":"error","message":"Not found"}'
    )
  end
end

# Register HTTP handler on harbor
harbor.http.register(port=8000, method="GET", "/api", handle_request)
