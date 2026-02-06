#!/bin/bash

###################################################################################
# AutoDJ-Extreme AI DJ Voice System
# Text-to-speech announcements using multiple TTS engines
###################################################################################

# Configuration
TTS_ENGINE="${TTS_ENGINE:-espeak}"  # espeak, festival, piper, gtts
TTS_VOICE="${TTS_VOICE:-en-us}"
TTS_SPEED="${TTS_SPEED:-175}"
TTS_PITCH="${TTS_PITCH:-50}"
AI_DJ_ENABLED="${AI_DJ_ENABLED:-false}"

# Output directory for generated audio
TTS_OUTPUT_DIR="/home/container/ai-dj-voice"
mkdir -p "$TTS_OUTPUT_DIR"

# Generate speech function
generate_speech() {
    local text="$1"
    local output_file="$2"
    
    if [ "$AI_DJ_ENABLED" != "true" ]; then
        return 1
    fi
    
    case "$TTS_ENGINE" in
        espeak)
            # eSpeak - Fast, lightweight
            espeak -v "$TTS_VOICE" -s "$TTS_SPEED" -p "$TTS_PITCH" \
                -w "$output_file" "$text" 2>/dev/null
            ;;
        festival)
            # Festival - Better quality
            echo "$text" | text2wave -o "$output_file" 2>/dev/null
            ;;
        piper)
            # Piper - Neural TTS (best quality)
            echo "$text" | piper --model en_US-lessac-medium \
                --output_file "$output_file" 2>/dev/null
            ;;
        gtts)
            # Google TTS - Requires internet
            python3 -c "from gtts import gTTS; \
                tts = gTTS('$text', lang='en'); \
                tts.save('$output_file')" 2>/dev/null
            ;;
    esac
    
    # Normalize audio
    if [ -f "$output_file" ]; then
        ffmpeg -i "$output_file" -ar 44100 -ac 2 -b:a 192k \
            "${output_file%.wav}_normalized.mp3" -y 2>/dev/null
        mv "${output_file%.wav}_normalized.mp3" "$output_file"
        return 0
    fi
    
    return 1
}

# Pre-generate common announcements
generate_common_announcements() {
    echo "Generating AI DJ voice announcements..."
    
    # Station identification
    generate_speech \
        "You're listening to AutoDJ Extreme Radio, broadcasting in high quality twenty four seven." \
        "$TTS_OUTPUT_DIR/station_id.mp3"
    
    # Time announcements
    generate_speech \
        "It's time for the morning show! Wake up to great music." \
        "$TTS_OUTPUT_DIR/morning_greeting.mp3"
    
    generate_speech \
        "Good afternoon! You're listening to the best hits all day long." \
        "$TTS_OUTPUT_DIR/afternoon_greeting.mp3"
    
    generate_speech \
        "Evening vibes are here! Relax with our evening playlist." \
        "$TTS_OUTPUT_DIR/evening_greeting.mp3"
    
    generate_speech \
        "Late night radio for night owls. Stay tuned for chill beats." \
        "$TTS_OUTPUT_DIR/night_greeting.mp3"
    
    # Weather updates
    generate_speech \
        "Thanks for listening! Don't forget to request your favorite songs." \
        "$TTS_OUTPUT_DIR/request_reminder.mp3"
    
    # Generic transitions
    generate_speech \
        "Coming up next, another great track!" \
        "$TTS_OUTPUT_DIR/transition_1.mp3"
    
    generate_speech \
        "Here's a fresh one for you!" \
        "$TTS_OUTPUT_DIR/transition_2.mp3"
    
    generate_speech \
        "Let's keep the music going!" \
        "$TTS_OUTPUT_DIR/transition_3.mp3"
    
    # Top of hour
    generate_speech \
        "It's the top of the hour, and you're listening to AutoDJ Extreme Radio." \
        "$TTS_OUTPUT_DIR/top_of_hour.mp3"
    
    echo "✓ AI DJ voice announcements generated!"
}

# Dynamic announcement - generates on demand
announce_now_playing() {
    local artist="$1"
    local title="$2"
    local output="$TTS_OUTPUT_DIR/now_playing_$(date +%s).mp3"
    
    generate_speech \
        "Now playing, ${title} by ${artist}" \
        "$output"
    
    echo "$output"
}

# Weather announcement (requires external API)
announce_weather() {
    local city="$1"
    local output="$TTS_OUTPUT_DIR/weather_$(date +%s).mp3"
    
    # Fetch weather data (placeholder)
    local weather="partly cloudy with a high of 75 degrees"
    
    generate_speech \
        "Here's the weather for ${city}. Expect ${weather}" \
        "$output"
    
    echo "$output"
}

# Listener shoutout
announce_shoutout() {
    local listener_name="$1"
    local message="$2"
    local output="$TTS_OUTPUT_DIR/shoutout_$(date +%s).mp3"
    
    generate_speech \
        "Shout out to ${listener_name}! ${message}" \
        "$output"
    
    echo "$output"
}

# Song request announcement
announce_request() {
    local listener="$1"
    local song="$2"
    local artist="$3"
    local output="$TTS_OUTPUT_DIR/request_$(date +%s).mp3"
    
    generate_speech \
        "This next song goes out to ${listener}. Enjoy ${song} by ${artist}!" \
        "$output"
    
    echo "$output"
}

# Listener count milestone
announce_milestone() {
    local count="$1"
    local output="$TTS_OUTPUT_DIR/milestone_$(date +%s).mp3"
    
    generate_speech \
        "Amazing! We now have ${count} listeners tuned in. Thank you for listening!" \
        "$output"
    
    echo "$output"
}

# Custom announcement
announce_custom() {
    local text="$1"
    local output="$TTS_OUTPUT_DIR/custom_$(date +%s).mp3"
    
    generate_speech "$text" "$output"
    echo "$output"
}

# Cleanup old announcements (keep last 100)
cleanup_old_announcements() {
    find "$TTS_OUTPUT_DIR" -name "*.mp3" -type f -mmin +60 | \
        sort -r | tail -n +100 | xargs rm -f 2>/dev/null
}

# Initialize on first run
if [ "$AI_DJ_ENABLED" = "true" ]; then
    generate_common_announcements
    
    # Schedule cleanup
    (while true; do
        sleep 3600
        cleanup_old_announcements
    done) &
fi

# Export functions
export -f generate_speech
export -f announce_now_playing
export -f announce_weather
export -f announce_shoutout
export -f announce_request
export -f announce_milestone
export -f announce_custom
