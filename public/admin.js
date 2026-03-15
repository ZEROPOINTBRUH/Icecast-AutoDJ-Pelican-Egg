/* ═══════════════════════════════════════════════════════════════════
   AutoDJ-Extreme — Admin Command Center
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ─── Background Canvas (minimal for admin) ─── */
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let w, h;
    const resize = () => { w = bgCanvas.width = window.innerWidth; h = bgCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    function drawBg() {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.7);
      grd.addColorStop(0, 'rgba(29,185,84,0.015)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
  }

  /* ─── State ─── */
  let adminToken = localStorage.getItem('ADMIN_KEY') || '';

  function authHeaders() {
    const h = { 'Authorization': 'Bearer ' + adminToken };
    return h;
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Apply accent color as CSS custom properties
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

  // Load and apply accent color + station info on page load
  (async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      const settings = await res.json();
      if (settings.accentColor) {
        applyAccentColor(settings.accentColor);
        const picker = document.getElementById('accent-color-picker');
        const hexLabel = document.getElementById('accent-color-hex');
        if (picker) picker.value = settings.accentColor;
        if (hexLabel) hexLabel.textContent = settings.accentColor;
      }
      // Populate station identity fields
      const nameInput = document.getElementById('setting-station-name');
      const descInput = document.getElementById('setting-station-desc');
      const genreInput = document.getElementById('setting-station-genre');
      if (nameInput && settings.stationName) nameInput.value = settings.stationName;
      if (descInput && settings.stationDescription) descInput.value = settings.stationDescription;
      if (genreInput && settings.stationGenre) genreInput.value = settings.stationGenre;
    } catch (e) {}
  })();

  /* ─── Auth Gate ─── */
  const authGate = document.getElementById('auth-gate');
  const dashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('login-form');
  const authError = document.getElementById('auth-error');
  const authStatus = document.getElementById('auth-status');

  function showDashboard() {
    authGate.classList.add('hidden');
    dashboard.classList.remove('hidden');
    authStatus.classList.add('unlocked');
    authStatus.innerHTML = '<span class="lock-icon">&#128275;</span> ADMIN';
    loadAllData();
  }

  function showGate() {
    authGate.classList.remove('hidden');
    dashboard.classList.add('hidden');
    authStatus.classList.remove('unlocked');
    authStatus.innerHTML = '<span class="lock-icon">&#128274;</span> LOCKED';
  }

  // Auto-login if token exists
  if (adminToken) {
    verifyToken().then(ok => { if (ok) showDashboard(); else showGate(); });
  }

  async function verifyToken() {
    try {
      const res = await fetch('/api/tracks', { headers: authHeaders() });
      return res.ok;
    } catch (e) { return false; }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const pw = document.getElementById('admin-pw').value;
      if (!pw) return;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        const j = await res.json();
        if (j.ok && j.token) {
          adminToken = j.token;
          localStorage.setItem('ADMIN_KEY', adminToken);
          authError.classList.add('hidden');
          showDashboard();
        } else {
          authError.classList.remove('hidden');
          authError.textContent = 'Authentication failed — invalid password';
        }
      } catch (e) {
        authError.classList.remove('hidden');
        authError.textContent = 'Connection error';
      }
    });
  }

  /* ─── Tabs ─── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ─── File Management ─── */
  const SECTIONS = [
    { key: 'tracks', api: '/api/tracks', gridId: 'tracks-grid', formId: 'upload-tracks-form', dropId: 'tracks-drop-zone', icon: 'music' },
    { key: 'playlists', api: '/api/playlists', gridId: 'playlists-grid', formId: 'upload-playlists-form', dropId: 'playlists-drop-zone', icon: 'list' },
    { key: 'ads', api: '/api/ads', gridId: 'ads-grid', formId: 'upload-ads-form', dropId: 'ads-drop-zone', icon: 'star' },
  ];

  const FILE_ICONS = {
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17.5V5l12-2v12.5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  async function loadSection(section) {
    const grid = document.getElementById(section.gridId);
    if (!grid) return;
    try {
      const res = await fetch(section.api, { headers: authHeaders() });
      const files = await res.json();
      if (!Array.isArray(files) || !files.length) {
        grid.innerHTML = `
          <div class="file-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            No ${section.key} yet. Upload some!
          </div>`;
        return;
      }
      grid.innerHTML = files.map(f => `
        <div class="file-row">
          <div class="file-icon">${FILE_ICONS[section.icon]}</div>
          <div class="file-info">
            <div class="file-name">${escHtml(f.name)}</div>
            <div class="file-size">${formatSize(f.size)}</div>
          </div>
          <div class="file-actions">
            <button class="btn-icon-sm" data-section="${section.key}" data-name="${encodeURIComponent(f.name)}" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      grid.innerHTML = `<div class="file-empty">Failed to load ${section.key}</div>`;
    }
  }

  function loadAllData() {
    SECTIONS.forEach(s => loadSection(s));

    const infoPort = document.getElementById('info-port');
    const infoAdminPort = document.getElementById('info-admin-port');
    const currentPort = parseInt(location.port, 10);
    if (infoAdminPort) infoAdminPort.textContent = currentPort || '—';
    if (infoPort) infoPort.textContent = currentPort ? currentPort - 1 : '—';
  }

  /* ─── Upload handlers ─── */
  const progressContainer = document.createElement('div');
  progressContainer.className = 'upload-progress';
  document.body.appendChild(progressContainer);

  function showToast(msg, done) {
    const toast = document.createElement('div');
    toast.className = 'upload-toast';
    toast.innerHTML = done
      ? `<span class="toast-check">&#10003;</span> ${escHtml(msg)}`
      : `<div class="toast-spinner"></div> ${escHtml(msg)}`;
    progressContainer.appendChild(toast);
    if (done) setTimeout(() => toast.remove(), 3000);
    return toast;
  }

  async function uploadFile(file, apiUrl, sectionKey) {
    const toast = showToast(`Uploading ${file.name}...`, false);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('filename', file.name);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
      const j = await res.json();
      toast.remove();
      if (j.ok) {
        showToast(`${file.name} uploaded`, true);
        const section = SECTIONS.find(s => s.key === sectionKey);
        if (section) loadSection(section);
      } else {
        showToast(`Failed: ${file.name}`, true);
      }
    } catch (e) {
      toast.remove();
      showToast(`Error: ${file.name}`, true);
    }
  }

  // Wire up upload forms and drag-drop
  SECTIONS.forEach(section => {
    const form = document.getElementById(section.formId);
    const dropZone = document.getElementById(section.dropId);
    if (!form) return;

    const fileInput = form.querySelector('input[type=file]');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        for (const file of fileInput.files) {
          uploadFile(file, section.api, section.key);
        }
        fileInput.value = '';
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('dragover'); });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
          uploadFile(file, section.api, section.key);
        }
      });
    }
  });

  /* ─── Delete handler (delegated) ─── */
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.btn-icon-sm[data-section]');
    if (!btn) return;
    const sectionKey = btn.dataset.section;
    const name = decodeURIComponent(btn.dataset.name);
    if (!confirm(`Delete "${name}"?`)) return;

    const section = SECTIONS.find(s => s.key === sectionKey);
    if (!section) return;

    try {
      const res = await fetch(`${section.api}/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const j = await res.json();
      if (j.ok) {
        showToast(`Deleted ${name}`, true);
        loadSection(section);
      } else {
        showToast(`Failed to delete ${name}`, true);
      }
    } catch (e) {
      showToast(`Error deleting ${name}`, true);
    }
  });

  /* ─── Last.fm ─── */
  const btnLastfm = document.getElementById('btn-lastfm');
  if (btnLastfm) {
    btnLastfm.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/lastfm/auth_url', { headers: authHeaders() });
        const j = await res.json();
        if (j.url) {
          const token = prompt('Open this URL and authorize, then paste the token:\n' + j.url);
          if (!token) return;
          const resp = await fetch('/api/lastfm/session', {
            method: 'POST',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const r = await resp.json();
          if (r.ok) showToast('Last.fm connected!', true);
          else showToast('Last.fm connection failed', true);
        } else {
          showToast('Last.fm API key not configured', true);
        }
      } catch (e) {
        showToast('Last.fm error: ' + e.message, true);
      }
    });
  }

  /* ─── Logout ─── */
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      adminToken = '';
      localStorage.removeItem('ADMIN_KEY');
      showGate();
    });
  }

  /* ─── Skip Button ─── */
  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) {
    btnSkip.addEventListener('click', async () => {
      btnSkip.disabled = true;
      btnSkip.textContent = 'SKIPPING...';
      try {
        const res = await fetch('/api/skip', {
          method: 'POST',
          headers: authHeaders(),
        });
        const j = await res.json();
        if (j.ok) {
          showToast('Track skipped!', true);
        } else {
          showToast('Skip failed: ' + (j.error || 'unknown error'), true);
        }
      } catch (e) {
        showToast('Skip error: ' + e.message, true);
      }
      btnSkip.disabled = false;
      btnSkip.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4z"/><rect x="17" y="4" width="2" height="16"/></svg> SKIP';
    });
  }

  /* ─── Color Picker ─── */
  const colorPicker = document.getElementById('accent-color-picker');
  const colorHex = document.getElementById('accent-color-hex');
  const btnSaveColor = document.getElementById('btn-save-color');

  if (colorPicker && colorHex) {
    colorPicker.addEventListener('input', () => {
      colorHex.textContent = colorPicker.value;
      applyAccentColor(colorPicker.value);
    });
  }

  // Preset color buttons
  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      if (colorPicker) colorPicker.value = color;
      if (colorHex) colorHex.textContent = color;
      applyAccentColor(color);
    });
  });

  if (btnSaveColor) {
    btnSaveColor.addEventListener('click', async () => {
      const color = colorPicker ? colorPicker.value : '#1db954';
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ accentColor: color }),
        });
        const j = await res.json();
        if (j.ok) {
          showToast(`Theme color saved: ${color}`, true);
        } else {
          showToast('Failed to save color: ' + (j.error || ''), true);
        }
      } catch (e) {
        showToast('Error saving color', true);
      }
    });
  }

  /* ─── Station Identity Save ─── */
  const btnSaveStation = document.getElementById('btn-save-station');
  if (btnSaveStation) {
    btnSaveStation.addEventListener('click', async () => {
      const stationName = (document.getElementById('setting-station-name')?.value || '').trim();
      const stationDescription = (document.getElementById('setting-station-desc')?.value || '').trim();
      const stationGenre = (document.getElementById('setting-station-genre')?.value || '').trim();
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ stationName, stationDescription, stationGenre }),
        });
        const j = await res.json();
        if (j.ok) {
          showToast('Station info saved!', true);
        } else {
          showToast('Failed to save: ' + (j.error || ''), true);
        }
      } catch (e) {
        showToast('Error saving station info', true);
      }
    });
  }

  /* ─── Admin Metadata Polling ─── */
  const adminTitle = document.getElementById('admin-track-title');
  const adminArtist = document.getElementById('admin-track-artist');
  const adminListeners = document.getElementById('admin-listeners');

  async function pollAdminStatus() {
    try {
      const res = await fetch('/api/metadata');
      const m = await res.json();
      if (m.error) return;
      if (adminTitle) adminTitle.textContent = m.title || '—';
      if (adminArtist) adminArtist.textContent = m.artist || '—';
      if (adminListeners) adminListeners.textContent = m.listeners || 0;
    } catch (e) {}
  }

  // Poll while dashboard is visible
  setInterval(() => {
    if (!dashboard.classList.contains('hidden')) pollAdminStatus();
  }, 5000);

})();
