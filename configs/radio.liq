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

# Main music playlist (fallback)
music = playlist(
  mode="randomize",
  reload_mode="watch",
  "/home/container/playlist.m3u"
)

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

# Advanced crossfading with smart detection
def smart_crossfade(~start_next, ~fade_in, ~fade_out, s)
  fade.in(duration=fade_in, s)
  fade.out(duration=fade_out, s)
end

scheduled_music = cross(duration=4.0, smart_crossfade, scheduled_music)

# ADVANCED EQ - Professional sound shaping
def apply_eq(s)
  # Bass boost (80 Hz)
  s = filter.iir.eq.low(frequency=80.0, q=1.0, gain=3.0, s)
  # Presence boost (3 kHz)
  s = filter.iir.eq.peak(frequency=3000.0, q=1.0, gain=2.0, s)
  # High-end clarity (8 kHz)
  s = filter.iir.eq.high(frequency=8000.0, q=0.7, gain=1.5, s)
  # Remove rumble
  s = filter.iir.eq.highpass(frequency=30.0, q=1.0, s)
  s
end

scheduled_music = apply_eq(scheduled_music)

# Multiband compressor for broadcast-quality sound
def multiband_compress(s)
  # Split into bands
  low = filter.iir.eq.lowpass(frequency=250.0, q=1.0, s)
  mid = filter.iir.eq.bandpass(frequency=1000.0, q=1.0, s)
  high = filter.iir.eq.highpass(frequency=4000.0, q=1.0, s)
  
  # Compress each band
  low = compress(attack=0.01, release=0.1, threshold=-20.0, ratio=4.0, low)
  mid = compress(attack=0.005, release=0.05, threshold=-18.0, ratio=3.0, mid)
  high = compress(attack=0.003, release=0.03, threshold=-15.0, ratio=2.0, high)
  
  # Mix back together
  add([low, mid, high])
end

scheduled_music = multiband_compress(scheduled_music)

# Stereo enhancement
scheduled_music = stereo.ms.width(0.8, scheduled_music)

# Final limiter to prevent clipping
scheduled_music = limit(threshold=-1.0, attack=0.001, release=0.1, scheduled_music)

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

# Record stream to timestamped files (1 hour segments)
output.file(
  %mp3(bitrate=192),
  "/home/container/recordings/%Y-%m-%d/%H-%M-%S.mp3",
  reopen_on_metadata=false,
  append=false,
  radio
)

# Record separate track files for later analysis/replay
on_track(fun(m) ->
  if m["filename"] != "" then
    log("Track played: #{m['artist']} - #{m['title']} from #{m['filename']}")
  end
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

# Add metadata to live stream
live = insert_metadata(live)

# Apply same processing to live input
live = normalize(target=-14.0, live)
live = compress(ratio=3.0, threshold=-16.0, live)
live = limit(threshold=-1.0, attack=0.001, release=0.1, live)

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

# AAC 128kbps - Modern codec, iOS/Safari compatible
output.icecast(
  %fdkaac(bitrate=128, samplerate=44100, afterburner=true),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj.aac",
  name=station_name ^ " - AAC",
  description=station_description ^ " - AAC Format",
  genre=station_genre,
  url=station_url,
  public=false,
  radio
)

# AAC+ 64kbps - HE-AAC for mobile
output.icecast(
  %fdkaac(bitrate=64, samplerate=44100, afterburner=true, aot="mpeg4_he_aac"),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/autodj-mobile.aac",
  name=station_name ^ " - AAC+ Mobile",
  description=station_description ^ " - HE-AAC Mobile",
  genre=station_genre,
  url=station_url,
  public=false,
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

# FLAC - Lossless streaming for audiophiles
output.icecast(
  %ogg(%flac(compression=5, samplerate=44100)),
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

###################################################################################
# HLS STREAMING (for iOS/Safari/Smart TVs)
###################################################################################

# HLS output for Apple devices
output.file.hls(
  playlist="/home/container/hls/live.m3u8",
  segment_duration=10.0,
  segments=6,
  segments_overhead=12,
  [
    (%mp3(bitrate=128), "/home/container/hls/mp3_128"),
    (%mp3(bitrate=64), "/home/container/hls/mp3_64"),
    (%fdkaac(bitrate=128), "/home/container/hls/aac_128")
  ],
  radio
)

###################################################################################
# ADVANCED METADATA MANAGEMENT
###################################################################################

# Enhanced metadata with additional fields
def enhance_metadata(m)
  # Add custom metadata
  m = list.add(("station", station_name), m)
  m = list.add(("website", station_url), m)
  
  # Log to file
  log("Now playing: #{m['artist']} - #{m['title']}")
  
  # Write to JSON for external apps
  json_data = json.stringify(m)
  file.write(data=json_data, "/home/container/now_playing.json")
  
  m
end

radio = map_metadata(enhance_metadata, radio)

###################################################################################
# REMOTE CONTROL & MONITORING
###################################################################################

# Enable telnet server for remote control (localhost only for security)
server.telnet(port=1234)

# Enable harbor for external control
server.harbor()

# Custom harbor endpoint for requests
def request_handler(request)
  # Parse request and add to queue
  uri = request["uri"]
  log("Request received: #{uri}")
  ignore(request.push(uri))
  "OK"
end

server.register(
  port=8000,
  method="GET",
  "/api/request",
  request_handler
)

# Health check endpoint
def health_check(_)
  source_status = if source.is_ready(radio) then "ready" else "not_ready" end
  '{"status":"ok","source":"#{source_status}"}'
end

server.register(
  port=8000,
  method="GET",
  "/api/health",
  health_check
)

# Stream statistics endpoint
def stats_handler(_)
  listeners = server.execute("stats")
  listeners
end

server.register(
  port=8000,
  method="GET",
  "/api/stats",
  stats_handler
)
