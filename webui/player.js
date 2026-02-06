/**
 * Modern Radio Station Player
 * Created by: @zeropointbruh (wegj1@hotmail.com)
 * Website: https://banabyte.com
 */

class RadioPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.isPlaying = false;
        this.streamUrl = this.detectStreamUrl();
        this.updateInterval = null;
        this.trackHistory = [];
        
        this.init();
    }

    detectStreamUrl() {
        // Auto-detect stream URL based on current page
        const hostname = window.location.hostname;
        const port = window.location.port || '8000';
        return `http://${hostname}:${port}/autodj`;
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadStationInfo();
        this.startUpdates();
        this.showToast('Welcome! Click play to start listening.', 'success');
    }

    setupElements() {
        this.playBtn = document.getElementById('playBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.currentTrack = document.getElementById('currentTrack');
        this.currentArtist = document.getElementById('currentArtist');
        this.listeners = document.getElementById('listeners');
        this.totalListeners = document.getElementById('totalListeners');
        
        // Set audio source
        this.audio.src = this.streamUrl;
        this.audio.volume = 0.7;
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.audio.volume = volume;
            this.volumeValue.textContent = `${e.target.value}%`;
        });

        // Audio events
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.showToast('Now playing live stream!', 'success');
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.audio.addEventListener('error', (e) => {
            this.showToast('Connection error. Retrying...', 'error');
            this.currentTrack.textContent = 'Connection Error';
            this.currentArtist.textContent = 'Attempting to reconnect...';
            
            // Retry connection
            setTimeout(() => {
                if (this.isPlaying) {
                    this.audio.load();
                    this.audio.play().catch(() => {});
                }
            }, 5000);
        });

        // Stream links
        document.getElementById('m3uLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadPlaylist('m3u');
        });

        document.getElementById('plsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadPlaylist('pls');
        });

        document.getElementById('copyUrlBtn').addEventListener('click', () => {
            this.copyStreamUrl();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(err => {
                console.error('Playback failed:', err);
                this.showToast('Unable to start playback. Click play again.', 'error');
            });
        }
    }

    updatePlayButton() {
        const icon = this.playBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    async loadStationInfo() {
        try {
            // Try to load station info from Icecast status JSON
            const response = await fetch(`${this.getBaseUrl()}/status-json.xsl`);
            const data = await response.json();
            
            if (data.icestats && data.icestats.source) {
                const source = Array.isArray(data.icestats.source) 
                    ? data.icestats.source[0] 
                    : data.icestats.source;

                // Update station info
                if (source.server_name) {
                    document.getElementById('stationName').textContent = source.server_name;
                }
                
                if (source.server_description) {
                    document.getElementById('stationDescription').textContent = source.server_description;
                }

                if (source.genre) {
                    document.getElementById('stationTagline').textContent = `${source.genre} - Live 24/7`;
                }

                // Update stream info
                this.updateStreamInfo(source);
            }
        } catch (error) {
            console.log('Could not load station info, using defaults');
        }
    }

    async updateNowPlaying() {
        try {
            const response = await fetch(`${this.getBaseUrl()}/status-json.xsl`);
            const data = await response.json();
            
            if (data.icestats && data.icestats.source) {
                const source = Array.isArray(data.icestats.source) 
                    ? data.icestats.source[0] 
                    : data.icestats.source;

                // Update current track
                if (source.title) {
                    const title = source.title;
                    
                    // Try to parse "Artist - Title" format
                    if (title.includes(' - ')) {
                        const [artist, track] = title.split(' - ', 2);
                        this.currentArtist.textContent = artist;
                        this.currentTrack.textContent = track;
                    } else {
                        this.currentTrack.textContent = title;
                        this.currentArtist.textContent = source.server_name || 'Live Stream';
                    }

                    // Add to history if new
                    if (this.trackHistory.length === 0 || this.trackHistory[0] !== title) {
                        this.addToHistory(title);
                    }
                }

                // Update listener count
                if (source.listeners !== undefined) {
                    this.listeners.textContent = source.listeners;
                    this.totalListeners.textContent = Math.max(
                        parseInt(this.totalListeners.textContent) || 0,
                        source.listeners
                    );
                }

                // Update stream info
                this.updateStreamInfo(source);
            }
        } catch (error) {
            // Silently fail - stream might be offline
            console.log('Update failed:', error);
        }
    }

    updateStreamInfo(source) {
        if (source.bitrate) {
            document.getElementById('bitrate').textContent = `${source.bitrate} kbps`;
        }

        if (source.server_type) {
            const format = source.server_type.includes('MP3') ? 'MP3' : 
                          source.server_type.includes('OGG') ? 'OGG' : 
                          source.server_type.includes('OPUS') ? 'OPUS' : 'Audio';
            document.getElementById('format').textContent = format;
        }

        // Update uptime/status
        document.getElementById('uptime').textContent = 'Online';
    }

    addToHistory(title) {
        this.trackHistory.unshift(title);
        if (this.trackHistory.length > 10) {
            this.trackHistory.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyDiv = document.getElementById('trackHistory');
        
        if (this.trackHistory.length === 0) {
            historyDiv.innerHTML = '<div class="track-item"><i class="fas fa-music"></i><span>No tracks played yet</span></div>';
            return;
        }

        historyDiv.innerHTML = this.trackHistory.map((track, index) => {
            const icon = index === 0 ? 'fa-play-circle' : 'fa-music';
            const label = index === 0 ? 'Now Playing' : `${index} ago`;
            return `
                <div class="track-item">
                    <i class="fas ${icon}"></i>
                    <div style="flex: 1;">
                        <div>${track}</div>
                        <small style="color: var(--text-secondary);">${label}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    startUpdates() {
        // Update now playing every 10 seconds
        this.updateNowPlaying();
        this.updateInterval = setInterval(() => {
            this.updateNowPlaying();
        }, 10000);
    }

    downloadPlaylist(format) {
        const hostname = window.location.hostname;
        const port = window.location.port || '8000';
        const streamUrl = `http://${hostname}:${port}/autodj`;

        let content;
        let filename;

        if (format === 'm3u') {
            content = `#EXTM3U\n#EXTINF:-1,${document.getElementById('stationName').textContent}\n${streamUrl}\n`;
            filename = 'radio-stream.m3u';
        } else if (format === 'pls') {
            content = `[playlist]\nNumberOfEntries=1\nFile1=${streamUrl}\nTitle1=${document.getElementById('stationName').textContent}\nLength1=-1\nVersion=2\n`;
            filename = 'radio-stream.pls';
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showToast(`Downloaded ${filename}`, 'success');
    }

    copyStreamUrl() {
        const url = this.streamUrl;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Stream URL copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(url);
            });
        } else {
            this.fallbackCopy(url);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Stream URL copied!', 'success');
        } catch (err) {
            this.showToast('Could not copy URL', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existing = document.querySelectorAll('.toast');
        existing.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getBaseUrl() {
        const hostname = window.location.hostname;
        const port = window.location.port || '8000';
        return `http://${hostname}:${port}`;
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.radioPlayer = new RadioPlayer();
});

// Handle visibility change to optimize updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, reduce update frequency
        if (window.radioPlayer && window.radioPlayer.updateInterval) {
            clearInterval(window.radioPlayer.updateInterval);
            window.radioPlayer.updateInterval = setInterval(() => {
                window.radioPlayer.updateNowPlaying();
            }, 30000); // Every 30 seconds when hidden
        }
    } else {
        // Page is visible, restore normal update frequency
        if (window.radioPlayer && window.radioPlayer.updateInterval) {
            clearInterval(window.radioPlayer.updateInterval);
            window.radioPlayer.updateInterval = setInterval(() => {
                window.radioPlayer.updateNowPlaying();
            }, 10000); // Every 10 seconds when visible
        }
    }
});
