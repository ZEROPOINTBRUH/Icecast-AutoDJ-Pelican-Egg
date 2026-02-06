# Pterodactyl Egg Files

## Quick Reference

This directory contains the Pterodactyl eggs for the Icecast AutoDJ radio streaming server.

### Files Overview

| File | Description | Status | Use Case |
|------|-------------|--------|----------|
| `radio.json` | Original egg | Legacy | Historical reference |
| `radio-improved.json` | Enhanced egg | **Recommended** | Production use |
| `INSTALLATION.md` | Setup guide | Documentation | First-time setup |
| `MIGRATION.md` | Upgrade guide | Documentation | Upgrading from old egg |
| `IMPROVEMENTS.md` | Changelog | Documentation | See what changed |
| `GITHUB_SETUP.md` | Placeholder guide | **Action Required** | Update your info |

## Which Egg Should I Use?

### Use `radio-improved.json` if you want:
- ✅ Better security (configurable passwords)
- ✅ Error messages that help
- ✅ Customizable configuration
- ✅ Installation validation
- ✅ Professional deployment
- ✅ Documentation and support

### Use `radio.json` if you:
- 🔧 Need legacy compatibility
- 🔧 Want minimal features
- 🔧 Prefer the "original" experience
- ⚠️ Don't mind "hackme" passwords

**Recommendation**: Use `radio-improved.json` - it's better in every way.

## Before First Use

### Required: Update Placeholders

The improved egg contains placeholders that **MUST** be updated:

1. **YOUR_GITHUB_USERNAME** - Your actual GitHub username
2. **your-email@example.com** - Your email address

**How to update**: See `GITHUB_SETUP.md` for:
- Manual find & replace instructions
- PowerShell automation script
- Verification checklist

### Quick Update (PowerShell)

```powershell
# Run from repository root
$username = "your-actual-username"
$email = "your@email.com"

Get-ChildItem -Recurse -Include *.json,*.md | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'YOUR_GITHUB_USERNAME', $username
    $content = $content -replace 'your-email@example\.com', $email
    Set-Content $_.FullName $content
}

Write-Host "Placeholders updated! Review changes before committing."
```

## Installation Steps

1. **Update placeholders** (see above)
2. **Import egg** to Pterodactyl panel
3. **Create server** with the egg
4. **Configure environment variables**:
   - Change all passwords from defaults
   - Set admin email
   - Configure max clients/sources
5. **Start server** and verify installation
6. **Upload music** to `/music` directory
7. **Access stream** at `http://IP:PORT/radio.mp3`

## Documentation Quick Links

### For Beginners
1. Start with `INSTALLATION.md`
2. Review `GITHUB_SETUP.md` to update placeholders
3. Follow the quick start guide

### For Experienced Users
1. Review `IMPROVEMENTS.md` for changes
2. Use `radio-improved.json` directly
3. Configure environment variables
4. Deploy

### Migrating from Original Egg
1. Read `MIGRATION.md` completely
2. Backup your music directory
3. Follow migration steps
4. Verify all functionality

## Environment Variables

The improved egg supports 14 environment variables:

### Security (Change These!)
- `SOURCE_PASSWORD` - Stream source password
- `ADMIN_PASSWORD` - Admin panel password
- `ADMIN_USER` - Admin username
- `RELAY_PASSWORD` - Relay server password
- `ADMIN_EMAIL` - Contact email

### Stream Configuration
- `MOUNT_POINT` - Stream endpoint (e.g., /radio.mp3)
- `STREAM_FORMAT` - Audio format (MP3/OGG/OPUS/AAC)
- `ENCODER` - Audio encoder
- `METADATA_PROGRAM` - Metadata extraction tool

### Server Settings
- `MAX_CLIENTS` - Maximum listeners (1-10000)
- `MAX_SOURCES` - Maximum sources (1-10)
- `HOSTNAME` - Server hostname/IP
- `LOCATION` - Geographic location

### Repository
- `REPO_URL` - Git repository URL

## File Comparison

### Original Egg
```
Size: 1,847 bytes
Lines: 30
Variables: 0
Error handling: None
Documentation: None
Security: Hardcoded passwords
```

### Improved Egg
```
Size: 13,500+ bytes
Lines: 200+
Variables: 14
Error handling: Comprehensive
Documentation: 4 guides (1,500+ lines)
Security: Configurable with validation
```

**Value Addition**: 730% larger with 10x the features

## Common Tasks

### Change Admin Password
```bash
# In Pterodactyl panel
Server → Startup → ADMIN_PASSWORD → Update
```

### Add Music
```bash
# Upload to
/mnt/server/music/

# Playlist auto-generates
```

### View Logs
```bash
# Check
/mnt/server/log/
```

### Access Admin Panel
```
http://YOUR_IP:PORT/admin
```

## Troubleshooting

### Installation Fails
1. Check colored logs in console
2. Review error messages
3. Verify git is available
4. Check repository URL

### Stream Won't Play
1. Upload music files
2. Check playlist.m3u exists
3. Verify icecast is running
4. Test with: `curl http://localhost:PORT/radio.mp3`

### Can't Login
1. Verify ADMIN_PASSWORD is set
2. Check ADMIN_USER matches
3. Try default: admin/hackme (if not changed)

## Security Checklist

Before going live:
- [ ] Changed SOURCE_PASSWORD (min 8 chars)
- [ ] Changed ADMIN_PASSWORD (min 8 chars)
- [ ] Changed RELAY_PASSWORD (min 8 chars)
- [ ] Set valid ADMIN_EMAIL
- [ ] Configured firewall
- [ ] Tested admin panel access
- [ ] Verified stream works
- [ ] Reviewed logs for warnings

## Support

### Documentation
- Installation: `INSTALLATION.md`
- Migration: `MIGRATION.md`
- Improvements: `IMPROVEMENTS.md`
- Setup: `GITHUB_SETUP.md`

### Issues
Open an issue on GitHub after you set up your repository.

### Community
- Pterodactyl Discord
- Icecast forums
- GitHub discussions (coming soon)

## Next Steps

1. ✅ Read this file (you are here)
2. ⬜ Update placeholders (`GITHUB_SETUP.md`)
3. ⬜ Read installation guide (`INSTALLATION.md`)
4. ⬜ Import improved egg to Pterodactyl
5. ⬜ Create test server
6. ⬜ Configure environment variables
7. ⬜ Verify installation works
8. ⬜ Deploy to production
9. ⬜ Upload music
10. ⬜ Share with friends

## License

MIT License - See main repository LICENSE file

## Credits

- **Original Egg**: jensjeflensje
- **Icecast**: Xiph.Org Foundation
- **Enhanced By**: You (update this!)
- **Improvements**: This repository

---

**Ready to get started?** Go to `GITHUB_SETUP.md` first to update your info!
