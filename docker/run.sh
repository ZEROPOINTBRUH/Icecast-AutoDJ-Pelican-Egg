#!/bin/bash

###################################################################################
# Enhanced Icecast AutoDJ Run Script
# Created by: zeropointbruh (wegj1@hotmail.com)
# Website: https://banabyte.com
# 
# Features:
# - Multi-playlist support with weighted rotation
# - Ads folder integration with configurable frequency
# - Jingle injection between tracks
# - Advanced playlist generation
# - Automatic format detection (MP3, OGG, OPUS, FLAC)
###################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

echo -e "${MAGENTA}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     Enhanced Icecast AutoDJ Radio Server v2.0               ║"
echo "║     Created by: @zeropointbruh                               ║"
echo "║     Website: https://banabyte.com                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration from environment variables
ENABLE_ADS="${ENABLE_ADS:-false}"
ENABLE_JINGLES="${ENABLE_JINGLES:-false}"
USE_MULTI_PLAYLIST="${USE_MULTI_PLAYLIST:-false}"
ADS_FREQUENCY="${ADS_FREQUENCY:-5}"  # Play ad every X songs
JINGLE_FREQUENCY="${JINGLE_FREQUENCY:-3}"  # Play jingle every X songs
PLAYLIST_MODE="${PLAYLIST_MODE:-single}"  # single or multi

MUSIC_DIR="/home/container/music"
ADS_DIR="/home/container/ads"
JINGLES_DIR="/home/container/jingles"
PLAYLISTS_DIR="/home/container/playlists"
MAIN_PLAYLIST="/home/container/playlist.m3u"

log_info "Starting Enhanced AutoDJ with configuration:"
log_info "  - Multi-Playlist Mode: ${USE_MULTI_PLAYLIST}"
log_info "  - Ads Enabled: ${ENABLE_ADS}"
log_info "  - Jingles Enabled: ${ENABLE_JINGLES}"
log_info "  - Ads Frequency: Every ${ADS_FREQUENCY} songs"
log_info "  - Jingle Frequency: Every ${JINGLE_FREQUENCY} songs"

# Function to count files by extension
count_audio_files() {
    local dir=$1
    local count=0
    
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) 2>/dev/null | wc -l)
    fi
    
    echo "$count"
}

# Validate directories and files
validate_setup() {
    log_info "Validating setup..."
    
    local errors=0
    
    if [ ! -d "$MUSIC_DIR" ]; then
        log_error "Music directory not found: $MUSIC_DIR"
        mkdir -p "$MUSIC_DIR"
        log_warn "Created empty music directory. Please upload music files!"
        errors=$((errors + 1))
    fi
    
    local music_count=$(count_audio_files "$MUSIC_DIR")
    if [ "$music_count" -eq 0 ]; then
        log_warn "No music files found in $MUSIC_DIR"
        log_warn "Supported formats: MP3, OGG, OPUS, FLAC, M4A"
        errors=$((errors + 1))
    else
        log_success "Found $music_count music file(s)"
    fi
    
    if [ "$ENABLE_ADS" = "true" ]; then
        if [ ! -d "$ADS_DIR" ]; then
            log_warn "Ads enabled but ads directory not found. Creating..."
            mkdir -p "$ADS_DIR"
        fi
        local ads_count=$(count_audio_files "$ADS_DIR")
        if [ "$ads_count" -eq 0 ]; then
            log_warn "Ads enabled but no ad files found in $ADS_DIR"
        else
            log_success "Found $ads_count ad file(s)"
        fi
    fi
    
    if [ "$ENABLE_JINGLES" = "true" ]; then
        if [ ! -d "$JINGLES_DIR" ]; then
            log_warn "Jingles enabled but jingles directory not found. Creating..."
            mkdir -p "$JINGLES_DIR"
        fi
        local jingle_count=$(count_audio_files "$JINGLES_DIR")
        if [ "$jingle_count" -eq 0 ]; then
            log_warn "Jingles enabled but no jingle files found in $JINGLES_DIR"
        else
            log_success "Found $jingle_count jingle file(s)"
        fi
    fi
    
    if [ "$USE_MULTI_PLAYLIST" = "true" ]; then
        if [ ! -d "$PLAYLISTS_DIR" ]; then
            log_info "Creating playlists directory for multi-playlist mode..."
            mkdir -p "$PLAYLISTS_DIR"
        fi
    fi
    
    if [ $errors -gt 0 ]; then
        log_error "Validation completed with $errors error(s)"
        log_warn "Server may not function correctly until issues are resolved"
    else
        log_success "Validation passed!"
    fi
}

# Generate advanced playlist with ads and jingles
generate_advanced_playlist() {
    log_info "Generating advanced playlist..."
    
    # Temporary files
    local temp_music_list="/tmp/music_list.tmp"
    local temp_ads_list="/tmp/ads_list.tmp"
    local temp_jingles_list="/tmp/jingles_list.tmp"
    
    # Find all music files
    if [ "$USE_MULTI_PLAYLIST" = "true" ] && [ -d "$PLAYLISTS_DIR" ]; then
        log_info "Multi-playlist mode: Scanning playlists directory..."
        find "$PLAYLISTS_DIR" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) | sort > "$temp_music_list"
        
        # Also include main music directory
        find "$MUSIC_DIR" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) | sort >> "$temp_music_list"
    else
        log_info "Single playlist mode: Scanning music directory..."
        find "$MUSIC_DIR" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) | sort > "$temp_music_list"
    fi
    
    # Find ads if enabled
    if [ "$ENABLE_ADS" = "true" ] && [ -d "$ADS_DIR" ]; then
        find "$ADS_DIR" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) | sort > "$temp_ads_list"
    else
        touch "$temp_ads_list"
    fi
    
    # Find jingles if enabled
    if [ "$ENABLE_JINGLES" = "true" ] && [ -d "$JINGLES_DIR" ]; then
        find "$JINGLES_DIR" -type f \( -iname "*.mp3" -o -iname "*.ogg" -o -iname "*.opus" -o -iname "*.flac" -o -iname "*.m4a" \) | sort > "$temp_jingles_list"
    else
        touch "$temp_jingles_list"
    fi
    
    # Count files
    local music_count=$(wc -l < "$temp_music_list")
    local ads_count=$(wc -l < "$temp_ads_list")
    local jingles_count=$(wc -l < "$temp_jingles_list")
    
    log_info "Found: $music_count music, $ads_count ads, $jingles_count jingles"
    
    # Generate playlist with intelligent rotation
    > "$MAIN_PLAYLIST"
    
    if [ "$music_count" -eq 0 ]; then
        log_error "No music files found! Cannot generate playlist."
        return 1
    fi
    
    local song_counter=0
    
    # Read music files and inject ads/jingles
    while IFS= read -r music_file; do
        song_counter=$((song_counter + 1))
        
        # Add jingle before song if enabled and it's time
        if [ "$ENABLE_JINGLES" = "true" ] && [ "$jingles_count" -gt 0 ]; then
            if [ $((song_counter % JINGLE_FREQUENCY)) -eq 0 ]; then
                local random_jingle=$(shuf -n 1 "$temp_jingles_list")
                if [ -n "$random_jingle" ]; then
                    echo "$random_jingle" >> "$MAIN_PLAYLIST"
                    log_info "  Injected jingle at position $song_counter"
                fi
            fi
        fi
        
        # Add the music track
        echo "$music_file" >> "$MAIN_PLAYLIST"
        
        # Add ad after song if enabled and it's time
        if [ "$ENABLE_ADS" = "true" ] && [ "$ads_count" -gt 0 ]; then
            if [ $((song_counter % ADS_FREQUENCY)) -eq 0 ]; then
                local random_ad=$(shuf -n 1 "$temp_ads_list")
                if [ -n "$random_ad" ]; then
                    echo "$random_ad" >> "$MAIN_PLAYLIST"
                    log_info "  Injected ad at position $song_counter"
                fi
            fi
        fi
        
    done < "$temp_music_list"
    
    # Cleanup
    rm -f "$temp_music_list" "$temp_ads_list" "$temp_jingles_list"
    
    local total_entries=$(wc -l < "$MAIN_PLAYLIST")
    log_success "Playlist generated with $total_entries total entries"
    
    return 0
}

# Check if required config files exist
check_configs() {
    log_info "Checking configuration files..."
    
    if [ ! -f "/home/container/icecast.xml" ]; then
        log_error "icecast.xml not found!"
        return 1
    fi
    
    if [ ! -f "/home/container/ezstream.xml" ]; then
        log_error "ezstream.xml not found!"
        return 1
    fi
    
    log_success "Configuration files found"
    return 0
}

# Main execution
main() {
    log_info "Initializing Enhanced AutoDJ..."
    
    # Validate setup
    validate_setup
    
    # Check configurations
    if ! check_configs; then
        log_error "Configuration validation failed!"
        exit 1
    fi
    
    # Generate playlist
    if ! generate_advanced_playlist; then
        log_error "Playlist generation failed!"
        exit 1
    fi
    
    log_info "Starting Icecast server..."
    /usr/bin/icecast2 -b -c "/home/container/icecast.xml" &
    ICECAST_PID=$!
    
    log_info "Waiting for Icecast to initialize..."
    sleep 5
    
    # Check if Icecast is running
    if ! kill -0 $ICECAST_PID 2>/dev/null; then
        log_error "Icecast failed to start!"
        exit 1
    fi
    
    log_success "Icecast server started (PID: $ICECAST_PID)"
    
    log_info "Starting ezstream..."
    /usr/bin/ezstream -c "/home/container/ezstream.xml" &
    EZSTREAM_PID=$!
    
    log_success "ezstream started (PID: $EZSTREAM_PID)"
    
    echo ""
    log_success "═══════════════════════════════════════════════════"
    log_success "  Enhanced AutoDJ is now LIVE!"
    log_success "  Stream URL: http://YOUR_IP:PORT/autodj"
    log_success "  Admin Panel: http://YOUR_IP:PORT/admin"
    log_success "═══════════════════════════════════════════════════"
    echo ""
    log_info "Press Ctrl+C to stop the server"
    echo ""
    
    # Attribution notice
    echo -e "${MAGENTA}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Enhanced by: @zeropointbruh"
    echo "  Email: wegj1@hotmail.com"
    echo "  Website: https://banabyte.com"
    echo "  Please credit this work if you use it commercially"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
    
    # Keep script running and monitor processes
    while true; do
        if ! kill -0 $ICECAST_PID 2>/dev/null; then
            log_error "Icecast process died! Restarting..."
            /usr/bin/icecast2 -b -c "/home/container/icecast.xml" &
            ICECAST_PID=$!
            sleep 3
        fi
        
        if ! kill -0 $EZSTREAM_PID 2>/dev/null; then
            log_error "ezstream process died! Restarting..."
            /usr/bin/ezstream -c "/home/container/ezstream.xml" &
            EZSTREAM_PID=$!
        fi
        
        sleep 30
    done
}

# Trap SIGTERM and SIGINT for graceful shutdown
trap 'log_info "Shutting down..."; kill $ICECAST_PID $EZSTREAM_PID 2>/dev/null; exit 0' SIGTERM SIGINT

# Run main function
main
