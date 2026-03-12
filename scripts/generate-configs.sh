#!/bin/bash

###############################################################################
# AutoDJ-Extreme Configuration Generator
# Extreme Edition v2.0
# 
# This script generates all configuration files from environment variables,
# ensuring consistency across Icecast, Liquidsoap, ezstream, and Web UI.
# 
# Usage: ./scripts/generate-configs.sh
# 
# It reads from:
#   - Environment variables (highest priority)
#   - .env file (if exists)
#   - .env.defaults (fallback values)
###############################################################################

set -e

# Resolve script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="${REPO_DIR}/configs"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     AutoDJ-Extreme Configuration Generator v2.0               ║${NC}"
echo -e "${CYAN}║              Extreme Edition - Long-term Solution             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Load Environment Variables
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Loading environment configuration...${NC}"

# Load .env.defaults first (baseline)
if [ -f "${REPO_DIR}/.env.defaults" ]; then
    set -a
    source "${REPO_DIR}/.env.defaults"
    set +a
    echo -e "${GREEN}✓${NC} Loaded defaults from .env.defaults"
fi

# Load .env if exists (override defaults)
if [ -f "${REPO_DIR}/.env" ]; then
    set -a
    source "${REPO_DIR}/.env"
    set +a
    echo -e "${GREEN}✓${NC} Loaded configuration from .env"
else
    echo -e "${YELLOW}ⓘ${NC} No .env file found, using defaults and environment variables"
fi

# Set defaults for any missing variables
export ADMIN_USER="${ADMIN_USER:-admin}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-adminpassword123}"
export SOURCE_PASSWORD="${SOURCE_PASSWORD:-autodjpassword123}"
export RELAY_PASSWORD="${RELAY_PASSWORD:-relaypassword123}"
export AUTODJ_PASSWORD="${AUTODJ_PASSWORD:-autodjpassword123}"
export LIVE_PASSWORD="${LIVE_PASSWORD:-livepassword123}"
export STREAM_PASSWORD="${STREAM_PASSWORD:-streampassword123}"

export ICECAST_HOST="${ICECAST_HOST:-localhost}"
export ICECAST_PORT="${ICECAST_PORT:-8000}"
export ICECAST_MAX_CLIENTS="${ICECAST_MAX_CLIENTS:-0}"
export ICECAST_BURST_SIZE="${ICECAST_BURST_SIZE:-65535}"

# Single port only - Icecast serves everything on ICECAST_PORT (default 8000)
# No separate web server port needed

export AUTODJ_PUBLIC="${AUTODJ_PUBLIC:-1}"
export LIVE_PUBLIC="${LIVE_PUBLIC:-0}"
export STREAM_PUBLIC="${STREAM_PUBLIC:-1}"

export MP3_BITRATE="${MP3_BITRATE:-128}"
export OGG_BITRATE="${OGG_BITRATE:-128}"

export MUSIC_DIR="${MUSIC_DIR:-/home/container/music}"
export PLAYLIST_DIR="${PLAYLIST_DIR:-/home/container/playlists}"
export ADS_DIR="${ADS_DIR:-/home/container/ads}"
export JINGLES_DIR="${JINGLES_DIR:-/home/container/jingles}"
export LOG_DIR="${LOG_DIR:-/home/container/log}"

export ENABLE_ADS="${ENABLE_ADS:-false}"
export AD_FREQUENCY="${AD_FREQUENCY:-5}"
export ENABLE_JINGLES="${ENABLE_JINGLES:-false}"
export JINGLE_FREQUENCY="${JINGLE_FREQUENCY:-3}"
export ENABLE_LIQUIDSOAP="${ENABLE_LIQUIDSOAP:-true}"

export LOG_LEVEL="${LOG_LEVEL:-3}"
export STATION_NAME="${STATION_NAME:-AutoDJ-Extreme}"
export STATION_DESCRIPTION="${STATION_DESCRIPTION:-Professional Radio}"
export STATION_LOCATION="${STATION_LOCATION:-Earth}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Validation Functions
# ═══════════════════════════════════════════════════════════════════════════

validate_password() {
    local password="$1"
    local name="$2"
    
    local len=${#password}
    if [ $len -lt 12 ]; then
        echo -e "${YELLOW}⚠ ${NC} $name is only $len characters (recommend 16+)"
        return 1
    fi
    return 0
}

validate_port() {
    local port="$1"
    local name="$2"
    
    if ! [[ "$port" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}✗${NC} $name must be a number: $port"
        return 1
    fi
    if [ $port -lt 1024 ] || [ $port -gt 65535 ]; then
        echo -e "${RED}✗${NC} $name out of range (1024-65535): $port"
        return 1
    fi
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
# Validate Configuration
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Validating configuration...${NC}"

VALIDATION_FAILED=0

# Validate passwords
validate_password "$ADMIN_PASSWORD" "ADMIN_PASSWORD" || VALIDATION_FAILED=1
validate_password "$SOURCE_PASSWORD" "SOURCE_PASSWORD" || VALIDATION_FAILED=1
validate_password "$RELAY_PASSWORD" "RELAY_PASSWORD" || VALIDATION_FAILED=1
validate_password "$AUTODJ_PASSWORD" "AUTODJ_PASSWORD" || VALIDATION_FAILED=1
validate_password "$LIVE_PASSWORD" "LIVE_PASSWORD" || VALIDATION_FAILED=1
validate_password "$STREAM_PASSWORD" "STREAM_PASSWORD" || VALIDATION_FAILED=1

# Validate ports (single port only - Pelican Panel compatible)
validate_port "$ICECAST_PORT" "ICECAST_PORT" || VALIDATION_FAILED=1

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# Generate icecast.xml
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Generating icecast.xml...${NC}"

cat > "${CONFIG_DIR}/icecast.xml" << 'EOF'
<?xml version="1.0"?>
<icecast>
    <!-- Icecast Configuration - AUTO-GENERATED from environment variables -->
    <!-- Do not edit manually - use generate-configs.sh -->

    <!-- Server Information -->
    <limits>
        <clients>ICECAST_MAX_CLIENTS_VAR</clients>
        <sources>10</sources>
        <threadpool>4</threadpool>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <burst-on-connect>1</burst-on-connect>
        <burst-size>ICECAST_BURST_SIZE_VAR</burst-size>
    </limits>

    <!-- Authentication -->
    <authentication>
        <source-password>SOURCE_PASSWORD_VAR</source-password>
        <relay-password>RELAY_PASSWORD_VAR</relay-password>
        <admin-user>ADMIN_USER_VAR</admin-user>
        <admin-password>ADMIN_PASSWORD_VAR</admin-password>
    </authentication>

    <!-- Shoutcast Compatibility -->
    <shoutcast-mount>/live.nsv</shoutcast-mount>

    <!-- Hostname & Port Configuration -->
    <listen-socket>
        <port>ICECAST_PORT_VAR</port>
        <bind-address>0.0.0.0</bind-address>
    </listen-socket>

    <!-- Logging Configuration -->
    <logging>
        <accesslog>LOG_DIR_VAR/access.log</accesslog>
        <errorlog>LOG_DIR_VAR/error.log</errorlog>
        <loglevel>4</loglevel>
        <logsize>10000</logsize>
    </logging>

    <!-- Security Settings -->
    <security>
        <ssl>0</ssl>
        <ssl-certificate></ssl-certificate>
    </security>

    <!-- Mount Points Configuration -->
    <mount type="default">
        <max-listeners>unlimited</max-listeners>
        <burst-size>65535</burst-size>
    </mount>

    <!-- Primary AutoDJ Mount (PUBLIC) -->
    <mount type="normal">
        <mount-name>/autodj</mount-name>
        <password>AUTODJ_PASSWORD_VAR</password>
        <max-listeners>0</max-listeners>
        <public>AUTODJ_PUBLIC_VAR</public>
    </mount>

    <!-- Live Stream Mount -->
    <mount type="normal">
        <mount-name>/live</mount-name>
        <password>LIVE_PASSWORD_VAR</password>
        <public>LIVE_PUBLIC_VAR</public>
        <fallback-mount>/autodj</fallback-mount>
    </mount>

    <!-- Relay/Stream Mount -->
    <mount type="normal">
        <mount-name>/stream</mount-name>
        <password>STREAM_PASSWORD_VAR</password>
        <public>STREAM_PUBLIC_VAR</public>
        <fallback-mount>/autodj</fallback-mount>
    </mount>

    <!-- MIME Type Mappings -->
    <mime-types>
        <mime type="application/javascript">.js</mime>
        <mime type="application/json">.json</mime>
        <mime type="application/xml">.xml</mime>
        <mime type="text/html">.html</mime>
        <mime type="text/plain">.txt</mime>
        <mime type="text/css">.css</mime>
        <mime type="image/svg+xml">.svg</mime>
        <mime type="image/png">.png</mime>
        <mime type="image/jpeg">.jpg</mime>
        <mime type="image/jpeg">.jpeg</mime>
        <mime type="image/gif">.gif</mime>
        <mime type="audio/mpeg">.mp3</mime>
        <mime type="audio/ogg">.ogg</mime>
        <mime type="audio/opus">.opus</mime>
        <mime type="audio/flac">.flac</mime>
        <mime type="audio/wav">.wav</mime>
    </mime-types>

    <!-- Webroot Configuration - uses default Icecast web files -->
    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>LOG_DIR_VAR</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>

    <!-- Hostname (for YP Directory) -->
    <hostname>localhost</hostname>
    <location>STATION_LOCATION_VAR</location>

    <!-- Master Server Settings -->
    <master-server>localhost</master-server>
    <master-server-port>8001</master-server-port>
    <master-update-interval>120</master-update-interval>
    <relay>
        <server>localhost</server>
        <port>8000</port>
        <mount>/autodj</mount>
        <local-mount>/relay</local-mount>
        <relay-shoutcast>0</relay-shoutcast>
    </relay>
</icecast>
EOF

# Replace variables in icecast.xml
sed -i "s/ADMIN_USER_VAR/${ADMIN_USER}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/ADMIN_PASSWORD_VAR/${ADMIN_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/SOURCE_PASSWORD_VAR/${SOURCE_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/RELAY_PASSWORD_VAR/${RELAY_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/AUTODJ_PASSWORD_VAR/${AUTODJ_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/LIVE_PASSWORD_VAR/${LIVE_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/STREAM_PASSWORD_VAR/${STREAM_PASSWORD}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/AUTODJ_PUBLIC_VAR/${AUTODJ_PUBLIC}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/LIVE_PUBLIC_VAR/${LIVE_PUBLIC}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/STREAM_PUBLIC_VAR/${STREAM_PUBLIC}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s|ICECAST_PORT_VAR|${ICECAST_PORT}|g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/ICECAST_MAX_CLIENTS_VAR/${ICECAST_MAX_CLIENTS}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s/ICECAST_BURST_SIZE_VAR/${ICECAST_BURST_SIZE}/g" "${CONFIG_DIR}/icecast.xml"
sed -i "s|LOG_DIR_VAR|${LOG_DIR}|g" "${CONFIG_DIR}/icecast.xml"
sed -i "s|STATION_LOCATION_VAR|${STATION_LOCATION}|g" "${CONFIG_DIR}/icecast.xml"

echo -e "${GREEN}✓${NC} icecast.xml generated"

# ═══════════════════════════════════════════════════════════════════════════
# Generate radio.liq (Liquidsoap)
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Generating radio.liq...${NC}"

cat > "${CONFIG_DIR}/radio.liq" << 'EOF'
#!/usr/bin/liquidsoap
# AutoDJ-Extreme Liquidsoap Configuration
# Extreme Edition v2.0 - AUTO-GENERATED from environment variables

# Logging configuration
set("log.file.path", "LOG_DIR_VAR/liquidsoap.log")
set("log.level", LOG_LEVEL_VAR)

# Directories
music_dir = "MUSIC_DIR_VAR"
playlist_dir = "PLAYLIST_DIR_VAR"
ads_dir = "ADS_DIR_VAR"
jingles_dir = "JINGLES_DIR_VAR"

# Load main playlist
music = playlist("MUSIC_DIR_VAR/playlist.m3u")

# Initialize with safety wrapper
radio = mksafe(music)

# Output to Icecast with environment-configured credentials
output.icecast(
    %mp3(bitrate=MP3_BITRATE_VAR),
    host="ICECAST_HOST_VAR",
    port=ICECAST_PORT_VAR,
    password="SOURCE_PASSWORD_VAR",
    mount="/autodj",
    radio
)

# Hourly credit message
thread.run(
    delay=3600.0,
    fun() -> log("[CREDIT] Powered by @zeropointbruh | github.com/ZEROPOINTBRUH/AutoDJ-Extreme")
)
EOF

# Replace variables in radio.liq
sed -i "s|LOG_DIR_VAR|${LOG_DIR}|g" "${CONFIG_DIR}/radio.liq"
sed -i "s|MUSIC_DIR_VAR|${MUSIC_DIR}|g" "${CONFIG_DIR}/radio.liq"
sed -i "s|PLAYLIST_DIR_VAR|${PLAYLIST_DIR}|g" "${CONFIG_DIR}/radio.liq"
sed -i "s|ADS_DIR_VAR|${ADS_DIR}|g" "${CONFIG_DIR}/radio.liq"
sed -i "s|JINGLES_DIR_VAR|${JINGLES_DIR}|g" "${CONFIG_DIR}/radio.liq"
sed -i "s/LOG_LEVEL_VAR/${LOG_LEVEL}/g" "${CONFIG_DIR}/radio.liq"
sed -i "s/MP3_BITRATE_VAR/${MP3_BITRATE}/g" "${CONFIG_DIR}/radio.liq"
sed -i "s/ICECAST_HOST_VAR/${ICECAST_HOST}/g" "${CONFIG_DIR}/radio.liq"
sed -i "s/ICECAST_PORT_VAR/${ICECAST_PORT}/g" "${CONFIG_DIR}/radio.liq"
sed -i "s/SOURCE_PASSWORD_VAR/${SOURCE_PASSWORD}/g" "${CONFIG_DIR}/radio.liq"

# Make executable
chmod +x "${CONFIG_DIR}/radio.liq"

echo -e "${GREEN}✓${NC} radio.liq generated"

# ═══════════════════════════════════════════════════════════════════════════
# Generate ezstream configurations (v0 and v1)
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Generating ezstream configs...${NC}"

cat > "${CONFIG_DIR}/ezstream.v0.xml" << 'EOF'
<?xml version="1.0"?>
<!-- Ezstream v0.x Configuration - AUTO-GENERATED -->
<ezstream>
    <server>
        <host>ICECAST_HOST_VAR</host>
        <port>ICECAST_PORT_VAR</port>
        <sourcepassword>SOURCE_PASSWORD_VAR</sourcepassword>
    </server>
    <source>
        <filename>MUSIC_DIR_VAR/playlist.m3u</filename>
        <format>MP3</format>
    </source>
    <stream>
        <mountpoint>/autodj</mountpoint>
        <bitrate>128</bitrate>
        <format>MP3</format>
    </stream>
</ezstream>
EOF

sed -i "s/ICECAST_HOST_VAR/${ICECAST_HOST}/g" "${CONFIG_DIR}/ezstream.v0.xml"
sed -i "s/ICECAST_PORT_VAR/${ICECAST_PORT}/g" "${CONFIG_DIR}/ezstream.v0.xml"
sed -i "s/SOURCE_PASSWORD_VAR/${SOURCE_PASSWORD}/g" "${CONFIG_DIR}/ezstream.v0.xml"
sed -i "s|MUSIC_DIR_VAR|${MUSIC_DIR}|g" "${CONFIG_DIR}/ezstream.v0.xml"

echo -e "${GREEN}✓${NC} ezstream.v0.xml generated"

cat > "${CONFIG_DIR}/ezstream.v1.xml" << 'EOF'
<?xml version="1.0"?>
<!-- Ezstream v1.x Configuration - AUTO-GENERATED -->
<ezstream>
    <general>
        <logfilename>LOG_DIR_VAR/ezstream.log</logfilename>
        <loglevel>3</loglevel>
    </general>
    <servers>
        <server>
            <hostname>ICECAST_HOST_VAR</hostname>
            <port>ICECAST_PORT_VAR</port>
            <password>SOURCE_PASSWORD_VAR</password>
            <mount>/autodj</mount>
            <format>MP3</format>
            <bitrate>128</bitrate>
        </server>
    </servers>
    <streams>
        <stream>
            <filename>MUSIC_DIR_VAR/playlist.m3u</filename>
            <server>0</server>
        </stream>
    </streams>
</ezstream>
EOF

sed -i "s|LOG_DIR_VAR|${LOG_DIR}|g" "${CONFIG_DIR}/ezstream.v1.xml"
sed -i "s/ICECAST_HOST_VAR/${ICECAST_HOST}/g" "${CONFIG_DIR}/ezstream.v1.xml"
sed -i "s/ICECAST_PORT_VAR/${ICECAST_PORT}/g" "${CONFIG_DIR}/ezstream.v1.xml"
sed -i "s/SOURCE_PASSWORD_VAR/${SOURCE_PASSWORD}/g" "${CONFIG_DIR}/ezstream.v1.xml"
sed -i "s|MUSIC_DIR_VAR|${MUSIC_DIR}|g" "${CONFIG_DIR}/ezstream.v1.xml"

echo -e "${GREEN}✓${NC} ezstream.v1.xml generated"

# ═══════════════════════════════════════════════════════════════════════════
# Generate .env.example for documentation
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Generating .env.example (documentation)...${NC}"

cat > "${REPO_DIR}/.env.example" << 'EOF'
# AutoDJ-Extreme Environment Configuration Example
# Copy this to .env and update with your values
# ⚠️  NEVER commit real .env files to git!

# ═══════════════════════════════════════════════════════════════════════════
# 🔐 SECURITY CREDENTIALS (CHANGE THESE!)
# ═══════════════════════════════════════════════════════════════════════════

ADMIN_USER=admin
ADMIN_PASSWORD=adminpassword123
SOURCE_PASSWORD=autodjpassword123
RELAY_PASSWORD=relaypassword123
AUTODJ_PASSWORD=autodjpassword123
LIVE_PASSWORD=livepassword123
STREAM_PASSWORD=streampassword123

# ═══════════════════════════════════════════════════════════════════════════
# 📡 NETWORK CONFIGURATION (SINGLE PORT - Pelican Panel Compatible)
# ═══════════════════════════════════════════════════════════════════════════

ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_MAX_CLIENTS=0
ICECAST_BURST_SIZE=65535

# Note: Only ONE port is used. Icecast serves streams, admin, and status pages.

# ═══════════════════════════════════════════════════════════════════════════
# 🎵 STREAM CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

# Public access settings (1=public/no auth, 0=private/requires password)
AUTODJ_PUBLIC=1
LIVE_PUBLIC=0
STREAM_PUBLIC=1

MP3_BITRATE=128
OGG_BITRATE=128

# ═══════════════════════════════════════════════════════════════════════════
# 🎼 CONTENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

MUSIC_DIR=/home/container/music
PLAYLIST_DIR=/home/container/playlists
ADS_DIR=/home/container/ads
JINGLES_DIR=/home/container/jingles
LOG_DIR=/home/container/log

ENABLE_ADS=false
AD_FREQUENCY=5
ENABLE_JINGLES=false
JINGLE_FREQUENCY=3
ENABLE_LIQUIDSOAP=true

# ═══════════════════════════════════════════════════════════════════════════
# 📊 LOGGING & MONITORING
# ═══════════════════════════════════════════════════════════════════════════

LOG_LEVEL=3
MONITOR_INTERVAL=30

# ═══════════════════════════════════════════════════════════════════════════
# 🌍 METADATA & HOSTING
# ═══════════════════════════════════════════════════════════════════════════

STATION_NAME=AutoDJ-Extreme
STATION_DESCRIPTION=Professional Radio
STATION_LOCATION=Earth
ADMIN_EMAIL=admin@example.com
EOF

echo -e "${GREEN}✓${NC} .env.example generated"

# ═══════════════════════════════════════════════════════════════════════════
# Generate .env.defaults
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${CYAN}Generating .env.defaults (fallback values)...${NC}"

cat > "${REPO_DIR}/.env.defaults" << 'EOF'
# Default Configuration Values
# These are used when environment variables are not set
# DO NOT modify this file - create .env instead

ADMIN_USER=admin
ADMIN_PASSWORD=adminpassword123
SOURCE_PASSWORD=autodjpassword123
RELAY_PASSWORD=relaypassword123
AUTODJ_PASSWORD=autodjpassword123
LIVE_PASSWORD=livepassword123
STREAM_PASSWORD=streampassword123

ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_MAX_CLIENTS=0
ICECAST_BURST_SIZE=65535

AUTODJ_PUBLIC=1
LIVE_PUBLIC=0
STREAM_PUBLIC=1

MP3_BITRATE=128
OGG_BITRATE=128

MUSIC_DIR=/home/container/music
PLAYLIST_DIR=/home/container/playlists
ADS_DIR=/home/container/ads
JINGLES_DIR=/home/container/jingles
LOG_DIR=/home/container/log

ENABLE_ADS=false
AD_FREQUENCY=5
ENABLE_JINGLES=false
JINGLE_FREQUENCY=3
ENABLE_LIQUIDSOAP=true

LOG_LEVEL=3
STATION_NAME=AutoDJ-Extreme
STATION_DESCRIPTION=Professional Radio
STATION_LOCATION=Earth
ADMIN_EMAIL=admin@example.com
EOF

echo -e "${GREEN}✓${NC} .env.defaults generated"

# ═══════════════════════════════════════════════════════════════════════════
# Final Output and Summary
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    CONFIGURATION SUMMARY                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓ Generated Configurations:${NC}"
echo "  • icecast.xml          - Icecast server config"
echo "  • radio.liq            - Liquidsoap audio engine config"
echo "  • ezstream.v0.xml      - Ezstream v0.x fallback config"
echo "  • ezstream.v1.xml      - Ezstream v1.x fallback config"
echo "  • .env.example         - Configuration template"
echo "  • .env.defaults        - Default/fallback values"
echo ""
echo -e "${GREEN}✓ Configuration Summary:${NC}"
echo "  Host: ${ICECAST_HOST}:${ICECAST_PORT}"
echo "  Max Clients: ${ICECAST_MAX_CLIENTS}"
echo "  Admin User: ${ADMIN_USER}"
echo "  Music Dir: ${MUSIC_DIR}"
echo "  Log Dir: ${LOG_DIR}"
echo "  Public Stream: /autodj (${AUTODJ_PUBLIC})"
echo "  Live Stream: /live (${LIVE_PUBLIC})"
echo "  Relay Stream: /stream (${STREAM_PUBLIC})"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Start services: systemctl restart icecast2"
echo "  2. Verify stream: http://${ICECAST_HOST}:${ICECAST_PORT}/status.xsl"
echo "  3. Test public access: http://${ICECAST_HOST}:${ICECAST_PORT}/autodj.mp3"
echo "  4. Change default passwords immediately!"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo "  • ENVIRONMENT_CONFIG.md - Complete environment variable reference"
echo "  • docs/guides/ - Detailed guides and best practices"
echo ""

if [ $VALIDATION_FAILED -eq 1 ]; then
    echo -e "${YELLOW}⚠ Configuration has warnings (see above)${NC}"
    echo -e "${YELLOW}  Recommended: Use 16+ character passwords${NC}"
else
    echo -e "${GREEN}✓ Configuration validated successfully!${NC}"
fi

echo ""
