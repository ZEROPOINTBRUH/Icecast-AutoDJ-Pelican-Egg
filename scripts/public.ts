// @ts-nocheck
import fs from "fs";
import crypto from "crypto";

const AUTODJ_HOST = process.env.AUTODJ_HOST || "autodj";
const AUTODJ_PORT = process.env.AUTODJ_PORT || "8000";
const PUBLIC_PORT = Number(process.env.PUBLIC_PORT || "3000");

const AUTODJ_STATUS_URL = `http://${AUTODJ_HOST}:${AUTODJ_PORT}/status-json.xsl`;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || '';
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET || '';
const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme';
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

function xmlToJson(xmlText: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    function nodeToObj(node: any): any {
      const obj: any = {};
      if (node.nodeType === 3) return node.nodeValue;
      if (node.attributes && node.attributes.length) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj[`@${attr.name}`] = attr.value;
        }
      }
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        const name = child.nodeName;
        const val = child.nodeType === 3 ? child.nodeValue.trim() : nodeToObj(child);
        if (val === '') continue;
        if (obj[name]) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(val);
        } else {
          obj[name] = val;
        }
      }
      return obj;
    }

    return nodeToObj(doc.documentElement || doc);
  } catch (e) {
    return { error: String(e) };
  }
}

async function fetchAutodjStatusJson() {
  try {
    const res = await fetch(AUTODJ_STATUS_URL);
    const text = await res.text();
    const parsed = xmlToJson(text);
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
        return new Response(text, { headers: { 'Content-Type': 'application/xml', ...defaultCorsHeaders() } });
      } catch (e) {
        return jsonResponse({ error: String(e) }, 502);
      }
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
    const filePath = `./public${url.pathname === '/' ? '/index.html' : url.pathname}`;
    try {
      const file = Bun.file(filePath);
      const body = await file.arrayBuffer();
      const headers: Record<string, string> = {};
      if (filePath.endsWith('.html')) headers['Content-Type'] = 'text/html';
      else if (filePath.endsWith('.css')) headers['Content-Type'] = 'text/css';
      else if (filePath.endsWith('.js')) headers['Content-Type'] = 'application/javascript';
      else if (filePath.endsWith('.wasm')) headers['Content-Type'] = 'application/wasm';
      else headers['Content-Type'] = 'application/octet-stream';
      // allow CORS for static assets too
      Object.assign(headers, { 'Access-Control-Allow-Origin': '*' });
      return new Response(body, { headers });
    } catch (e) {
      // If not found, try serving player.html at '/player' and admin UI at '/admin'
      if (url.pathname === '/' || url.pathname === '/player') {
        try {
          const f = Bun.file('./public/player.html');
          return new Response(await f.arrayBuffer(), { headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' } });
        } catch (er) {}
      }
      if (url.pathname === '/admin' || url.pathname === '/index.html') {
        try {
          const f2 = Bun.file('./public/index.html');
          return new Response(await f2.arrayBuffer(), { headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' } });
        } catch (er) {}
      }
      return new Response('Not found', { status: 404 });
    }
  }
});

console.log(`Public Bun server listening on port ${PUBLIC_PORT}`);
