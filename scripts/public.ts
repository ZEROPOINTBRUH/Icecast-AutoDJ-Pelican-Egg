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
const musicDir = `${storageBase}/music`;
const playlistsDir = `${storageBase}/playlists`;
const adsDir = `${storageBase}/ads`;

const fsp = fs.promises;

async function ensureDirs() {
  await Promise.all([
    fsp.mkdir(musicDir, { recursive: true }),
    fsp.mkdir(playlistsDir, { recursive: true }),
    fsp.mkdir(adsDir, { recursive: true }),
  ]);
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
      sock.write('quit\n');
    });
    let data = '';
    sock.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    sock.on('end', () => resolve(data));
    sock.on('error', (err: Error) => reject(err));
    sock.setTimeout(3000, () => { sock.destroy(); reject(new Error('timeout')); });
  });
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

    // Station config — provides stream URL, station info to frontends
    if (url.pathname === '/api/config') {
      const streamUrl = `http://${SERVER_IP}:${ICECAST_PORT}/autodj`;
      return jsonResponse({
        stationName: STATION_NAME,
        stationDescription: STATION_DESCRIPTION,
        stationGenre: STATION_GENRE,
        streamUrl,
        icecastHost: SERVER_IP,
        icecastPort: Number(ICECAST_PORT),
        mount: '/autodj',
      });
    }

    // Rich metadata from Icecast status
    if (url.pathname === '/api/metadata') {
      try {
        const res = await fetch(AUTODJ_STATUS_URL);
        const raw = JSON.parse(await res.text());
        const metadata = parseIcecastStatus(raw);
        return jsonResponse(metadata);
      } catch (e) {
        return jsonResponse({ error: String(e) }, 502);
      }
    }

    // Skip current track (admin only) — sends skip command to Liquidsoap via telnet
    if (url.pathname === '/api/skip' && req.method === 'POST') {
      if (!requireAdmin(req)) return new Response('Unauthorized', { status: 401 });
      try {
        const result = await liquidsoapCommand('music.skip');
        return jsonResponse({ ok: true, result: result.trim() });
      } catch (e) {
        return jsonResponse({ error: 'Liquidsoap telnet failed: ' + String(e) }, 502);
      }
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
