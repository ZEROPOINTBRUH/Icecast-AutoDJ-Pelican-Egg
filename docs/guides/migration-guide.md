# Migration Guide: Original → Enhanced Egg

## Overview

This guide helps you migrate from the original `radio.json` egg to the improved `radio-improved.json` egg.

## Key Differences

### What's Preserved
✅ **All original functionality** - Everything the old egg did, the new one does better  
✅ **Icecast installation** - Same core Icecast2 setup  
✅ **ezstream configuration** - Same streaming automation  
✅ **AutoDJ functionality** - Same playlist management  
✅ **Directory structure** - Same file locations  
✅ **Music directory** - Same `/music` location for your files  
✅ **Configuration files** - Same XML configs (with enhancements)  

### What's Improved
🚀 **Installation script** - 300+ lines of robust bash with error handling  
🚀 **Environment variables** - 14 configurable options vs 0  
🚀 **Security** - Configurable passwords instead of hardcoded  
🚀 **Logging** - Colored output with INFO/WARN/ERROR levels  
🚀 **Validation** - 6 installation verification checks  
🚀 **Fallback** - Automatic retry with backup repository  
🚀 **Configuration** - Dynamic XML parsing for both configs  
🚀 **Documentation** - Complete setup and troubleshooting guides  

## Migration Steps

### Option 1: Fresh Installation (Recommended)

**Best for**: New servers or testing

1. **Backup your music** (if you have existing data)
   ```bash
   # From your existing server
   tar -czf music-backup.tar.gz /mnt/server/music/
   ```

2. **Import the new egg** to your Pterodactyl panel

3. **Create a new server** with the enhanced egg

4. **Configure environment variables**:
   - Set strong passwords
   - Configure admin email
   - Adjust max clients/sources
   - Set your mount point

5. **Start the server** and let it install

6. **Restore your music** (if you had a backup)
   ```bash
   tar -xzf music-backup.tar.gz -C /mnt/server/
   ```

### Option 2: In-Place Update (Advanced)

**Best for**: Production servers with existing data

⚠️ **Warning**: This requires server downtime and has risks. Test in staging first!

1. **Stop your existing server**

2. **Backup everything**:
   ```bash
   cd /mnt/server
   tar -czf backup-$(date +%Y%m%d).tar.gz .
   ```

3. **Update the egg** in Pterodactyl panel:
   - Go to server settings
   - Change egg to "Icecast-AutoDJ-Radio-Enhanced"

4. **Configure environment variables** in server settings

5. **Reinstall the server** (this will run the new install script)
   - ⚠️ This preserves `/mnt/server/music/` but reinstalls the application

6. **Verify installation**:
   ```bash
   # Check for required files
   ls -la /mnt/server/icecast-autodj/
   ls -la /mnt/server/music/
   ```

7. **Start the server** and test streaming

## Environment Variable Configuration

The new egg requires configuration. Here are recommended starting values:

### Security Settings (CHANGE THESE!)
```
SOURCE_PASSWORD=your-secure-source-password-here
ADMIN_PASSWORD=your-secure-admin-password-here
RELAY_PASSWORD=your-secure-relay-password-here
ADMIN_USER=admin
ADMIN_EMAIL=your-email@domain.com
```

### Stream Settings
```
MOUNT_POINT=/radio.mp3
STREAM_FORMAT=MP3
ENCODER=LAME
MAX_CLIENTS=100
MAX_SOURCES=2
```

### Server Settings
```
HOSTNAME=your-domain.com (or server IP)
LOCATION=Your City, Country
METADATA_PROGRAM=/usr/bin/ffprobe
```

### Repository Settings
```
REPO_URL=https://github.com/YOUR_GITHUB_USERNAME/icecast-autodj.git
```

## Comparison Chart

| Feature | Original Egg | Enhanced Egg |
|---------|-------------|--------------|
| Installation script | 11 lines | 150+ lines with error handling |
| Environment variables | 0 | 14 configurable options |
| Error handling | None | Comprehensive with logging |
| Validation checks | None | 6 critical verifications |
| Security | Hardcoded passwords | Configurable with validation |
| Logging | Basic | Color-coded INFO/WARN/ERROR |
| Fallback | None | Auto-retry with backup repo |
| Documentation | Minimal | Complete guides |
| Configuration | Static | Dynamic XML parsing |
| Docker image | Public | Customizable (your registry) |
| Repository | Fixed | Configurable |
| Passwords | "hackme" | User-defined, min 8 chars |
| Admin interface | Basic auth | Configurable user/pass |
| Stream format | Fixed | MP3/OGG/OPUS/AAC |

## Verification Checklist

After migration, verify:

- [ ] Server starts without errors
- [ ] Music files are accessible in `/music` directory
- [ ] Stream is accessible at `http://IP:PORT/radio.mp3`
- [ ] Admin panel works at `http://IP:PORT/admin`
- [ ] Playlist generation works
- [ ] Logs are being written to `/log` directory
- [ ] Can connect with new admin credentials
- [ ] Can add music and it appears in playlist
- [ ] Stream plays correctly in media players
- [ ] Metadata displays correctly

## Troubleshooting Migration Issues

### Old passwords don't work
**Solution**: The new egg uses environment variables. Set them in Pterodactyl server settings.

### Installation fails with "repository not found"
**Solution**: Update `REPO_URL` variable to point to your GitHub repository.

### Music directory is empty
**Solution**: Your music wasn't backed up. Re-upload files to `/mnt/server/music/`

### Permission denied errors
**Solution**: The new script sets ownership properly. Try reinstalling.

### Stream won't start
**Solution**: 
1. Check logs in `/mnt/server/log/`
2. Verify `icecast.xml` exists
3. Verify `ezstream.xml` exists
4. Check port allocation in Pterodactyl

### Can't access admin panel
**Solution**:
1. Verify `ADMIN_PASSWORD` environment variable is set
2. Check `ADMIN_USER` environment variable
3. Try default credentials if variables aren't saved

## Rollback Procedure

If migration fails and you need to rollback:

1. **Stop the server**

2. **Restore your backup**:
   ```bash
   cd /mnt/server
   rm -rf *
   tar -xzf backup-YYYYMMDD.tar.gz
   ```

3. **Change egg back** to original in Pterodactyl

4. **Start the server**

## Testing Checklist Before Production

Test in a staging environment:

- [ ] Installation completes successfully
- [ ] All environment variables apply correctly
- [ ] Stream starts and plays
- [ ] Admin panel accessible with new credentials
- [ ] Music uploads work
- [ ] Playlist auto-generates
- [ ] Logs are created and readable
- [ ] Performance is acceptable
- [ ] No unexpected errors in logs

## Post-Migration Optimization

After successful migration:

1. **Review logs** for any warnings
2. **Adjust max clients** based on server capacity
3. **Configure bitrates** for your audience
4. **Set up monitoring** for uptime
5. **Document your setup** for future reference
6. **Test disaster recovery** by restoring backup
7. **Update documentation** with your specifics

## Getting Help

If you encounter issues during migration:

1. **Check logs**: `/mnt/server/log/`
2. **Review install output**: Pterodactyl console during installation
3. **Verify environment variables**: Server settings panel
4. **Test connectivity**: `telnet IP PORT`
5. **Open an issue**: https://github.com/YOUR_GITHUB_USERNAME/pterodactyl-radio-streaming/issues

## Best Practices

### Before Migration
- ✅ Test in staging environment
- ✅ Backup all data
- ✅ Document current configuration
- ✅ Schedule maintenance window
- ✅ Notify listeners of downtime

### During Migration
- ✅ Follow steps sequentially
- ✅ Verify each step completes
- ✅ Keep backup accessible
- ✅ Monitor for errors
- ✅ Don't skip validation checks

### After Migration
- ✅ Test all functionality
- ✅ Monitor for 24-48 hours
- ✅ Update documentation
- ✅ Keep backup for 30 days
- ✅ Share feedback for improvements
