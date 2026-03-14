(() => {
  const API = {
    tracks: '/api/tracks',
    statusJson: '/api/status/json',
  };

  const el = (sel) => document.querySelector(sel);
  const tracksList = el('#tracks-list');
  const uploadForm = el('#upload-form');
  const fileInput = el('#file-input');
  const filenameInput = el('#filename');
  const portInfo = el('#port-info');

  async function loadTracks() {
    tracksList.innerHTML = 'Loading...';
    try {
      const res = await fetch(API.tracks);
      const files = await res.json();
      tracksList.innerHTML = '';
      if (!files.length) tracksList.textContent = 'No tracks yet.';
      for (const f of files) {
        const node = document.createElement('div');
        node.className = 'item';
        node.innerHTML = `<div><strong>${f.name}</strong><div class="meta">${(f.size/1024/1024).toFixed(2)} MB</div></div><div><button data-name="${encodeURIComponent(f.name)}" class="btn-del">Delete</button></div>`;
        tracksList.appendChild(node);
      }
    } catch (e) {
      tracksList.textContent = 'Failed to load tracks';
    }
  }

  // playlists
  async function loadPlaylists() {
    const el = document.getElementById('view-playlists');
    el.innerHTML = 'Loading...';
    try {
      const res = await fetch('/api/playlists');
      const files = await res.json();
      el.innerHTML = '';
      const list = document.createElement('div');
      list.className = 'list';
      if (!files.length) list.textContent = 'No playlists';
      for (const p of files) {
        const node = document.createElement('div');
        node.className = 'item';
        node.innerHTML = `<div><strong>${p.name}</strong><div class="meta">${p.size} bytes</div></div><div><button data-name="${encodeURIComponent(p.name)}" class="btn-playlist-del">Delete</button></div>`;
        list.appendChild(node);
      }
      el.appendChild(list);
    } catch (e) { el.textContent = 'Failed to load playlists'; }
  }

  // ads
  async function loadAds() {
    const el = document.getElementById('view-ads');
    el.innerHTML = 'Loading...';
    try {
      const res = await fetch('/api/ads');
      const files = await res.json();
      el.innerHTML = '';
      const list = document.createElement('div');
      list.className = 'list';
      if (!files.length) list.textContent = 'No ads';
      for (const a of files) {
        const node = document.createElement('div');
        node.className = 'item';
        node.innerHTML = `<div><strong>${a.name}</strong><div class="meta">${(a.size/1024).toFixed(1)} KB</div></div><div><button data-name="${encodeURIComponent(a.name)}" class="btn-ad-del">Delete</button></div>`;
        list.appendChild(node);
      }
      el.appendChild(list);
    } catch (e) { el.textContent = 'Failed to load ads'; }
  }

  uploadForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const file = fileInput.files[0];
    if (!file) return alert('Pick a file');
    const fd = new FormData();
    fd.append('file', file);
    if (filenameInput.value) fd.append('filename', filenameInput.value);
    const headers = {};
    const adminKey = localStorage.getItem('ADMIN_KEY');
    if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
    const res = await fetch(API.tracks, { method: 'POST', body: fd, headers });
    const j = await res.json();
    if (j.ok) { fileInput.value = ''; filenameInput.value = ''; loadTracks(); }
    else alert('Upload failed: ' + (j.error||'unknown'));
  });

  tracksList.addEventListener('click', async (ev) => {
    if (ev.target.classList.contains('btn-del')) {
      const name = decodeURIComponent(ev.target.getAttribute('data-name'));
      if (!confirm(`Delete ${name}?`)) return;
      const headers = {};
      const adminKey = localStorage.getItem('ADMIN_KEY');
      if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
      const res = await fetch(`/api/tracks/${encodeURIComponent(name)}`, { method: 'DELETE', headers });
      const j = await res.json();
      if (j.ok) loadTracks(); else alert('Delete failed');
    }
  });

  // playlist & ads delete handlers
  document.addEventListener('click', async (ev) => {
    if (ev.target.classList.contains('btn-playlist-del')) {
      const name = decodeURIComponent(ev.target.getAttribute('data-name'));
      if (!confirm(`Delete playlist ${name}?`)) return;
      const adminKey = localStorage.getItem('ADMIN_KEY');
      const headers = {};
      if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
      const res = await fetch(`/api/playlists/${encodeURIComponent(name)}`, { method: 'DELETE', headers });
      const j = await res.json(); if (j.ok) loadPlaylists(); else alert('Delete failed');
    }
    if (ev.target.classList.contains('btn-ad-del')) {
      const name = decodeURIComponent(ev.target.getAttribute('data-name'));
      if (!confirm(`Delete ad ${name}?`)) return;
      const adminKey = localStorage.getItem('ADMIN_KEY');
      const headers = {};
      if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
      const res = await fetch(`/api/ads/${encodeURIComponent(name)}`, { method: 'DELETE', headers });
      const j = await res.json(); if (j.ok) loadAds(); else alert('Delete failed');
    }
  });

  // Last.fm admin controls
  async function lastfmAuthUrl() {
    const headers = {};
    const adminKey = localStorage.getItem('ADMIN_KEY');
    if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
    const res = await fetch('/api/lastfm/auth_url', { headers });
    const j = await res.json();
    if (j.url) return j.url; throw new Error(JSON.stringify(j));
  }

  document.addEventListener('keydown', async (e) => {
    // press L to open Last.fm connect prompt
    if (e.key === 'L') {
      try {
        const url = await lastfmAuthUrl();
        const token = prompt('Open this URL and authorize, then paste the token from the callback page?\n' + url);
        if (!token) return;
        const adminKey = localStorage.getItem('ADMIN_KEY');
        const headers = { 'Content-Type': 'application/json' };
        if (adminKey) headers['Authorization'] = 'Bearer ' + adminKey;
        const resp = await fetch('/api/lastfm/session', { method: 'POST', headers, body: JSON.stringify({ token }) });
        const j = await resp.json();
        if (j.ok) alert('Last.fm session saved'); else alert('Failed: '+JSON.stringify(j));
      } catch (err) { alert(String(err)); }
    }
  });

  // Basic nav
  document.getElementById('nav-tracks').addEventListener('click', () => { showView('tracks'); });
  document.getElementById('nav-playlists').addEventListener('click', () => { showView('playlists'); });
  document.getElementById('nav-ads').addEventListener('click', () => { showView('ads'); });

  function showView(name) {
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    document.getElementById('nav-'+name).classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById('view-'+name).classList.remove('hidden');
  }

  // admin login
  document.getElementById('btn-login').addEventListener('click', async () => {
    const pw = prompt('Enter admin password:');
    if (!pw) return;
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      const j = await res.json();
      if (j.ok && j.token) { localStorage.setItem('ADMIN_KEY', j.token); alert('Logged in'); }
      else alert('Login failed');
    } catch (e) { alert('Login error'); }
  });

  async function fetchPort() {
    try {
      // try to read public PORT from / (no dedicated endpoint), fallback to window.location
      portInfo.textContent = window.location.port || '—';
    } catch (e) { portInfo.textContent = '—'; }
  }

  // three.js visual (simple particles)
  function startVisual() {
    const container = document.getElementById('visual');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    camera.position.z = 5;
    const geometry = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i=0;i<count*3;i++) positions[i] = (Math.random()-0.5) * 8;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x1db954, size: 0.07, transparent: true, opacity: 0.9 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0015;
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth/container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  // init
  loadTracks(); loadPlaylists(); loadAds(); fetchPort(); startVisual();
})();
