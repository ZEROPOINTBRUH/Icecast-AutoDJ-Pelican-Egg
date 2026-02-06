# 🎵 Audio Format Support Reference

**Enhanced Icecast AutoDJ - Format Compatibility**  
Created by: @zeropointbruh (wegj1@hotmail.com)

---

## Supported Formats

The Extreme Edition supports **11+ audio formats** out of the box:

| Format | Extension | Codec | Use Case | Quality |
|--------|-----------|-------|----------|---------|
| **MP3** | `.mp3` | MPEG-1/2 Audio Layer 3 | Universal compatibility | Good |
| **OGG Vorbis** | `.ogg` | Vorbis | Open source, efficient | Excellent |
| **OPUS** | `.opus` | Opus | Modern, low latency | Excellent |
| **FLAC** | `.flac` | FLAC | Lossless quality | Perfect |
| **M4A** | `.m4a` | AAC | Apple/iTunes standard | Excellent |
| **AAC** | `.aac` | Advanced Audio Coding | Streaming optimized | Excellent |
| **WAV** | `.wav` | PCM | Uncompressed | Perfect |
| **WMA** | `.wma` | Windows Media Audio | Windows compatibility | Good |
| **AIFF** | `.aiff` | Apple PCM | Apple uncompressed | Perfect |
| **APE** | `.ape` | Monkey's Audio | High compression lossless | Perfect |
| **ALAC** | `.alac` | Apple Lossless | Apple lossless | Perfect |

---

## Format Details

### MP3 (MPEG Audio Layer 3)
- **Best for:** Maximum compatibility
- **Bitrates:** 32-320 kbps
- **Recommended:** 128-192 kbps for streaming
- **Pros:** Universal support, small file size
- **Cons:** Lossy compression

### OGG Vorbis
- **Best for:** Open source projects
- **Bitrates:** Variable (quality 0-10)
- **Recommended:** Quality 5-7 (~160-224 kbps)
- **Pros:** Better quality than MP3 at same bitrate
- **Cons:** Less device support

### OPUS
- **Best for:** Modern streaming, low latency
- **Bitrates:** 6-510 kbps
- **Recommended:** 96-128 kbps for speech, 128-192 for music
- **Pros:** Best quality/bitrate ratio, low latency
- **Cons:** Newer format, less support

### FLAC (Free Lossless Audio Codec)
- **Best for:** Archival quality
- **Compression:** ~50-70% of original size
- **Quality:** Bit-perfect lossless
- **Pros:** Perfect quality, open source
- **Cons:** Large files, high bandwidth

### M4A/AAC
- **Best for:** Apple ecosystem
- **Bitrates:** 64-320 kbps
- **Recommended:** 128-256 kbps
- **Pros:** Better than MP3 at low bitrates
- **Cons:** Licensing issues

### WAV (Waveform Audio)
- **Best for:** Studio quality, editing
- **Quality:** Uncompressed PCM
- **Pros:** Perfect quality, simple format
- **Cons:** Very large files

### WMA (Windows Media Audio)
- **Best for:** Windows environments
- **Bitrates:** 48-320 kbps
- **Pros:** Windows native support
- **Cons:** Limited cross-platform support

### AIFF (Audio Interchange File Format)
- **Best for:** Apple production
- **Quality:** Uncompressed
- **Pros:** Perfect quality, Apple standard
- **Cons:** Very large files

### APE (Monkey's Audio)
- **Best for:** Archival with maximum compression
- **Compression:** Better than FLAC
- **Pros:** Highest compression for lossless
- **Cons:** Slower decoding, less support

### ALAC (Apple Lossless Audio Codec)
- **Best for:** Apple ecosystem lossless
- **Compression:** Similar to FLAC
- **Pros:** Apple native, lossless
- **Cons:** Apple-centric

---

## Streaming Recommendations

### For Radio Stations
**Format:** MP3  
**Bitrate:** 128 kbps (standard) or 192 kbps (high quality)  
**Why:** Maximum compatibility with all devices and players

### For Audiophile Stations
**Format:** OPUS or OGG Vorbis  
**Bitrate:** 192-256 kbps  
**Why:** Better quality than MP3 at same bitrate

### For Podcast Streaming
**Format:** MP3  
**Bitrate:** 64-96 kbps (speech optimized)  
**Why:** Smaller files, voice clarity

### For Music Archive Streaming
**Format:** FLAC or ALAC  
**Why:** Lossless quality for critical listening

---

## Transcoding Capabilities

The enhanced run script automatically handles:

1. **Format Detection** - Identifies file types automatically
2. **On-the-fly Transcoding** - Converts to stream format
3. **Quality Normalization** - Consistent output bitrate
4. **Metadata Preservation** - Keeps artist/title info

### Transcoding Flow
```
Input File → Decode → Normalize → Encode → Stream
(Any format)  (FFmpeg)  (Volume)   (LAME)   (Icecast)
```

---

## Where Formats Work

All formats are supported in:

- ✅ `/music` directory
- ✅ `/ads` directory  
- ✅ `/jingles` directory
- ✅ `/playlists/*` subdirectories

No configuration needed - just upload and play!

---

## Format Detection

The system scans using these patterns:

```bash
*.mp3    # Case insensitive
*.ogg
*.opus
*.flac
*.m4a
*.aac
*.wav
*.wma
*.aiff
*.ape
*.alac
```

Files are found recursively in all subdirectories.

---

## Quality Comparison

### Lossy Formats (Smallest → Largest at same bitrate)
1. OPUS (best quality/size ratio)
2. OGG Vorbis
3. AAC/M4A
4. MP3
5. WMA

### Lossless Formats (Smallest → Largest)
1. APE (highest compression)
2. FLAC
3. ALAC
4. WAV (uncompressed)
5. AIFF (uncompressed)

---

## Bandwidth Calculator

### For 128 kbps Stream
- **1 listener:** 128 kbps = 16 KB/s = 57.6 MB/hour
- **10 listeners:** 1.28 Mbps = 576 MB/hour
- **100 listeners:** 12.8 Mbps = 5.76 GB/hour

### For 192 kbps Stream
- **1 listener:** 192 kbps = 24 KB/s = 86.4 MB/hour
- **10 listeners:** 1.92 Mbps = 864 MB/hour
- **100 listeners:** 19.2 Mbps = 8.64 GB/hour

---

## Common Issues

### "Format not supported"
**Cause:** File might be corrupted or unusual codec  
**Fix:** Re-encode with standard encoder

### "No audio playing"
**Cause:** Files might be DRM-protected  
**Fix:** Use DRM-free files only

### "Poor quality streaming"
**Cause:** Source files are low quality  
**Fix:** Use higher quality source files

---

## Best Practices

1. **Consistent Format** - Use same format for all music
2. **Normalize Volume** - Use tools like MP3Gain
3. **Check Sample Rate** - 44.1 kHz is standard
4. **Tag Metadata** - Include artist/title in files
5. **Test First** - Verify files play before uploading
6. **Backup Originals** - Keep lossless backups

---

## Tools for Format Conversion

### FFmpeg (Recommended)
```bash
# Convert to MP3
ffmpeg -i input.flac -b:a 192k output.mp3

# Convert to OGG
ffmpeg -i input.wav -c:a libvorbis -q:a 6 output.ogg

# Convert to OPUS
ffmpeg -i input.m4a -c:a libopus -b:a 128k output.opus
```

### Batch Conversion
```bash
# Convert all FLAC to MP3
for file in *.flac; do
    ffmpeg -i "$file" -b:a 192k "${file%.flac}.mp3"
done
```

---

## Future Format Support

Planning to add:
- APE v2
- DSD (Direct Stream Digital)
- MQA (Master Quality Authenticated)

Submit requests via GitHub Issues!

---

## 📞 Support

**Questions about formats?**
- 📧 Email: wegj1@hotmail.com
- 💬 Discord: @zeropointbruh
- 🌐 Website: https://banabyte.com
