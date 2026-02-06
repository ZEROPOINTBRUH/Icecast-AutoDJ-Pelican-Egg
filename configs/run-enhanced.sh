#!/bin/bash

###################################################################################
# Enhanced Icecast AutoDJ Run Script - Extreme Edition v2.0
# Created by: @zeropointbruh (wegj1@hotmail.com)
# Website: https://banabyte.com
# 
# Features:
# - 11+ audio format support (MP3, OGG, OPUS, FLAC, M4A, WAV, AAC, WMA, AIFF, APE, ALAC)
# - Multi-playlist intelligent rotation
# - Ads rotation with configurable frequency
# - Jingle injection between tracks
# - Beautiful formatted output with box drawing
# - Comprehensive logging system with timestamps
# - Process monitoring and auto-recovery
###################################################################################

set -e

# ═══════════════════════════════════════════════════════════════════════════════
# COLOR DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Box drawing characters
BOX_TL='╔'
BOX_TR='╗'
BOX_BL='╚'
BOX_BR='╝'
BOX_H='═'
BOX_V='║'
BOX_VR='╠'
BOX_VL='╣'
BOX_HU='╩'
BOX_HD='╦'

# ═══════════════════════════════════════════════════════════════════════════════
# LOGGING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

LOG_DIR="/home/container/log"
LOG_FILE="${LOG_DIR}/autodj.log"
ERROR_LOG="${LOG_DIR}/autodj-error.log"
ACCESS_LOG="${LOG_DIR}/autodj-access.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to get timestamp
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Enhanced logging functions with file output
log_info() {
    local msg="$1"
    local ts=$(timestamp)
    echo -e "${GREEN}${BOLD}[INFO]${NC} ${WHITE}${msg}${NC}"
    echo "[$ts] [INFO] $msg" >> "$LOG_FILE"
}

log_warn() {
    local msg="$1"
    local ts=$(timestamp)
    echo -e "${YELLOW}${BOLD}[WARN]${NC} ${YELLOW}${msg}${NC}"
    echo "[$ts] [WARN] $msg" >> "$LOG_FILE"
    echo "[$ts] [WARN] $msg" >> "$ERROR_LOG"
}

log_error() {
    local msg="$1"
    local ts=$(timestamp)
    echo -e "${RED}${BOLD}[ERROR]${NC} ${RED}${msg}${NC}"
    echo "[$ts] [ERROR] $msg" >> "$LOG_FILE"
    echo "[$ts] [ERROR] $msg" >> "$ERROR_LOG"
}

log_success() {
    local msg="$1"
    local ts=$(timestamp)
    echo -e "${CYAN}${BOLD}[SUCCESS]${NC} ${CYAN}${msg}${NC}"
    echo "[$ts] [SUCCESS] $msg" >> "$LOG_FILE"
}

log_debug() {
    local msg="$1"
    local ts=$(timestamp)
    echo -e "${GRAY}[DEBUG]${NC} ${GRAY}${msg}${NC}"
    echo "[$ts] [DEBUG] $msg" >> "$LOG_FILE"
}

log_access() {
    local msg="$1"
    local ts=$(timestamp)
    echo "[$ts] $msg" >> "$ACCESS_LOG"
}

# ═══════════════════════════════════════════════════════════════════════════════
# BEAUTIFUL BOX DRAWING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

print_box_line() {
    local width=$1
    local char=$2
    printf "${char}"
    for ((i=0; i<width-2; i++)); do printf "${BOX_H}"; done
    printf "${char}\n"
}

print_box_text() {
    local text="$1"
    local width=$2
    local color="${3:-$WHITE}"
    local text_len=${#text}
    local padding=$(( (width - text_len - 2) / 2 ))
    local extra=$(( (width - text_len - 2) % 2 ))
    
    printf "${BOX_V}"
    for ((i=0; i<padding; i++)); do printf " "; done
    printf "${color}${text}${NC}"
    for ((i=0; i<padding+extra; i++)); do printf " "; done
    printf "${BOX_V}\n"
}

print_banner() {
    local width=80
    
    echo -e "${MAGENTA}${BOLD}"
    print_box_line $width "${BOX_TL}${BOX_TR}"
    print_box_text "" $width
    print_box_text "Enhanced Icecast AutoDJ - EXTREME EDITION v2.0" $width "$MAGENTA$BOLD"
    print_box_text "" $width
    print_box_line $width "${BOX_VR}${BOX_VL}"
    print_box_text "" $width
    print_box_text "Created by: @zeropointbruh" $width "$CYAN"
    print_box_text "Email: wegj1@hotmail.com" $width "$CYAN"
    print_box_text "Website: https://banabyte.com" $width "$CYAN"
    print_box_text "" $width
    print_box_line $width "${BOX_BL}${BOX_BR}"
    echo -e "${NC}"
}

print_section_header() {
    local text="$1"
    local width=80
    echo ""
    echo -e "${BLUE}${BOLD}"
    print_box_line $width "${BOX_TL}${BOX_TR}"
    print_box_text "$text" $width "$BLUE$BOLD"
    print_box_line $width "${BOX_BL}${BOX_BR}"
    echo -e "${NC}"
}

print_status_box() {
    local title="$1"
    shift
    local width=80
    
    echo -e "${GREEN}"
    print_box_line $width "${BOX_TL}${BOX_TR}"
    print_box_text "$title" $width "$GREEN$BOLD"
    print_box_line $width "${BOX_VR}${BOX_VL}"
    
    for line in "$@"; do
        print_box_text "$line" $width "$WHITE"
    done
    
    print_box_line $width "${BOX_BL}${BOX_BR}"
    echo -e "${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

ENABLE_ADS="${ENABLE_ADS:-false}"
ENABLE_JINGLES="${ENABLE_JINGLES:-false}"
USE_MULTI_PLAYLIST="${USE_MULTI_PLAYLIST:-false}"
ADS_FREQUENCY="${ADS_FREQUENCY:-5}"
JINGLE_FREQUENCY="${JINGLE_FREQUENCY:-3}"

MUSIC_DIR="/home/container/music"
ADS_DIR="/home/container/ads"
JINGLES_DIR="/home/container/jingles"
PLAYLISTS_DIR="/home/container/playlists"
MAIN_PLAYLIST="/home/container/playlist.m3u"

# ═══════════════════════════════════════════════════════════════════════════════
# SUPPORTED FORMATS (11+ formats)
# ═══════════════════════════════════════════════════════════════════════════════

SUPPORTED_FORMATS=(
    "*.mp3"    # MPEG Audio Layer 3
    "*.ogg"    # Ogg Vorbis
    "*.opus"   # Opus codec
    "*.flac"   # Free Lossless Audio Codec
    "*.m4a"    # MPEG-4 Audio
    "*.aac"    # Advanced Audio Coding
    "*.wav"    # Waveform Audio
    "*.wma"    # Windows Media Audio
    "*.aiff"   # Audio Interchange File Format
    "*.ape"    # Monkey's Audio
    "*.alac"   # Apple Lossless
)

# ═══════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

count_audio_files() {
    local dir=$1
    local count=0
    
    if [ -d "$dir" ]; then
        for format in "${SUPPORTED_FORMATS[@]}"; do
            count=$((count + $(find "$dir" -type f -iname "$format" 2>/dev/null | wc -l)))
        done
    fi
    
    echo "$count"
}

format_number() {
    local num=$1
    printf "%'d" $num 2>/dev/null || echo $num
}

format_size() {
    local bytes=$1
    if [ $bytes -ge 1073741824 ]; then
        echo "$(echo "scale=2; $bytes / 1073741824" | bc)GB"
    elif [ $bytes -ge 1048576 ]; then
        echo "$(echo "scale=2; $bytes / 1048576" | bc)MB"
    elif [ $bytes -ge 1024 ]; then
        echo "$(echo "scale=2; $bytes / 1024" | bc)KB"
    else
        echo "${bytes}B"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════

validate_setup() {
    print_section_header "VALIDATING INSTALLATION"
    
    local errors=0
    local warnings=0
    
    log_info "Checking directories..."
    
    # Check music directory
    if [ ! -d "$MUSIC_DIR" ]; then
        log_error "Music directory not found: $MUSIC_DIR"
        mkdir -p "$MUSIC_DIR"
        log_warn "Created empty music directory"
        errors=$((errors + 1))
    else
        local music_count=$(count_audio_files "$MUSIC_DIR")
        if [ "$music_count" -eq 0 ]; then
            log_warn "No music files found in $MUSIC_DIR"
            warnings=$((warnings + 1))
        else
            log_success "Found $(format_number $music_count) music file(s)"
        fi
    fi
    
    # Check ads if enabled
    if [ "$ENABLE_ADS" = "true" ]; then
        if [ ! -d "$ADS_DIR" ]; then
            log_warn "Ads enabled but directory not found, creating..."
            mkdir -p "$ADS_DIR"
        fi
        local ads_count=$(count_audio_files "$ADS_DIR")
        if [ "$ads_count" -eq 0 ]; then
            log_warn "Ads enabled but no ad files found"
            warnings=$((warnings + 1))
        else
            log_success "Found $(format_number $ads_count) ad file(s)"
        fi
    fi
    
    # Check jingles if enabled
    if [ "$ENABLE_JINGLES" = "true" ]; then
        if [ ! -d "$JINGLES_DIR" ]; then
            log_warn "Jingles enabled but directory not found, creating..."
            mkdir -p "$JINGLES_DIR"
        fi
        local jingles_count=$(count_audio_files "$JINGLES_DIR")
        if [ "$jingles_count" -eq 0 ]; then
            log_warn "Jingles enabled but no jingle files found"
            warnings=$((warnings + 1))
        else
            log_success "Found $(format_number $jingles_count) jingle file(s)"
        fi
    fi
    
    # Check multi-playlist
    if [ "$USE_MULTI_PLAYLIST" = "true" ]; then
        if [ ! -d "$PLAYLISTS_DIR" ]; then
            log_info "Creating playlists directory..."
            mkdir -p "$PLAYLISTS_DIR"
        fi
    fi
    
    # Check config files
    log_info "Checking configuration files..."
    [ ! -f "/home/container/icecast.xml" ] && { log_error "icecast.xml not found!"; errors=$((errors + 1)); }
    [ ! -f "/home/container/ezstream.xml" ] && { log_error "ezstream.xml not found!"; errors=$((errors + 1)); }
    
    echo ""
    if [ $errors -gt 0 ]; then
        log_error "Validation completed with $errors error(s) and $warnings warning(s)"
        return 1
    elif [ $warnings -gt 0 ]; then
        log_warn "Validation completed with $warnings warning(s)"
        return 0
    else
        log_success "All validation checks passed!"
        return 0
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# PLAYLIST GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

generate_advanced_playlist() {
    print_section_header "GENERATING PLAYLIST"
    
    local temp_music="/tmp/music_list.tmp"
    local temp_ads="/tmp/ads_list.tmp"
    local temp_jingles="/tmp/jingles_list.tmp"
    
    log_info "Scanning for audio files..."
    
    # Find music files (all supported formats)
    > "$temp_music"
    for format in "${SUPPORTED_FORMATS[@]}"; do
        if [ "$USE_MULTI_PLAYLIST" = "true" ] && [ -d "$PLAYLISTS_DIR" ]; then
            find "$PLAYLISTS_DIR" -type f -iname "$format" 2>/dev/null >> "$temp_music"
        fi
        find "$MUSIC_DIR" -type f -iname "$format" 2>/dev/null >> "$temp_music"
    done
    sort "$temp_music" -o "$temp_music"
    
    # Find ads
    > "$temp_ads"
    if [ "$ENABLE_ADS" = "true" ] && [ -d "$ADS_DIR" ]; then
        for format in "${SUPPORTED_FORMATS[@]}"; do
            find "$ADS_DIR" -type f -iname "$format" 2>/dev/null >> "$temp_ads"
        done
        sort "$temp_ads" -o "$temp_ads"
    fi
    
    # Find jingles
    > "$temp_jingles"
    if [ "$ENABLE_JINGLES" = "true" ] && [ -d "$JINGLES_DIR" ]; then
        for format in "${SUPPORTED_FORMATS[@]}"; do
            find "$JINGLES_DIR" -type f -iname "$format" 2>/dev/null >> "$temp_jingles"
        done
        sort "$temp_jingles" -o "$temp_jingles"
    fi
    
    local music_count=$(wc -l < "$temp_music")
    local ads_count=$(wc -l < "$temp_ads")
    local jingles_count=$(wc -l < "$temp_jingles")
    
    log_info "Music files: $(format_number $music_count)"
    log_info "Ad files: $(format_number $ads_count)"
    log_info "Jingle files: $(format_number $jingles_count)"
    
    if [ "$music_count" -eq 0 ]; then
        log_error "No music files found! Cannot generate playlist."
        return 1
    fi
    
    log_info "Building intelligent playlist..."
    
    > "$MAIN_PLAYLIST"
    local song_counter=0
    local total_injections=0
    
    while IFS= read -r music_file; do
        song_counter=$((song_counter + 1))
        
        # Inject jingle
        if [ "$ENABLE_JINGLES" = "true" ] && [ "$jingles_count" -gt 0 ]; then
            if [ $((song_counter % JINGLE_FREQUENCY)) -eq 0 ]; then
                local random_jingle=$(shuf -n 1 "$temp_jingles")
                if [ -n "$random_jingle" ]; then
                    echo "$random_jingle" >> "$MAIN_PLAYLIST"
                    total_injections=$((total_injections + 1))
                    log_debug "Injected jingle at position $song_counter"
                fi
            fi
        fi
        
        # Add music track
        echo "$music_file" >> "$MAIN_PLAYLIST"
        
        # Inject ad
        if [ "$ENABLE_ADS" = "true" ] && [ "$ads_count" -gt 0 ]; then
            if [ $((song_counter % ADS_FREQUENCY)) -eq 0 ]; then
                local random_ad=$(shuf -n 1 "$temp_ads")
                if [ -n "$random_ad" ]; then
                    echo "$random_ad" >> "$MAIN_PLAYLIST"
                    total_injections=$((total_injections + 1))
                    log_debug "Injected ad at position $song_counter"
                fi
            fi
        fi
        
    done < "$temp_music"
    
    rm -f "$temp_music" "$temp_ads" "$temp_jingles"
    
    local total_entries=$(wc -l < "$MAIN_PLAYLIST")
    log_success "Playlist generated: $(format_number $total_entries) total entries"
    log_success "Content injections: $(format_number $total_injections)"
    
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

main() {
    # Clear screen for clean output
    clear
    
    # Print beautiful banner
    print_banner
    
    # Log startup
    log_info "═══════════════════════════════════════════════════════════════"
    log_info "Enhanced AutoDJ Starting - $(timestamp)"
    log_info "═══════════════════════════════════════════════════════════════"
    
    # Display configuration
    print_status_box "CONFIGURATION" \
        "Multi-Playlist: ${USE_MULTI_PLAYLIST}" \
        "Ads Enabled: ${ENABLE_ADS} (Frequency: ${ADS_FREQUENCY})" \
        "Jingles Enabled: ${ENABLE_JINGLES} (Frequency: ${JINGLE_FREQUENCY})" \
        "Supported Formats: ${#SUPPORTED_FORMATS[@]} types" \
        "Log Directory: ${LOG_DIR}"
    
    # Validate setup
    if ! validate_setup; then
        log_error "Validation failed! Check errors above."
        sleep 5
    fi
    
    # Generate playlist
    if ! generate_advanced_playlist; then
        log_error "Playlist generation failed!"
        exit 1
    fi
    
    # Start Icecast
    print_section_header "STARTING SERVICES"
    
    log_info "Starting Icecast server..."
    /usr/bin/icecast2 -c "/home/container/icecast.xml" 2>&1 | while IFS= read -r line; do log_debug "icecast: $line"; done &
    ICECAST_PID=$!
    
    sleep 5
    
    if ! kill -0 $ICECAST_PID 2>/dev/null; then
        log_error "Icecast failed to start!"
        exit 1
    fi
    log_success "Icecast started (PID: $ICECAST_PID)"
    
    # Start Liquidsoap
    log_info "Starting Liquidsoap (advanced audio engine)..."
    log_debug "Liquidsoap version: $(/usr/bin/liquidsoap --version 2>&1 | head -1)"
    log_debug "Config file exists: $([ -f /home/container/radio.liq ] && echo 'YES' || echo 'NO')"
    log_debug "Config file size: $(wc -c < /home/container/radio.liq 2>/dev/null || echo '0') bytes"
    log_debug "Config file content:"
    cat /home/container/radio.liq 2>&1 | while IFS= read -r line; do log_debug "  $line"; done
    /usr/bin/liquidsoap /home/container/radio.liq 2>&1 | while IFS= read -r line; do log_debug "liquidsoap: $line"; done &
    LIQUIDSOAP_PID=$!
    
    sleep 5
    
    if ! kill -0 $LIQUIDSOAP_PID 2>/dev/null; then
        log_error "Liquidsoap failed to start!"
        kill $ICECAST_PID 2>/dev/null
        exit 1
    fi
    log_success "Liquidsoap started (PID: $LIQUIDSOAP_PID)"
    
    # Success banner
    echo ""
    echo -e "${GREEN}${BOLD}"
    print_box_line 80 "${BOX_TL}${BOX_TR}"
    print_box_text "RADIO STATION IS LIVE!" 80 "$GREEN$BOLD"
    print_box_line 80 "${BOX_VR}${BOX_VL}"
    print_box_text "" 80
    print_box_text "MP3 128k:  http://YOUR_IP:PORT/autodj-128.mp3" 80 "$WHITE"
    print_box_text "MP3 192k:  http://YOUR_IP:PORT/autodj-192.mp3" 80 "$WHITE"
    print_box_text "OGG Vorbis: http://YOUR_IP:PORT/autodj.ogg" 80 "$WHITE"
    print_box_text "AAC Stream: http://YOUR_IP:PORT/autodj.aac" 80 "$WHITE"
    print_box_text "" 80
    print_box_text "Admin Panel: http://YOUR_IP:PORT/admin/" 80 "$CYAN"
    print_box_text "Status Page: http://YOUR_IP:PORT/status.xsl" 80 "$CYAN"
    print_box_text "" 80
    print_box_line 80 "${BOX_BL}${BOX_BR}"
    echo -e "${NC}"
    
    # Attribution
    echo -e "${MAGENTA}"
    print_box_line 80 "${BOX_TL}${BOX_TR}"
    print_box_text "Created by @zeropointbruh" 80 "$CYAN"
    print_box_text "Email: wegj1@hotmail.com | Discord: @zeropointbruh" 80 "$CYAN"
    print_box_text "Website: https://banabyte.com" 80 "$CYAN"
    print_box_text "" 80
    print_box_text "Commercial use? See ATTRIBUTION.md for credit requirements" 80 "$YELLOW"
    print_box_line 80 "${BOX_BL}${BOX_BR}"
    echo -e "${NC}"
    
    log_access "Radio station went live with PIDs: Icecast=$ICECAST_PID, Liquidsoap=$LIQUIDSOAP_PID"
    
    # Monitor processes
    log_info "Process monitoring active. Press Ctrl+C to stop."
    
    while true; do
        if ! kill -0 $ICECAST_PID 2>/dev/null; then
            log_error "Icecast process died! Attempting restart..."
            /usr/bin/icecast2 -c "/home/container/icecast.xml" 2>&1 | while IFS= read -r line; do log_debug "icecast: $line"; done &
            ICECAST_PID=$!
            sleep 3
            log_warn "Icecast restarted with PID: $ICECAST_PID"
        fi
        
        if ! kill -0 $LIQUIDSOAP_PID 2>/dev/null; then
            log_error "Liquidsoap process died! Attempting restart..."
            /usr/bin/liquidsoap /home/container/radio.liq 2>&1 | while IFS= read -r line; do log_debug "liquidsoap: $line"; done &
            LIQUIDSOAP_PID=$!
            sleep 3
            log_warn "Liquidsoap restarted with PID: $LIQUIDSOAP_PID"
        fi
        
        sleep 30
    done
}

# Trap signals for graceful shutdown
trap 'log_info "Shutting down..."; kill $ICECAST_PID $LIQUIDSOAP_PID 2>/dev/null; log_info "Shutdown complete"; exit 0' SIGTERM SIGINT

# Run main function
main
