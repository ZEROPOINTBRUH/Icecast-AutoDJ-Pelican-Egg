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
      // Set station name in navbar
      const nameEl = document.getElementById('station-name');
      if (nameEl && stationConfig.stationName) {
        nameEl.textContent = stationConfig.stationName;
      }
      document.title = stationConfig.stationName || 'AutoDJ-Extreme';
    } catch (e) { /* use defaults */ }
  }

  function getStreamUrl() {
    if (stationConfig && stationConfig.streamUrl) return stationConfig.streamUrl;
    // Fallback: Icecast on port - 1
    const port = parseInt(location.port, 10) - 1;
    return `http://${location.hostname}:${port}/autodj`;
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
        x: Math.random() * 2000 - 500,
        y: Math.random() * 2000 - 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        len: 80 + Math.random() * 200,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.002,
        alpha: 0.02 + Math.random() * 0.04,
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
        l.x += l.vx;
        l.y += l.vy;
        l.angle += l.spin;
        if (l.x < -300) l.x = w + 300;
        if (l.x > w + 300) l.x = -300;
        if (l.y < -300) l.y = h + 300;
        if (l.y > h + 300) l.y = -300;

        const ex = l.x + Math.cos(l.angle) * l.len;
        const ey = l.y + Math.sin(l.angle) * l.len;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(29,185,84,${l.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
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

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
      } else {
        startPlayback();
      }
    });
  }

  function startPlayback() {
    audio.src = getStreamUrl();
    audio.volume = (volSlider ? volSlider.value : 75) / 100;
    audio.play().catch(() => {});
    isPlaying = true;
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  }

  function stopPlayback() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load(); // release the network connection
    isPlaying = false;
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
    });
  }

  /* ─── Session Cleanup — stop stream when user leaves ─── */
  window.addEventListener('beforeunload', () => {
    if (isPlaying) stopPlayback();
  });

  document.addEventListener('visibilitychange', () => {
    // Don't auto-disconnect on tab switch — user may be multitasking
    // But DO disconnect if the page is hidden for a long time (handled by browser gc)
  });

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

        ctx.fillStyle = `rgba(29,185,84,${val * 0.08})`;
        ctx.fillRect(x, h, barW - 1, barH * 0.15);
      }
    }
    draw();
  }

  if (audio) {
    audio.addEventListener('play', () => { initVisualizer(); });
  }

  /* ─── Static Visualizer (when not playing) ─── */
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

  /* ─── Status Polling (Rich Metadata) ─── */
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

      // Title / Artist / Album
      const title = m.title || '';
      const artist = m.artist || '';
      const album = m.album || '';
      if (titleEl) titleEl.textContent = title || 'Waiting for stream...';
      if (artistEl) artistEl.textContent = artist || '—';
      if (albumEl) albumEl.textContent = album || '';

      // Bitrate / format / genre tags
      if (npBitrate && m.bitrate) npBitrate.textContent = m.bitrate + 'kbps';
      if (npFormat && m.contentType) {
        const fmt = m.contentType.includes('mpeg') ? 'MP3' : m.contentType.includes('ogg') ? 'OGG' : m.contentType.includes('aac') ? 'AAC' : m.contentType.split('/').pop().toUpperCase();
        npFormat.textContent = fmt;
      }
      if (npGenre) npGenre.textContent = m.genre || '';

      // Listeners
      const listeners = m.listeners || 0;
      if (listenersNumEl) listenersNumEl.textContent = listeners;
      if (statListeners) statListeners.textContent = listeners;
      if (m.listenerPeak > peakListeners) peakListeners = m.listenerPeak;
      if (listeners > peakListeners) peakListeners = listeners;
      if (statPeak) statPeak.textContent = peakListeners;

      // Uptime from stream start
      if (statUptime && m.streamStart) {
        const startMs = new Date(m.streamStart).getTime();
        if (!isNaN(startMs)) {
          streamStartTime = startMs;
        }
      }

      // Track history
      const trackKey = `${artist}-${title}`;
      if (title && (!trackHistory.length || trackHistory[0].key !== trackKey)) {
        trackHistory.unshift({ key: trackKey, title: title || 'Unknown', artist: artist || 'Unknown', album, time: new Date() });
        if (trackHistory.length > 20) trackHistory.pop();
        renderHistory();
      }
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

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Uptime counter (uses stream start if available)
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

  /* ─── Share / VLC / Download Buttons ─── */
  const btnShare = document.getElementById('btn-share');
  const btnVlc = document.getElementById('btn-vlc');

  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const url = location.href;
      if (navigator.share) {
        navigator.share({ title: stationConfig?.stationName || 'AutoDJ-Extreme', url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => {
          showNotification('Link copied to clipboard!');
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      }
    });
  }

  if (btnVlc) {
    btnVlc.addEventListener('click', () => {
      const streamUrl = getStreamUrl();
      navigator.clipboard.writeText(streamUrl).then(() => {
        showNotification('Stream URL copied! Paste in VLC or any media player.');
      }).catch(() => {
        prompt('Copy this stream URL for VLC:', streamUrl);
      });
    });
  }

  function showNotification(msg) {
    const n = document.createElement('div');
    n.className = 'toast-notification';
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => { n.classList.add('show'); }, 10);
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 2500);
  }

  /* ─── Init ─── */
  loadConfig().then(() => {
    pollStatus();
    setInterval(pollStatus, 8000);
    setInterval(updateUptime, 1000);
  });
})();
