# Icecast AutoDJ Radio - Enhanced Pterodactyl Egg Installation Guide

## Overview

This improved Pterodactyl egg provides a complete Icecast radio streaming solution with AutoDJ capabilities. The enhancement includes:

- **Robust error handling** and installation validation
- **Comprehensive environment variables** for customization
- **Improved security** with configurable passwords
- **Better logging** and status reporting
- **Fallback mechanisms** for reliability
- **Enhanced configuration** management

## What Gets Installed

The installation script automatically sets up:

### Core Components
- **Icecast2** - Audio streaming server
- **ezstream** - Audio stream automation tool
- **AutoDJ script** - Automated playlist management

### Directory Structure
```
/mnt/server/
├── icecast-autodj/          # Main application directory
│   ├── run.sh               # Startup script (executable)
│   └── configs/             # Configuration templates
├── icecast.xml              # Icecast server configuration
├── ezstream.xml             # ezstream configuration
├── playlist.m3u             # Playlist file
├── music/                   # Your music files go here
└── log/                     # Server logs
```

### System Links
- `/etc/ezstream/playlist.m3u` → `/mnt/server/playlist.m3u`
- `/var/log/icecast2/` → `/mnt/server/log/`

## Improvements Over Original

### 1. **Enhanced Installation Script**
- ✅ Colored logging (INFO, WARN, ERROR)
- ✅ Command validation before execution
- ✅ Error handling with exit codes
- ✅ Cleanup of existing installations
- ✅ Repository fallback mechanism
- ✅ Installation verification checks
- ✅ Detailed status reporting

### 2. **Environment Variables**
The improved egg includes 14 configurable environment variables:

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `REPO_URL` | Git repository URL | Your GitHub repo | Required, max 256 chars |
| `SOURCE_PASSWORD` | Source connection password | hackme | Required, 8-64 chars |
| `ADMIN_PASSWORD` | Admin interface password | hackme | Required, 8-64 chars |
| `ADMIN_USER` | Admin username | admin | Required, max 32 chars |
| `RELAY_PASSWORD` | Relay server password | hackme | Required, 8-64 chars |
| `MOUNT_POINT` | Stream mount point | /radio.mp3 | Required, max 64 chars |
| `MAX_CLIENTS` | Max concurrent listeners | 100 | Integer, 1-10000 |
| `MAX_SOURCES` | Max streaming sources | 2 | Integer, 1-10 |
| `STREAM_FORMAT` | Audio format | MP3 | MP3, OGG, OPUS, AAC |
| `ENCODER` | Audio encoder | LAME | Required, max 32 chars |
| `METADATA_PROGRAM` | Metadata extraction tool | /usr/bin/ffprobe | Nullable, max 128 chars |
| `HOSTNAME` | Server hostname/IP | localhost | Required, max 128 chars |
| `LOCATION` | Server location | Earth | Nullable, max 64 chars |
| `ADMIN_EMAIL` | Admin contact email | admin@example.com | Required, valid email |

### 3. **Security Enhancements**
- Configurable passwords with validation (minimum 8 characters)
- Separate credentials for admin, source, and relay
- Email validation for admin contact
- No hardcoded credentials in the egg file

### 4. **Better Configuration Management**
- XML parser integration for both Icecast and ezstream configs
- Dynamic port allocation from Pterodactyl
- Automatic configuration file updates
- Support for multiple mount points and stream formats

### 5. **Reliability Features**
- Installation verification with 6 critical checks
- Fallback repository if primary fails
- Graceful handling of missing files
- Proper ownership and permissions setup

## Installation Steps

### 1. Import the Egg
1. Download `radio-improved.json` from this repository
2. Navigate to your Pterodactyl panel admin area
3. Go to **Nests** → **Import Egg**
4. Upload the JSON file
5. Configure the egg settings

### 2. Update GitHub References
Before using the egg, replace all instances of `YOUR_GITHUB_USERNAME` with your actual GitHub username in:
- Line 14: Docker image reference
- Line 24: Repository URL variable default
- Line 114: Installation script container

### 3. Create a Server
1. Create a new server using the imported egg
2. Configure environment variables (especially passwords!)
3. Allocate a port for the stream
4. Start the installation

### 4. Upload Music
1. Once installed, navigate to the `/music` directory
2. Upload your audio files (MP3, OGG, etc.)
3. The AutoDJ will automatically generate playlists

### 5. Access Your Stream
- **Listen**: `http://YOUR_IP:PORT/radio.mp3` (or your configured mount point)
- **Admin Panel**: `http://YOUR_IP:PORT/admin`
- **Status Page**: `http://YOUR_IP:PORT/status.xsl`

## Configuration Examples

### High-Traffic Setup
```
MAX_CLIENTS=1000
MAX_SOURCES=5
STREAM_FORMAT=MP3
```

### Low-Bitrate/Mobile Setup
```
STREAM_FORMAT=OPUS
ENCODER=opus
MAX_CLIENTS=50
```

### Multiple Streams
```
MOUNT_POINT=/radio.mp3
# Additional mount points configured in icecast.xml
```

## Troubleshooting

### Installation Fails
1. Check server logs for specific error messages
2. Verify git is installed in the container
3. Ensure the repository URL is accessible
4. Check container has proper permissions

### Stream Not Playing
1. Verify music files are in `/music` directory
2. Check `playlist.m3u` is populated
3. Review logs in `/log` directory
4. Confirm port allocation in Pterodactyl

### Can't Access Admin Panel
1. Verify `ADMIN_PASSWORD` is set correctly
2. Check server is listening on allocated port
3. Ensure firewall allows the port
4. Try accessing via server IP instead of localhost

## Security Recommendations

### Before Production
1. **Change ALL default passwords** (source, admin, relay)
2. **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
3. **Set valid admin email** for contact/notifications
4. **Configure firewall** to restrict admin panel access
5. **Use HTTPS proxy** (nginx/Apache) for secure access
6. **Regular updates** of the container and source code

### Password Best Practices
```bash
# Generate strong passwords
openssl rand -base64 24
```

## Advanced Configuration

### Custom Repository
If you've forked the icecast-autodj repository:
```
REPO_URL=https://github.com/YOUR_USERNAME/your-fork.git
```

### Custom Docker Image
Update the egg JSON:
```json
"images": [
    "your-registry.com/your-image:tag"
]
```

### Multiple Mount Points
Edit `icecast.xml` to add additional mount points with different encodings:
```xml
<mount>
    <mount-name>/radio-high.mp3</mount-name>
    <bitrate>320</bitrate>
</mount>
```

## Support

For issues, questions, or contributions:
- **Repository**: https://github.com/YOUR_GITHUB_USERNAME/pterodactyl-radio-streaming
- **Issues**: https://github.com/YOUR_GITHUB_USERNAME/pterodactyl-radio-streaming/issues
- **Documentation**: https://github.com/YOUR_GITHUB_USERNAME/pterodactyl-radio-streaming/wiki

## License

This egg configuration is released under the MIT License. See the main repository LICENSE file for details.

## Credits

- **Original egg creator**: jensjeflensje
- **Enhanced by**: Your Name
- **Icecast**: Xiph.Org Foundation
- **ezstream**: Xiph.Org Foundation
