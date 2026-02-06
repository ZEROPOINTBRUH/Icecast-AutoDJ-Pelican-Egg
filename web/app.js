// AutoDJ Extreme - Web Control Panel
const API_BASE = window.location.origin;

// Stream formats available
const streamFormats = [
    { name: 'MP3 64k (Mobile)', url: '/autodj-64.mp3', quality: 'Low bandwidth', format: 'MP3' },
    { name: 'MP3 128k (Standard)', url: '/autodj-128.mp3', quality: 'Standard quality', format: 'MP3' },
    { name: 'MP3 192k (High)', url: '/autodj-192.mp3', quality: 'High quality', format: 'MP3' },
    { name: 'MP3 320k (Studio)', url: '/autodj-320.mp3', quality: 'Studio quality', format: 'MP3' },
    { name: 'OGG Vorbis', url: '/autodj.ogg', quality: 'Efficient compression', format: 'OGG' },
    { name: 'OGG Vorbis HQ', url: '/autodj-hq.ogg', quality: 'High quality', format: 'OGG' },
    { name: 'AAC', url: '/autodj.aac', quality: 'iOS compatible', format: 'AAC' },
    { name: 'AAC+ Mobile', url: '/autodj-mobile.aac', quality: 'Mobile optimized', format: 'AAC+' },
    { name: 'OPUS', url: '/autodj.opus', quality: 'Modern codec', format: 'OPUS' },
    { name: 'OPUS HQ', url: '/autodj-hq.opus', quality: 'High quality', format: 'OPUS' },
    { name: 'FLAC Lossless', url: '/autodj.flac', quality: 'Audiophile quality', format: 'FLAC' }
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
                const trackData = {
                    title: source.title || 'Unknown Title',
                    artist: source.artist || 'Unknown Artist',
                    genre: source.genre || 'Various'
                };
                updateTrackDisplay(trackData);
            }
        })
        .catch(err => console.error('Stats error:', err));
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
        
        // Update listener count
        let totalListeners = 0;
        if (stats.source) {
            const sources = Array.isArray(stats.source) ? stats.source : [stats.source];
            totalListeners = sources.reduce((sum, s) => sum + (parseInt(s.listeners) || 0), 0);
        }
        
        document.getElementById('listenerCount').textContent = totalListeners;
        
        // Update other stats if available
        if (stats.server_start) {
            const uptime = calculateUptime(stats.server_start);
            document.getElementById('uptime').textContent = uptime;
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
