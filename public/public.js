/* ═══════════════════════════════════════════════════════════════════
   AutoDJ-Extreme — Public Page (Listener Experience)
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ─── Station Config (loaded from API) ─── */
  let stationConfig = null;

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      stationConfig = await res.json();
      const nameEl = document.getElementById('station-name');
      if (nameEl && stationConfig.stationName) {
        nameEl.textContent = stationConfig.stationName;
      }
      document.title = stationConfig.stationName || 'AutoDJ-Extreme';
      if (stationConfig.accentColor) {
        applyAccentColor(stationConfig.accentColor);
      }
    } catch (e) { /* use defaults */ }
  }

  function getStreamUrl() { return '/stream'; }

  function getDirectStreamUrl() {
    if (stationConfig && stationConfig.directStreamUrl) return stationConfig.directStreamUrl;
    const port = parseInt(location.port, 10) - 1;
    return `http://${location.hostname}:${port}/autodj`;
  }

  function applyAccentColor(hex) {
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-bright', `rgb(${Math.min(255,r+20)},${Math.min(255,g+20)},${Math.min(255,b+20)})`);
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.3)`);
    root.style.setProperty('--accent-deep', `rgb(${Math.floor(r*0.7)},${Math.floor(g*0.7)},${Math.floor(b*0.7)})`);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function showNotification(msg) {
    const n = document.createElement('div');
    n.className = 'toast-notification';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add('show'), 10);
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 2500);
  }

  /* ─── Background Canvas ─── */
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let w, h;
    const resize = () => { w = bgCanvas.width = window.innerWidth; h = bgCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const lines = [];
    for (let i = 0; i < 40; i++) {
      lines.push({
        x: Math.random() * 2000 - 500, y: Math.random() * 2000 - 500,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        len: 80 + Math.random() * 200, angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.002, alpha: 0.02 + Math.random() * 0.04,
      });
    }

    function drawBg() {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.6);
      grd.addColorStop(0, 'rgba(29,185,84,0.025)');
      grd.addColorStop(0.5, 'rgba(29,185,84,0.008)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      const grd2 = ctx.createRadialGradient(w * 0.7, h * 0.6, 0, w * 0.7, h * 0.6, w * 0.5);
      grd2.addColorStop(0, 'rgba(29,185,84,0.015)');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);
      for (const l of lines) {
        l.x += l.vx; l.y += l.vy; l.angle += l.spin;
        if (l.x < -300) l.x = w + 300; if (l.x > w + 300) l.x = -300;
        if (l.y < -300) l.y = h + 300; if (l.y > h + 300) l.y = -300;
        const ex = l.x + Math.cos(l.angle) * l.len;
        const ey = l.y + Math.sin(l.angle) * l.len;
        ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(29,185,84,${l.alpha})`; ctx.lineWidth = 1; ctx.stroke();
      }
      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
  }

  /* ─── Floating Particles ─── */
  const particlesEl = document.getElementById('particles');
  if (particlesEl) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = 6 + Math.random() * 6 + 's';
      const size = 1 + Math.random() * 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      particlesEl.appendChild(p);
    }
  }

  /* ─── Audio Player ─── */
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('btn-play');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const volSlider = document.getElementById('volume');
  let isPlaying = false;
  let currentMeta = {};

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) stopPlayback(); else startPlayback();
    });
  }

  function startPlayback() {
    audio.src = getStreamUrl();
    audio.volume = (volSlider ? volSlider.value : 75) / 100;
    audio.play().catch(() => {});
    isPlaying = true;
    if (iconPlay) iconPlay.classList.add('hidden');
    if (iconPause) iconPause.classList.remove('hidden');
    syncFullscreenPlayState();
    updateMediaSession();
  }

  function stopPlayback() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    isPlaying = false;
    if (iconPlay) iconPlay.classList.remove('hidden');
    if (iconPause) iconPause.classList.add('hidden');
    syncFullscreenPlayState();
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
      const fsVol = document.getElementById('fs-volume');
      if (fsVol) fsVol.value = volSlider.value;
    });
  }

  /* ─── Session Cleanup — stop stream when user leaves ─── */
  window.addEventListener('beforeunload', () => {
    if (isPlaying) stopPlayback();
  });

  // pagehide is more reliable on mobile (iOS Safari fires it on app switch)
  window.addEventListener('pagehide', () => {
    if (isPlaying) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  });

  /* ─── Media Session API (Android/iOS/Chrome lock screen controls) ─── */
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const title = currentMeta.title || stationConfig?.stationName || 'AutoDJ-Extreme';
    const artist = currentMeta.artist || '';
    const album = currentMeta.album || stationConfig?.stationName || '';
    const artwork = [];
    if (currentArtworkUrl) {
      artwork.push({ src: currentArtworkUrl, sizes: '512x512', type: 'image/jpeg' });
    }
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist, album, artwork });
    navigator.mediaSession.setActionHandler('play', () => startPlayback());
    navigator.mediaSession.setActionHandler('pause', () => stopPlayback());
    navigator.mediaSession.setActionHandler('stop', () => stopPlayback());
  }

  /* ─── Audio Visualizer ─── */
  const vizCanvas = document.getElementById('visualizer-canvas');
  let analyser, dataArray, audioCtx, sourceNode;

  function initVisualizer() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      drawVisualizer();
    } catch (e) { /* no viz if CORS etc */ }
  }

  function drawVisualizer() {
    if (!vizCanvas) return;
    const ctx = vizCanvas.getContext('2d');
    const w = vizCanvas.width = vizCanvas.parentElement.clientWidth;
    const h = vizCanvas.height = vizCanvas.parentElement.clientHeight;

    function draw() {
      requestAnimationFrame(draw);
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgba(17,17,17,0.85)';
      ctx.fillRect(0, 0, w, h);
      const barCount = dataArray.length;
      const barW = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] / 255;
        const barH = val * h * 0.9;
        const x = i * barW;
        const grd = ctx.createLinearGradient(x, h, x, h - barH);
        grd.addColorStop(0, `rgba(29,185,84,${0.3 + val * 0.7})`);
        grd.addColorStop(1, `rgba(29,215,96,${0.1 + val * 0.4})`);
        ctx.fillStyle = grd;
        ctx.fillRect(x, h - barH, barW - 1, barH);
      }
    }
    draw();
  }

  if (audio) {
    audio.addEventListener('play', () => initVisualizer());
  }

  /* ─── Static Visualizer (idle) ─── */
  if (vizCanvas) {
    const ctx = vizCanvas.getContext('2d');
    function drawIdle() {
      if (audioCtx) return;
      const w = vizCanvas.width = vizCanvas.parentElement.clientWidth;
      const h = vizCanvas.height = vizCanvas.parentElement.clientHeight;
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      const bars = 64;
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        const val = 0.05 + 0.08 * Math.sin(t * 0.8 + i * 0.15) + 0.04 * Math.sin(t * 1.3 + i * 0.3);
        const barH = val * h;
        ctx.fillStyle = `rgba(29,185,84,${0.15 + val * 0.3})`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
      requestAnimationFrame(drawIdle);
    }
    drawIdle();
  }

  /* ─── Status Polling ─── */
  const titleEl = document.getElementById('track-title');
  const artistEl = document.getElementById('track-artist');
  const albumEl = document.getElementById('track-album');
  const listenersNumEl = document.getElementById('listeners-num');
  const statListeners = document.getElementById('stat-listeners');
  const statPeak = document.getElementById('stat-peak');
  const statUptime = document.getElementById('stat-uptime');
  const statTracks = document.getElementById('stat-tracks');
  const recentList = document.getElementById('recent-list');
  const npBitrate = document.getElementById('np-bitrate');
  const npFormat = document.getElementById('np-format');
  const npGenre = document.getElementById('np-genre');

  let peakListeners = 0;
  const trackHistory = [];

  async function pollStatus() {
    try {
      const res = await fetch('/api/metadata');
      const m = await res.json();
      if (m.error) return;

      const title = m.title || '';
      const artist = m.artist || '';
      const album = m.album || '';
      currentMeta = { title, artist, album };

      if (titleEl) titleEl.textContent = title || 'Waiting for stream...';
      if (artistEl) artistEl.textContent = artist || '\u2014';
      if (albumEl) albumEl.textContent = album || '';

      // Fullscreen mirror
      const fsTitle = document.getElementById('fs-title');
      const fsArtist = document.getElementById('fs-artist');
      const fsAlbum = document.getElementById('fs-album');
      const fsListeners = document.getElementById('fs-listeners');
      if (fsTitle) fsTitle.textContent = title || 'Waiting for stream...';
      if (fsArtist) fsArtist.textContent = artist || '\u2014';
      if (fsAlbum) fsAlbum.textContent = album || '';

      // Album artwork
      if (m.artworkUrl && (artist || title)) {
        loadArtwork(m.artworkUrl);
      }

      if (npBitrate && m.bitrate) npBitrate.textContent = m.bitrate + 'kbps';
      if (npFormat && m.contentType) {
        const fmt = m.contentType.includes('mpeg') ? 'MP3' : m.contentType.includes('ogg') ? 'OGG' : m.contentType.includes('aac') ? 'AAC' : m.contentType.split('/').pop().toUpperCase();
        npFormat.textContent = fmt;
      }
      if (npGenre) npGenre.textContent = m.genre || '';

      const listeners = m.listeners || 0;
      if (listenersNumEl) listenersNumEl.textContent = listeners;
      if (statListeners) statListeners.textContent = listeners;
      if (fsListeners) fsListeners.textContent = listeners;
      if (m.listenerPeak > peakListeners) peakListeners = m.listenerPeak;
      if (listeners > peakListeners) peakListeners = listeners;
      if (statPeak) statPeak.textContent = peakListeners;

      if (statUptime && m.streamStart) {
        const startMs = new Date(m.streamStart).getTime();
        if (!isNaN(startMs)) streamStartTime = startMs;
      }

      // Track history
      const trackKey = `${artist}-${title}`;
      if (title && (!trackHistory.length || trackHistory[0].key !== trackKey)) {
        trackHistory.unshift({ key: trackKey, title: title || 'Unknown', artist: artist || 'Unknown', album, time: new Date() });
        if (trackHistory.length > 20) trackHistory.pop();
        renderHistory();
      }

      // Update media session with latest metadata
      if (isPlaying) updateMediaSession();
    } catch (e) { /* status unavailable */ }

    // Track count
    try {
      const tracksRes = await fetch('/api/tracks');
      const tracks = await tracksRes.json();
      if (statTracks) statTracks.textContent = Array.isArray(tracks) ? tracks.length : 0;
    } catch (e) {}
  }

  function renderHistory() {
    if (!recentList) return;
    if (!trackHistory.length) {
      recentList.innerHTML = '<div class="recent-empty">No track history yet</div>';
      return;
    }
    recentList.innerHTML = trackHistory.map((t, i) => `
      <div class="recent-item">
        <div class="recent-item-num">${i + 1}</div>
        <div class="recent-item-info">
          <div class="recent-item-title">${escHtml(t.title)}</div>
          <div class="recent-item-artist">${escHtml(t.artist)}${t.album ? ' &middot; ' + escHtml(t.album) : ''}</div>
        </div>
        <div class="recent-item-time">${t.time.toLocaleTimeString()}</div>
      </div>
    `).join('');
  }

  // Album artwork loader
  const albumArtEl = document.getElementById('album-art');
  let currentArtworkUrl = '';

  function loadArtwork(url) {
    if (url === currentArtworkUrl) return;
    currentArtworkUrl = url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (albumArtEl) {
        albumArtEl.innerHTML = '';
        img.className = 'np-art-img';
        albumArtEl.appendChild(img);
      }
      // Mirror to fullscreen
      const fsArt = document.getElementById('fs-artwork');
      if (fsArt) {
        fsArt.innerHTML = '';
        const clone = img.cloneNode(true);
        clone.className = 'fs-art-img';
        fsArt.appendChild(clone);
      }
      // Update fullscreen background blur
      const fsBg = document.getElementById('fs-bg');
      if (fsBg) fsBg.style.backgroundImage = `url(${url})`;
      // Update media session
      if (isPlaying) updateMediaSession();
    };
    img.onerror = () => {};
    img.src = url;
  }

  // Uptime counter
  let streamStartTime = Date.now();
  function updateUptime() {
    if (!statUptime) return;
    const s = Math.floor((Date.now() - streamStartTime) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    statUptime.textContent = h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  }

  /* ─── Share / VLC Buttons ─── */
  const btnShare = document.getElementById('btn-share');
  const btnVlc = document.getElementById('btn-vlc');

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const url = location.href;
      if (navigator.share) {
        navigator.share({ title: stationConfig?.stationName || 'AutoDJ-Extreme', url }).catch(() => {});
      } else {
        copyText(url).then(() => showNotification('Link copied to clipboard!'));
      }
    });
  }

  if (btnVlc) {
    btnVlc.addEventListener('click', () => {
      const directUrl = getDirectStreamUrl();
      copyText(directUrl).then(() => showNotification('Stream URL copied! Paste in VLC or any media player.'));
    });
  }

  /* ─── Fullscreen Player (iHeart Radio style) ─── */
  const fsPlayer = document.getElementById('fullscreen-player');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const fsClose = document.getElementById('fs-close');
  const fsBtnPlay = document.getElementById('fs-btn-play');
  const fsVolume = document.getElementById('fs-volume');

  function openFullscreen() {
    if (fsPlayer) {
      fsPlayer.classList.remove('hidden');
      fsPlayer.classList.add('fs-enter');
      setTimeout(() => fsPlayer.classList.remove('fs-enter'), 400);
      syncFullscreenPlayState();
      // Sync volume
      if (fsVolume && volSlider) fsVolume.value = volSlider.value;
      // Try real fullscreen API
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  }

  function closeFullscreen() {
    if (fsPlayer) {
      fsPlayer.classList.add('fs-exit');
      setTimeout(() => {
        fsPlayer.classList.add('hidden');
        fsPlayer.classList.remove('fs-exit');
      }, 300);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function syncFullscreenPlayState() {
    const fsIconPlay = document.getElementById('fs-icon-play');
    const fsIconPause = document.getElementById('fs-icon-pause');
    if (fsIconPlay && fsIconPause) {
      if (isPlaying) {
        fsIconPlay.classList.add('hidden');
        fsIconPause.classList.remove('hidden');
      } else {
        fsIconPlay.classList.remove('hidden');
        fsIconPause.classList.add('hidden');
      }
    }
  }

  if (btnFullscreen) btnFullscreen.addEventListener('click', openFullscreen);
  if (fsClose) fsClose.addEventListener('click', closeFullscreen);
  if (fsBtnPlay) {
    fsBtnPlay.addEventListener('click', () => {
      if (isPlaying) stopPlayback(); else startPlayback();
    });
  }
  if (fsVolume) {
    fsVolume.addEventListener('input', () => {
      audio.volume = fsVolume.value / 100;
      if (volSlider) volSlider.value = fsVolume.value;
    });
  }

  // ESC key exits fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fsPlayer && !fsPlayer.classList.contains('hidden')) {
      closeFullscreen();
    }
  });

  // Exit fullscreen overlay when browser exits fullscreen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && fsPlayer && !fsPlayer.classList.contains('hidden')) {
      fsPlayer.classList.add('hidden');
    }
  });

  /* ─── Vote System ─── */
  const voteList = document.getElementById('vote-list');

  async function loadVotes() {
    if (!voteList) return;
    try {
      // Get track list and current votes
      const [tracksRes, votesRes] = await Promise.all([
        fetch('/api/tracks'),
        fetch('/api/votes'),
      ]);
      const tracks = await tracksRes.json();
      const currentVotes = await votesRes.json();

      if (!Array.isArray(tracks) || !tracks.length) {
        voteList.innerHTML = '<div class="recent-empty">No tracks available for voting</div>';
        return;
      }

      // Build vote map
      const voteMap = {};
      if (Array.isArray(currentVotes)) {
        for (const v of currentVotes) voteMap[v.track] = v.votes;
      }

      // Show top 8 tracks (sorted by votes then name)
      const items = tracks.slice(0, 20).map(t => ({
        name: t.name.replace(/\.[^.]+$/, ''), // strip extension
        raw: t.name,
        votes: voteMap[t.name] || 0,
      })).sort((a, b) => b.votes - a.votes);

      voteList.innerHTML = items.slice(0, 8).map(t => `
        <div class="vote-item">
          <div class="vote-item-info">
            <div class="vote-item-name">${escHtml(t.name)}</div>
            <div class="vote-item-count">${t.votes} vote${t.votes !== 1 ? 's' : ''}</div>
          </div>
          <button class="vote-btn" data-track="${escHtml(t.raw)}" title="Vote for this track">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
        </div>
      `).join('');
    } catch (e) {
      voteList.innerHTML = '<div class="recent-empty">Voting unavailable</div>';
    }
  }

  // Delegated vote click handler
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.vote-btn[data-track]');
    if (!btn) return;
    const track = btn.dataset.track;
    btn.disabled = true;
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      });
      const j = await res.json();
      if (j.ok) {
        showNotification(`Voted for "${track.replace(/\.[^.]+$/, '')}"!`);
        loadVotes();
      } else {
        showNotification(j.error || 'Vote failed');
      }
    } catch (e) {
      showNotification('Vote error');
    }
    btn.disabled = false;
  });

  /* ─── Init ─── */
  loadConfig().then(() => {
    pollStatus();
    loadVotes();
    setInterval(pollStatus, 8000);
    setInterval(loadVotes, 30000);
    setInterval(updateUptime, 1000);
  });
})();
