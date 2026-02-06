#!/bin/bash

###################################################################################
# AutoDJ-Extreme Discord/Webhook Notifications
# Send notifications when events occur
###################################################################################

# Configuration (set via environment variables)
WEBHOOK_URL="${WEBHOOK_URL:-}"
WEBHOOK_ENABLED="${WEBHOOK_ENABLED:-false}"

# Send notification function
send_notification() {
    local title="$1"
    local description="$2"
    local color="$3"
    
    if [ "$WEBHOOK_ENABLED" != "true" ] || [ -z "$WEBHOOK_URL" ]; then
        return 0
    fi
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    local payload=$(cat <<EOF
{
    "embeds": [{
        "title": "$title",
        "description": "$description",
        "color": $color,
        "timestamp": "$timestamp",
        "footer": {
            "text": "AutoDJ Extreme Radio"
        }
    }]
}
EOF
)
    
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        2>/dev/null || true
}

# Event notification functions
notify_stream_online() {
    send_notification \
        "🟢 Stream is LIVE" \
        "AutoDJ Radio is now broadcasting!" \
        1947988
}

notify_stream_offline() {
    send_notification \
        "🔴 Stream Offline" \
        "AutoDJ Radio has stopped broadcasting." \
        15158332
}

notify_track_change() {
    local artist="$1"
    local title="$2"
    
    send_notification \
        "🎵 Now Playing" \
        "**$artist** - $title" \
        3447003
}

notify_error() {
    local error_msg="$1"
    
    send_notification \
        "⚠️ Error Detected" \
        "$error_msg" \
        15158332
}

notify_listener_milestone() {
    local count="$1"
    
    send_notification \
        "🎉 Listener Milestone" \
        "Your station now has $count concurrent listeners!" \
        1947988
}

# Export functions
export -f send_notification
export -f notify_stream_online
export -f notify_stream_offline
export -f notify_track_change
export -f notify_error
export -f notify_listener_milestone
