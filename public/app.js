/* ═══════════════════════════════════════════════════════════════════
   AutoDJ-Extreme — Public Page (Listener Experience)
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ─── Background Canvas ─── */
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let w, h;
    const resize = () => { w = bgCanvas.width = window.innerWidth; h = bgCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Grid of subtle moving lines + nebula
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

    function drawBg(t) {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Nebula glow
      const grd = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.6);
      grd.addColorStop(0, 'rgba(29,185,84,0.025)');
      grd.addColorStop(0.5, 'rgba(29,185,84,0.008)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Second glow
      const grd2 = ctx.createRadialGradient(w * 0.7, h * 0.6, 0, w * 0.7, h * 0.6, w * 0.5);
      grd2.addColorStop(0, 'rgba(29,185,84,0.015)');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);

      // Tactical grid lines
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

  // Determine the Icecast stream URL from current host (Icecast on same host, port from config)
  function getStreamUrl() {
    // The Bun admin UI runs on SERVER_PORT+1, Icecast is on SERVER_PORT
    // We derive Icecast port by subtracting 1 from the current page's port
    const currentPort = parseInt(location.port, 10);
    const icecastPort = currentPort ? currentPort - 1 : 8000;
    return `${location.protocol}//${location.hostname}:${icecastPort}/autodj`;
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
        audio.src = '';
        isPlaying = false;
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
      } else {
        audio.src = getStreamUrl();
        audio.volume = (volSlider ? volSlider.value : 75) / 100;
        audio.play().catch(() => {});
        isPlaying = true;
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
      }
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      audio.volume = volSlider.value / 100;
    });
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

        // Gradient bar
        const grd = ctx.createLinearGradient(x, h, x, h - barH);
        grd.addColorStop(0, `rgba(29,185,84,${0.3 + val * 0.7})`);
        grd.addColorStop(1, `rgba(29,215,96,${0.1 + val * 0.4})`);
        ctx.fillStyle = grd;
        ctx.fillRect(x, h - barH, barW - 1, barH);

        // Reflection
        ctx.fillStyle = `rgba(29,185,84,${val * 0.08})`;
        ctx.fillRect(x, h, barW - 1, barH * 0.15);
      }
    }
    draw();
  }

  // Init visualizer on first play
  if (audio) {
    audio.addEventListener('play', () => { initVisualizer(); });
  }

  /* ─── Static Visualizer (when not playing) ─── */
  if (vizCanvas) {
    const ctx = vizCanvas.getContext('2d');
    function drawIdle() {
      if (audioCtx) return; // real visualizer running
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
  const listenersNumEl = document.getElementById('listeners-num');
  const statListeners = document.getElementById('stat-listeners');
  const statPeak = document.getElementById('stat-peak');
  const statUptime = document.getElementById('stat-uptime');
  const statTracks = document.getElementById('stat-tracks');
  const recentList = document.getElementById('recent-list');

  let peakListeners = 0;
  const trackHistory = [];

  async function pollStatus() {
    try {
      const res = await fetch('/api/status/json');
      const data = await res.json();

      // Navigate the Icecast JSON structure
      const icestats = data.icestats || data;
      const source = icestats.source || (icestats.sources && icestats.sources[0]) || {};

      // Now playing
      const title = source.title || source.yp_currently_playing || '';
      const artist = source.artist || '';
      if (titleEl) titleEl.textContent = title || 'Waiting for stream...';
      if (artistEl) artistEl.textContent = artist || '—';

      // Listeners
      const listeners = parseInt(source.listeners || source.listener_count || '0', 10);
      if (listenersNumEl) listenersNumEl.textContent = listeners;
      if (statListeners) statListeners.textContent = listeners;
      if (listeners > peakListeners) peakListeners = listeners;
      if (statPeak) statPeak.textContent = peakListeners;

      // Track count (from API)
      try {
        const tracksRes = await fetch('/api/tracks');
        const tracks = await tracksRes.json();
        if (statTracks) statTracks.textContent = Array.isArray(tracks) ? tracks.length : 0;
      } catch (e) {}

      // Update history
      const trackKey = `${artist}-${title}`;
      if (title && (!trackHistory.length || trackHistory[0].key !== trackKey)) {
        trackHistory.unshift({ key: trackKey, title: title || 'Unknown', artist: artist || 'Unknown', time: new Date() });
        if (trackHistory.length > 20) trackHistory.pop();
        renderHistory();
      }
    } catch (e) { /* status unavailable */ }
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
          <div class="recent-item-artist">${escHtml(t.artist)}</div>
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

  // Uptime counter
  const startTime = Date.now();
  function updateUptime() {
    if (!statUptime) return;
    const s = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    statUptime.textContent = h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  }

  // Init
  pollStatus();
  setInterval(pollStatus, 8000);
  setInterval(updateUptime, 1000);
})();
