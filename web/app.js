// AutoDJ Extreme - Web Control Panel
const API_BASE = window.location.origin;

// Stream formats available - matches Liquidsoap outputs
const streamFormats = [
    { name: 'MP3 Stream', url: '/autodj.mp3', quality: '128kbps MP3', format: 'MP3' },
    { name: 'OGG Vorbis', url: '/autodj.ogg', quality: 'High quality OGG', format: 'OGG' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initStreamLinks();
    initControls();
    startPolling();
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
            
            // Update active state
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchPage(pageName) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // Update page title
    const title = document.querySelector('.page-title');
    title.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
}

// Stream Links
function initStreamLinks() {
    const container = document.getElementById('streamLinks');
    
    streamFormats.forEach(stream => {
        const card = document.createElement('div');
        card.className = 'stream-card';
        card.innerHTML = `
            <div class="stream-format">${stream.name}</div>
            <div class="stream-quality">${stream.quality}</div>
            <div class="stream-url">${API_BASE}${stream.url}</div>
            <button class="copy-btn" onclick="copyToClipboard('${API_BASE}${stream.url}')">
                📋 Copy URL
            </button>
        `;
        container.appendChild(card);
    });
}

// Controls
function initControls() {
    // Skip track
    document.getElementById('skipBtn').addEventListener('click', () => {
        skipTrack();
    });
    
    // Refresh playlist
    document.getElementById('refreshPlaylistBtn').addEventListener('click', () => {
        refreshPlaylist();
    });
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        updateNowPlaying();
        updateStats();
    });
}

// API Functions
async function skipTrack() {
    try {
        const response = await fetch('/admin/metadata?mode=updinfo&mount=/autodj-128.mp3&song=SKIP', {
            credentials: 'include'
        });
        
        if (response.ok) {
            showNotification('⏭️ Track skipped!', 'success');
            setTimeout(updateNowPlaying, 1000);
        }
    } catch (error) {
        console.error('Skip failed:', error);
        showNotification('❌ Skip failed', 'error');
    }
}

async function refreshPlaylist() {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            showNotification('🔄 Playlist refreshed!', 'success');
        }
    } catch (error) {
        console.error('Refresh failed:', error);
    }
}

async function updateNowPlaying() {
    try {
        // Try to read the now_playing.json file
        const response = await fetch('/now_playing.json');
        if (response.ok) {
            const data = await response.json();
            updateTrackDisplay(data);
        } else {
            // Fallback to Icecast stats
            updateFromIcecastStats();
        }
    } catch (error) {
        console.error('Failed to update now playing:', error);
        updateFromIcecastStats();
    }
}

function updateFromIcecastStats() {
    fetch('/status-json.xsl')
        .then(res => res.json())
        .then(data => {
            const source = data.icestats?.source;
            if (source) {
                // Handle single source or array of sources
                const src = Array.isArray(source) ? source[0] : source;
                const trackData = {
                    title: src.title || src.server_name || 'AutoDJ Stream',
                    artist: src.artist || 'Now Playing',
                    genre: src.genre || 'Various'
                };
                updateTrackDisplay(trackData);
                
                // Update status indicator
                const statusDot = document.querySelector('.status-dot');
                if (statusDot) statusDot.style.background = '#1db954';
            } else {
                // No source = no stream
                document.getElementById('trackTitle').textContent = 'Stream Offline';
                document.getElementById('trackArtist').textContent = 'Waiting for source...';
                const statusDot = document.querySelector('.status-dot');
                if (statusDot) statusDot.style.background = '#f83062';
            }
        })
        .catch(err => {
            console.error('Stats error:', err);
            document.getElementById('trackTitle').textContent = 'Connection Error';
            document.getElementById('trackArtist').textContent = 'Unable to reach server';
        });
}

function updateTrackDisplay(data) {
    document.getElementById('trackTitle').textContent = data.title || 'Unknown Title';
    document.getElementById('trackArtist').textContent = data.artist || 'Unknown Artist';
    document.getElementById('trackGenre').textContent = data.genre || 'Various';
    
    // Update album art if available
    if (data.albumArt) {
        document.getElementById('albumArt').src = data.albumArt;
    }
}

async function updateStats() {
    try {
        const response = await fetch('/status-json.xsl');
        const data = await response.json();
        
        const stats = data.icestats;
        if (!stats) return;
        
        // Update listener count
        let totalListeners = 0;
        let isLive = false;
        if (stats.source) {
            const sources = Array.isArray(stats.source) ? stats.source : [stats.source];
            totalListeners = sources.reduce((sum, s) => sum + (parseInt(s.listeners) || 0), 0);
            isLive = sources.length > 0;
        }
        
        const listenerEl = document.getElementById('listenerCount');
        if (listenerEl) listenerEl.textContent = totalListeners;
        
        // Update stream status
        const streamStatus = document.getElementById('streamStatus');
        if (streamStatus) {
            streamStatus.textContent = isLive ? 'LIVE' : 'OFFLINE';
            streamStatus.style.color = isLive ? '#1db954' : '#f83062';
        }
        
        // Update uptime
        if (stats.server_start) {
            const uptimeEl = document.getElementById('uptime');
            if (uptimeEl) uptimeEl.textContent = calculateUptime(stats.server_start);
        }
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

function calculateUptime(startTime) {
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now - start) / 1000);
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('❌ Copy failed', 'error');
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#1db954' : '#f83062'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Polling
function startPolling() {
    updateNowPlaying();
    updateStats();
    
    // Poll every 5 seconds
    setInterval(() => {
        updateNowPlaying();
        updateStats();
    }, 5000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
