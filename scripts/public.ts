// @ts-nocheck
import fs from "fs";
import crypto from "crypto";
import net from "net";

const AUTODJ_HOST = process.env.AUTODJ_HOST || "autodj";
const AUTODJ_PORT = process.env.AUTODJ_PORT || "8000";
const PUBLIC_PORT = Number(process.env.PUBLIC_PORT || "3000");
const ICECAST_PORT = process.env.AUTODJ_PORT || "8000";
const SERVER_IP = process.env.SERVER_IP || process.env.INTERNAL_IP || "localhost";

const AUTODJ_STATUS_URL = `http://${AUTODJ_HOST}:${AUTODJ_PORT}/status-json.xsl`;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || '';
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET || '';
const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme';
const STATION_NAME = process.env.STATION_NAME || 'AutoDJ-Extreme';
const STATION_DESCRIPTION = process.env.STATION_DESCRIPTION || '';
const STATION_GENRE = process.env.STATION_GENRE || '';
const LIQUIDSOAP_TELNET_PORT = 1234;
const storageBase = './storage';

// In-memory vote store (resets on restart)
const votes: Map<string, { track: string, voters: Set<string>, ts: number }> = new Map();
const musicDir = `${storageBase}/music`;
const playlistsDir = `${storageBase}/playlists`;
const adsDir = `${storageBase}/ads`;
const artworkDir = `${storageBase}/artwork`;
const settingsFile = `${storageBase}/settings.json`;

const fsp = fs.promises;

async function ensureDirs() {
  await Promise.all([
    fsp.mkdir(musicDir, { recursive: true }),
    fsp.mkdir(playlistsDir, { recursive: true }),
    fsp.mkdir(adsDir, { recursive: true }),
    fsp.mkdir(artworkDir, { recursive: true }),
  ]);
}

// Settings persistence
const DEFAULT_SETTINGS: Record<string, any> = { accentColor: '#1db954', stationName: '', stationDescription: '', stationGenre: '' };

async function loadSettings(): Promise<Record<string, any>> {
  try {
    const raw = await fsp.readFile(settingsFile, 'utf8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function saveSettings(data: Record<string, any>) {
  const current = await loadSettings();
  const merged = { ...current, ...data };
  await fsp.writeFile(settingsFile, JSON.stringify(merged, null, 2));
  return merged;
}

// Artwork cache — fetch from iTunes Search API
async function fetchArtwork(artist: string, title: string): Promise<string | null> {
  if (!artist && !title) return null;
  const cacheKey = md5(`${artist}-${title}`);
  const cachePath = `${artworkDir}/${cacheKey}.jpg`;

  // Check cache first
  try {
    await fsp.access(cachePath);
    return cachePath;
  } catch {}

  // Fetch from iTunes
  try {
    const query = encodeURIComponent(`${artist} ${title}`.trim());
    const itunesUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
    const res = await fetch(itunesUrl);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      let artUrl = data.results[0].artworkUrl100 || '';
      // Upscale to 600x600
      artUrl = artUrl.replace('100x100bb', '600x600bb');
      if (artUrl) {
        const imgRes = await fetch(artUrl);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        await fsp.writeFile(cachePath, imgBuf);
        return cachePath;
      }
    }
  } catch {}

  // Write empty marker so we don't re-fetch
  try { await fsp.writeFile(`${artworkDir}/${cacheKey}.miss`, ''); } catch {}
  return null;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: defaultCorsHeaders() });
}

function defaultCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}

async function fetchAutodjStatusJson() {
  try {
    const res = await fetch(AUTODJ_STATUS_URL);
    const text = await res.text();
    // Icecast 2.4+ /status-json.xsl returns JSON directly
    const parsed = JSON.parse(text);
    return jsonResponse(parsed);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 502);
  }
}

function requireAdmin(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7).trim();
  return token === ADMIN_KEY;
}

function md5(s: string) {
  return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function lastfmApi(method: string, params: Record<string,string>) {
  // build signed request for POST to Last.fm
  const base: Record<string,string> = { api_key: LASTFM_API_KEY, format: 'json', method };
  const all = { ...base, ...params };
  // create api_sig: concat all keys sorted
  const keys = Object.keys(all).sort();
  let s = '';
  for (const k of keys) s += `${k}${all[k]}`;
  s += LASTFM_API_SECRET;
  const api_sig = md5(s);
  const body = new URLSearchParams({ ...all, api_sig });
  const res = await fetch('https://ws.audioscrobbler.com/2.0/', { method: 'POST', body });
  return await res.json();
}

async function listDir(dir: string) {
  try {
    const files = await fsp.readdir(dir, { withFileTypes: true });
    const out = [];
    for (const f of files) {
      if (f.isFile()) {
        const stat = await fsp.stat(`${dir}/${f.name}`);
        out.push({ name: f.name, size: stat.size });
      }
    }
    return out;
  } catch (e) {
    return [];
  }
}

async function saveUploadedFile(file: File | Blob, destPath: string) {
  const ab = await (file as any).arrayBuffer();
  await fsp.writeFile(destPath, Buffer.from(ab));
}

// Send a command to Liquidsoap via telnet
function liquidsoapCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection(LIQUIDSOAP_TELNET_PORT, '127.0.0.1', () => {
      sock.write(cmd + '\n');
      // Small delay before quit so response comes back
      setTimeout(() => sock.write('quit\n'), 200);
    });
    let data = '';
    sock.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    sock.on('end', () => resolve(data));
    sock.on('error', (err: Error) => reject(err));
    sock.setTimeout(5000, () => { sock.destroy(); reject(new Error('timeout')); });
  });
}

// Try multiple skip commands for different Liquidsoap versions
async function skipTrack(): Promise<string> {
  const commands = ['music.skip', 'skip', 'radio.skip'];
  for (const cmd of commands) {
    try {
      const result = await liquidsoapCommand(cmd);
      if (!result.toLowerCase().includes('error') && !result.toLowerCase().includes('unknown')) {
        return result;
      }
    } catch {}
  }
  // Fall back to first command even if it errors
  return await liquidsoapCommand('music.skip');
}

// Parse Icecast status JSON into a clean metadata object
function parseIcecastStatus(raw: any) {
  const icestats = raw?.icestats || raw || {};
  let source = icestats.source;
  // source could be an array (multiple mounts) or a single object
  if (Array.isArray(source)) source = source[0];
  if (!source) source = {};

  // Icecast sends "Artist - Title" in the title field (from Liquidsoap metadata)
  let artist = source.artist || '';
  let title = source.title || '';

  // If title contains " - ", split into artist/title
  if (!artist && title && title.includes(' - ')) {
    const parts = title.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  // Fallback to yp_currently_playing
  if (!title && source.yp_currently_playing) {
    title = source.yp_currently_playing;
  }

  // Fallback: use server_name or nothing
  if (!title) title = '';
  if (!artist) artist = '';

  return {
    title,
    artist,
    album: source.album || '',
    genre: source.genre || STATION_GENRE,
    bitrate: source.audio_bitrate || source.ice_bitrate || source.bitrate || '',
    samplerate: source.samplerate || '',
    channels: source.channels || '',
    contentType: source.server_type || source['content-type'] || '',
    listeners: parseInt(source.listeners || '0', 10),
    listenerPeak: parseInt(source.listener_peak || '0', 10),
    serverName: source.server_name || STATION_NAME,
    serverDescription: source.server_description || STATION_DESCRIPTION,
    listenUrl: source.listenurl || '',
    streamStart: source.stream_start_iso8601 || source.stream_start || '',
    audioInfo: source.audio_info || '',
  };
}

// Generate API documentation HTML
function apiDocsHtml(stationName: string): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeXml(stationName)} — API</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#050505;color:#e0e0e0;padding:32px;max-width:960px;margin:0 auto}
h1{font-size:32px;font-weight:800;margin-bottom:8px;color:#fff}
h1 span{color:#1db954}
.subtitle{color:#6a6a6a;margin-bottom:40px;font-size:14px}
.endpoint{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:20px 24px;margin-bottom:16px;transition:border-color .2s}
.endpoint:hover{border-color:rgba(29,185,84,.3)}
.method{display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;margin-right:10px}
.method.get{background:rgba(29,185,84,.15);color:#1db954}
.method.post{background:rgba(59,130,246,.15);color:#3b82f6}
.method.delete{background:rgba(239,68,68,.15);color:#ef4444}
.path{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:#fff}
.desc{margin-top:8px;font-size:13px;color:#999;line-height:1.5}
.tag{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;letter-spacing:1px;border-radius:10px;margin-left:8px}
.tag.public{background:rgba(29,185,84,.1);color:#1db954}
.tag.admin{background:rgba(239,68,68,.1);color:#ef4444}
.section{margin-top:36px;margin-bottom:16px;font-size:11px;font-weight:700;letter-spacing:3px;color:#1db954;text-transform:uppercase}
.back{display:inline-flex;align-items:center;gap:6px;color:#1db954;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:24px}
.back:hover{text-decoration:underline}
.example{margin-top:10px;background:#0a0a0a;border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#b3b3b3;overflow-x:auto}
</style></head><body>
<a href="/" class="back">&larr; Back to Station</a>
<h1>${escapeXml(stationName)} <span>API</span></h1>
<p class="subtitle">Public REST API for integration with your apps, bots, and overlays.</p>

<div class="section">Stream</div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/stream</span><span class="tag public">PUBLIC</span><div class="desc">Audio stream proxy (same-origin). Connect an audio player directly to this URL.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/autodj.m3u</span><span class="tag public">PUBLIC</span><div class="desc">Download M3U playlist file for external players (VLC, foobar2000, etc).</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/autodj.xspf</span><span class="tag public">PUBLIC</span><div class="desc">Download XSPF playlist file.</div></div>

<div class="section">Metadata</div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/metadata</span><span class="tag public">PUBLIC</span><div class="desc">Current track metadata: title, artist, album, genre, bitrate, listeners, artwork URL.</div><div class="example">{ "title": "...", "artist": "...", "album": "...", "listeners": 5, "artworkUrl": "/api/artwork?..." }</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/config</span><span class="tag public">PUBLIC</span><div class="desc">Station configuration: name, description, genre, stream URLs, accent color.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/settings</span><span class="tag public">PUBLIC</span><div class="desc">Public settings (accent color, station name overrides).</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/artwork?artist=X&amp;title=Y</span><span class="tag public">PUBLIC</span><div class="desc">Album artwork image (cached from iTunes). Returns JPEG or 204 if not found.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/status/json</span><span class="tag public">PUBLIC</span><div class="desc">Raw Icecast status JSON (/status-json.xsl proxy).</div></div>

<div class="section">Voting</div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/vote</span><span class="tag public">PUBLIC</span><div class="desc">Vote for a track. Body: <code>{ "track": "Song Name" }</code>. One vote per IP per track.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/votes</span><span class="tag public">PUBLIC</span><div class="desc">Get top voted tracks, sorted by vote count.</div></div>

<div class="section">Library</div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/tracks</span><span class="tag public">PUBLIC</span><div class="desc">List all tracks in the music library.</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/tracks</span><span class="tag admin">ADMIN</span><div class="desc">Upload a track. FormData with <code>file</code> field.</div></div>
<div class="endpoint"><span class="method delete">DELETE</span><span class="path">/api/tracks/:name</span><span class="tag admin">ADMIN</span><div class="desc">Delete a track by filename.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/playlists</span><span class="tag public">PUBLIC</span><div class="desc">List all playlists.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/ads</span><span class="tag public">PUBLIC</span><div class="desc">List all ad spots.</div></div>

<div class="section">Admin Controls</div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/admin/login</span><span class="tag public">PUBLIC</span><div class="desc">Authenticate. Body: <code>{ "password": "..." }</code>. Returns token.</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/skip</span><span class="tag admin">ADMIN</span><div class="desc">Skip current track (Liquidsoap telnet).</div></div>
<div class="endpoint"><span class="method post">POST</span><span class="path">/api/settings</span><span class="tag admin">ADMIN</span><div class="desc">Update settings. Body: <code>{ "accentColor": "#hex", "stationName": "...", "stationDescription": "..." }</code></div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/liquidsoap/remaining</span><span class="tag public">PUBLIC</span><div class="desc">Remaining time of current track.</div></div>
<div class="endpoint"><span class="method get">GET</span><span class="path">/api/liquidsoap/commands</span><span class="tag admin">ADMIN</span><div class="desc">List available Liquidsoap telnet commands.</div></div>

<div style="margin-top:48px;padding-top:20px;border-top:1px solid rgba(255,255,255,.07);font-size:12px;color:#444">
Admin endpoints require <code>Authorization: Bearer &lt;token&gt;</code> header. &bull; AutoDJ-Extreme v2.0
</div></body></html>`;
}

await ensureDirs();

Bun.serve({
  port: PUBLIC_PORT,
  fetch: async (req: Request) => {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: defaultCorsHeaders() });
    }

    // API routes
    if (url.pathname === '/api/status/json') {
      return await fetchAutodjStatusJson();
    }

    if (url.pathname === '/api/status') {
      try {
        const res = await fetch(AUTODJ_STATUS_URL);
        const text = await res.text();
        return new Response(text, { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 502);
      }
    }

    // Stream proxy — each request creates a new Icecast fetch (multi-listener safe)
    if (url.pathname === '/stream') {
      const streamUrl = `http://${AUTODJ_HOST}:${AUTODJ_PORT}/autodj`;
      try {
        const upstream = await fetch(streamUrl, {
          headers: { 'User-Agent': 'AutoDJ-Proxy/1.0', 'Icy-MetaData': '0' },
        });
        const headers: Record<string, string> = {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store',
          'X-Content-Type-Options': 'nosniff',
        };
        const ct = upstream.headers.get('content-type');
        if (ct) headers['Content-Type'] = ct;
        return new Response(upstream.body, { status: 200, headers });
      } catch (e) {
        return new Response('Stream unavailable', { status: 502 });
      }
    }

    // Station config — provides stream URL, station info to frontends
    if (url.pathname === '/api/config') {
      const directStreamUrl = `http://${SERVER_IP}:${ICECAST_PORT}/autodj`;
      const settings = await loadSettings();
      return jsonResponse({
        stationName: settings.stationName || STATION_NAME,
        stationDescription: settings.stationDescription || STATION_DESCRIPTION,
        stationGenre: settings.stationGenre || STATION_GENRE,
        streamUrl: '/stream',
        directStreamUrl,
        icecastHost: SERVER_IP,
        icecastPort: Number(ICECAST_PORT),
        mount: '/autodj',
        accentColor: settings.accentColor || '#1db954',
      });
    }

    // Settings — GET public, POST admin-only
    if (url.pathname === '/api/settings' && req.method === 'GET') {
      const settings = await loadSettings();
      return jsonResponse(settings);
    }
    if (url.pathname === '/api/settings' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await req.json();
        // Validate accent color if provided
        if (body.accentColor && !/^#[0-9a-fA-F]{6}$/.test(body.accentColor)) {
          return jsonResponse({ error: 'Invalid color format. Use #RRGGBB' }, 400);
        }
        // Only allow known settings keys
        const allowed: Record<string, any> = {};
        if (body.accentColor) allowed.accentColor = body.accentColor;
        if (typeof body.stationName === 'string') allowed.stationName = body.stationName.slice(0, 100);
        if (typeof body.stationDescription === 'string') allowed.stationDescription = body.stationDescription.slice(0, 500);
        if (typeof body.stationGenre === 'string') allowed.stationGenre = body.stationGenre.slice(0, 100);
        const saved = await saveSettings(allowed);
        return jsonResponse({ ok: true, settings: saved });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 500);
      }
    }

    // Album artwork — cached from iTunes Search API
    if (url.pathname === '/api/artwork') {
      const artist = url.searchParams.get('artist') || '';
      const title = url.searchParams.get('title') || '';
      const cacheKey = md5(`${artist}-${title}`);

      // Check for miss marker
      try {
        await fsp.access(`${artworkDir}/${cacheKey}.miss`);
        return new Response(null, { status: 204 });
      } catch {}

      const cached = await fetchArtwork(artist, title);
      if (cached) {
        try {
          const imgData = await fsp.readFile(cached);
          return new Response(imgData, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch {}
      }
      return new Response(null, { status: 204 });
    }

    // Rich metadata from Icecast status
    if (url.pathname === '/api/metadata') {
      try {
        const res = await fetch(AUTODJ_STATUS_URL);
        const raw = JSON.parse(await res.text());
        const metadata = parseIcecastStatus(raw);
        // Include artwork URL if we have artist/title
        if (metadata.artist || metadata.title) {
          metadata.artworkUrl = `/api/artwork?artist=${encodeURIComponent(metadata.artist)}&title=${encodeURIComponent(metadata.title)}`;
        }
        return jsonResponse(metadata);
      } catch (e) {
        return jsonResponse({ error: String(e) }, 502);
      }
    }

    // Skip current track (admin only) — sends skip command to Liquidsoap via telnet
    if (url.pathname === '/api/skip' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const result = await skipTrack();
        return jsonResponse({ ok: true, result: result.trim() });
      } catch (e) {
        return jsonResponse({ error: 'Liquidsoap telnet failed: ' + String(e) }, 502);
      }
    }

    // Liquidsoap info - list available commands
    if (url.pathname === '/api/liquidsoap/commands' && req.method === 'GET') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const result = await liquidsoapCommand('help');
        return jsonResponse({ ok: true, commands: result.trim() });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 502);
      }
    }

    // Liquidsoap remaining time
    if (url.pathname === '/api/liquidsoap/remaining' && req.method === 'GET') {
      try {
        const result = await liquidsoapCommand('music.remaining');
        return jsonResponse({ ok: true, remaining: result.trim() });
      } catch (e) {
        return jsonResponse({ remaining: 'unknown' });
      }
    }

    // Vote system
    if (url.pathname === '/api/vote' && req.method === 'POST') {
      try {
        const body = await req.json();
        const track = body.track;
        if (!track || typeof track !== 'string') return jsonResponse({ error: 'track required' }, 400);
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!votes.has(track)) {
          votes.set(track, { track, voters: new Set(), ts: Date.now() });
        }
        const entry = votes.get(track)!;
        if (entry.voters.has(clientIp)) {
          return jsonResponse({ error: 'Already voted for this track', votes: entry.voters.size });
        }
        entry.voters.add(clientIp);
        return jsonResponse({ ok: true, track, votes: entry.voters.size });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 500);
      }
    }

    if (url.pathname === '/api/votes' && req.method === 'GET') {
      const result: { track: string; votes: number }[] = [];
      for (const [, entry] of votes) {
        result.push({ track: entry.track, votes: entry.voters.size });
      }
      result.sort((a, b) => b.votes - a.votes);
      return jsonResponse(result.slice(0, 20));
    }

    // M3U playlist download
    if (url.pathname === '/autodj.m3u') {
      const streamUrl = `http://${SERVER_IP}:${ICECAST_PORT}/autodj`;
      const m3u = `#EXTM3U\n#EXTINF:-1,${STATION_NAME}\n${streamUrl}\n`;
      return new Response(m3u, {
        headers: {
          'Content-Type': 'audio/x-mpegurl',
          'Content-Disposition': 'attachment; filename="autodj.m3u"',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // XSPF playlist download
    if (url.pathname === '/autodj.xspf') {
      const streamUrl = `http://${SERVER_IP}:${ICECAST_PORT}/autodj`;
      const xspf = `<?xml version="1.0" encoding="UTF-8"?>
<playlist version="1" xmlns="http://xspf.org/ns/0/">
  <title>${escapeXml(STATION_NAME)}</title>
  <trackList>
    <track>
      <title>${escapeXml(STATION_NAME)}</title>
      <location>${escapeXml(streamUrl)}</location>
    </track>
  </trackList>
</playlist>`;
      return new Response(xspf, {
        headers: {
          'Content-Type': 'application/xspf+xml',
          'Content-Disposition': 'attachment; filename="autodj.xspf"',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (url.pathname === '/api/tracks' && req.method === 'GET') {
      const files = await listDir(musicDir);
      return jsonResponse(files);
    }

    if (url.pathname === '/api/tracks' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const form = await req.formData();
        const file = form.get('file') as File | null;
        if (!file) return jsonResponse({ error: 'no file' }, 400);
        const filename = form.get('filename') || (file as any).name || `upload-${Date.now()}`;
        const dest = `${musicDir}/${String(filename)}`;
        await saveUploadedFile(file as File, dest);
        return jsonResponse({ ok: true, name: filename });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 500);
      }
    }

    if (url.pathname.startsWith('/api/tracks/') && req.method === 'DELETE') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      const name = decodeURIComponent(url.pathname.replace('/api/tracks/', ''));
      const target = `${musicDir}/${name}`;
      try {
        await fsp.unlink(target);
        return jsonResponse({ ok: true });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 500);
      }
    }

    // Playlists: list, create (JSON or upload), delete
    if (url.pathname === '/api/playlists' && req.method === 'GET') {
      const files = await listDir(playlistsDir);
      return jsonResponse(files);
    }

    if (url.pathname === '/api/playlists' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      // support JSON body { name: 'playlist.m3u', tracks: ['a.mp3','b.mp3'] } or file upload
      const ct = req.headers.get('content-type') || '';
      try {
        if (ct.includes('application/json')) {
          const body = await req.json();
          const name = body.name || `playlist-${Date.now()}.m3u`;
          const content = (body.tracks || []).join('\n');
          await fsp.writeFile(`${playlistsDir}/${name}`, content);
          return jsonResponse({ ok: true, name });
        } else {
          const form = await req.formData();
          const file = form.get('file') as File | null;
          if (!file) return jsonResponse({ error: 'no file' }, 400);
          const filename = form.get('filename') || (file as any).name || `playlist-${Date.now()}.m3u`;
          const dest = `${playlistsDir}/${String(filename)}`;
          await saveUploadedFile(file as File, dest);
          return jsonResponse({ ok: true, name: filename });
        }
      } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    if (url.pathname.startsWith('/api/playlists/') && req.method === 'DELETE') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      const name = decodeURIComponent(url.pathname.replace('/api/playlists/', ''));
      const target = `${playlistsDir}/${name}`;
      try { await fsp.unlink(target); return jsonResponse({ ok: true }); } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    // Ads: similar to tracks
    if (url.pathname === '/api/ads' && req.method === 'GET') {
      const files = await listDir(adsDir);
      return jsonResponse(files);
    }

    if (url.pathname === '/api/ads' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const form = await req.formData();
        const file = form.get('file') as File | null;
        if (!file) return jsonResponse({ error: 'no file' }, 400);
        const filename = form.get('filename') || (file as any).name || `ad-${Date.now()}`;
        const dest = `${adsDir}/${String(filename)}`;
        await saveUploadedFile(file as File, dest);
        return jsonResponse({ ok: true, name: filename });
      } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    if (url.pathname.startsWith('/api/ads/') && req.method === 'DELETE') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      const name = decodeURIComponent(url.pathname.replace('/api/ads/', ''));
      const target = `${adsDir}/${name}`;
      try { await fsp.unlink(target); return jsonResponse({ ok: true }); } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    // Admin login endpoint: POST { password }
    if (url.pathname === '/api/admin/login' && req.method === 'POST') {
      try {
        const body = await req.json();
        const password = body.password || '';
        if (password === ADMIN_KEY) return jsonResponse({ ok: true, token: ADMIN_KEY });
        return jsonResponse({ ok: false }, 401);
      } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    // Last.fm endpoints (admin only)
    if (url.pathname === '/api/lastfm/auth_url' && req.method === 'GET') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      if (!LASTFM_API_KEY) return jsonResponse({ error: 'LASTFM_API_KEY not configured' }, 400);
      const cb = url.searchParams.get('cb') || '';
      const authUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}${cb ? `&cb=${encodeURIComponent(cb)}` : ''}`;
      return jsonResponse({ url: authUrl });
    }

    if (url.pathname === '/api/lastfm/session' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await req.json();
        const token = body.token;
        if (!token) return jsonResponse({ error: 'token required' }, 400);
        const resp = await lastfmApi('auth.getSession', { token });
        if (resp && resp.session && resp.session.key) {
          await fsp.writeFile('./storage/lastfm.json', JSON.stringify(resp.session));
          return jsonResponse({ ok: true, session: resp.session });
        }
        return jsonResponse({ error: resp }, 500);
      } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    if (url.pathname === '/api/lastfm/scrobble' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const body = await req.json();
        const sessionFile = './storage/lastfm.json';
        const session = JSON.parse(await fsp.readFile(sessionFile, 'utf8'));
        if (!session || !session.key) return jsonResponse({ error: 'no session' }, 400);
        const { artist, track, timestamp } = body;
        const resp = await lastfmApi('track.scrobble', { sk: session.key, 'artist[0]': artist, 'track[0]': track, 'timestamp[0]': String(timestamp || Math.floor(Date.now()/1000)) });
        return jsonResponse(resp);
      } catch (e) { return jsonResponse({ error: String(e) }, 500); }
    }

    // API Documentation page
    if (url.pathname === '/api' || url.pathname === '/api/') {
      const settings = await loadSettings();
      const stationName = settings.stationName || STATION_NAME;
      return new Response(apiDocsHtml(stationName), {
        headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Serve static files from ./public
    // Route / to index.html (public listener page), /admin to player.html (admin command center)
    let servePath = url.pathname;
    if (servePath === '/') servePath = '/index.html';
    else if (servePath === '/admin') servePath = '/player.html';

    const filePath = `./public${servePath}`;
    try {
      const file = Bun.file(filePath);
      const body = await file.arrayBuffer();
      const headers: Record<string, string> = {};
      if (filePath.endsWith('.html')) headers['Content-Type'] = 'text/html';
      else if (filePath.endsWith('.css')) headers['Content-Type'] = 'text/css';
      else if (filePath.endsWith('.js')) headers['Content-Type'] = 'application/javascript';
      else if (filePath.endsWith('.wasm')) headers['Content-Type'] = 'application/wasm';
      else if (filePath.endsWith('.svg')) headers['Content-Type'] = 'image/svg+xml';
      else if (filePath.endsWith('.png')) headers['Content-Type'] = 'image/png';
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) headers['Content-Type'] = 'image/jpeg';
      else headers['Content-Type'] = 'application/octet-stream';
      Object.assign(headers, { 'Access-Control-Allow-Origin': '*' });
      return new Response(body, { headers });
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
  }
});

console.log(`Public Bun server listening on port ${PUBLIC_PORT}`);
