class MiniConnectController {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 3000;
        this.state = {
            isPlaying: false,
            title: 'No song playing',
            artist: 'Unknown artist',
            volume: 50,
            progress: 0,
            duration: 0
        };

        this.initializeUI();
        this.attachEventListeners();
        this.loadSavedServer();
    }

    initializeUI() {
        this.elements = {
            configSection: document.getElementById('configSection'),
            nowPlayingSection: document.getElementById('nowPlayingSection'),
            disconnectedMessage: document.getElementById('disconnectedMessage'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            serverInput: document.getElementById('serverInput'),
            connectBtn: document.getElementById('connectBtn'),
            songTitle: document.getElementById('songTitle'),
            artistName: document.getElementById('artistName'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            nextBtn: document.getElementById('nextBtn'),
            prevBtn: document.getElementById('prevBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeValue: document.getElementById('volumeValue'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            progressFill: document.getElementById('progressFill'),
            playbackStatus: document.getElementById('playbackStatus'),
            albumArt: document.querySelector('.album-art'),
            reconnectMessage: document.getElementById('reconnectMessage'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            likeBtn: document.getElementById('likeBtn'),
            queueBtn: document.getElementById('queueBtn'),
            playlistSelect: document.getElementById('playlistSelect'),
            playPlaylistBtn: document.getElementById('playPlaylistBtn')
        };
    }

    attachEventListeners() {
        this.elements.connectBtn.addEventListener('click', () => this.connect());
        this.elements.serverInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.connect();
        });

        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
        this.elements.prevBtn.addEventListener('click', () => this.prevTrack());
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // New controls
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.likeBtn.addEventListener('click', () => this.toggleLike());
        this.elements.queueBtn.addEventListener('click', () => this.openQueue());
        
        // Playlist controls
        this.elements.playPlaylistBtn.addEventListener('click', () => this.playSelectedPlaylist());
    }

    loadSavedServer() {
        const saved = localStorage.getItem('miniconnect-server');
        
        // If no saved server, auto-detect from current URL
        if (!saved) {
            const currentHost = window.location.hostname;
            const currentPort = window.location.port || 3000;
            this.elements.serverInput.value = `${currentHost}:${currentPort}`;
        } else {
            this.elements.serverInput.value = saved;
        }
    }

    saveServer(serverUrl) {
        localStorage.setItem('miniconnect-server', serverUrl);
    }

    connect() {
        const serverUrl = this.elements.serverInput.value.trim();
        if (!serverUrl) {
            this.showError('Please enter a server URL');
            return;
        }

        this.updateStatus('Connecting...', false);
        this.elements.connectBtn.disabled = true;

        // Parse URL
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const socketUrl = serverUrl.includes('://') ? serverUrl : `${protocol}://${serverUrl}`;

        try {
            if (this.socket) {
                this.socket.disconnect();
            }

            this.socket = io(socketUrl, {
                reconnection: true,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                transports: ['websocket', 'polling']
            });

            this.attachSocketListeners();
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Failed to connect: ' + error.message);
            this.elements.connectBtn.disabled = false;
        }
    }

    attachSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('register', 'controller');
            this.reconnectAttempts = 0;
            this.updateConnection(true);
        });

        this.socket.on('state-update', (newState) => {
            console.log('State update received:', newState);
            this.updateState(newState);
        });

        this.socket.on('current-state', (state) => {
            console.log('Current state received:', state);
            this.updateState(state);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnection(false);
        });

        this.socket.on('reconnect_attempt', () => {
            console.log('Reconnecting...');
            this.reconnectAttempts++;
            this.updateStatus(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, false);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            this.showError('Connection lost. Please check your server.');
            this.updateConnection(false);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.updateStatus('Connection Error', false);
        });

        this.socket.on('playlists', (playlists) => {
            console.log('Playlists received:', playlists);
            if (playlists && playlists.length > 0) {
                console.log(`[MiniConnect] Got ${playlists.length} playlists from server`);
                this.updatePlaylistOptions(playlists);
            } else {
                console.warn('[MiniConnect] Playlists array is empty');
            }
        });

        this.socket.on('playlist-playing', (playlist) => {
            console.log('Now playing playlist:', playlist);
            this.showError(`Playing: ${playlist.name}`);
        });
    }

    updateConnection(connected) {
        this.isConnected = connected;
        this.elements.connectBtn.disabled = connected;

        if (connected) {
            this.saveServer(this.elements.serverInput.value);
            this.updateStatus('Connected', true);
            this.elements.configSection.style.display = 'none';
            this.elements.nowPlayingSection.style.display = 'block';
            this.elements.disconnectedMessage.style.display = 'none';
            this.elements.reconnectMessage.style.display = 'none';
            
            // Request available playlists
            setTimeout(() => this.getAvailablePlaylists(), 500);
        } else {
            this.updateStatus('Disconnected', false);
            this.elements.configSection.style.display = 'block';
            this.elements.disconnectedMessage.style.display = 'block';
            this.elements.reconnectMessage.style.display = 'block';
        }
    }

    updateStatus(text, connected) {
        this.elements.statusText.textContent = text;
        if (connected) {
            this.elements.statusDot.classList.add('connected');
        } else {
            this.elements.statusDot.classList.remove('connected');
        }
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };

        // Update UI
        this.elements.songTitle.textContent = this.state.title || 'No song playing';
        this.elements.artistName.textContent = this.state.artist || 'Unknown artist';
        
        // Update volume slider with proper visual feedback
        if (this.state.volume !== undefined) {
            this.elements.volumeSlider.value = this.state.volume;
            this.elements.volumeValue.textContent = this.state.volume + '%';
            // Update visual fill for the slider
            this.elements.volumeSlider.style.backgroundSize = (this.state.volume) + '% 100%';
        }

        // Update playback status
        const statusText = this.state.isPlaying ? '▶ Playing' : '⏸ Paused';
        this.elements.playbackStatus.textContent = statusText;

        // Update album art animation
        if (this.state.isPlaying) {
            this.elements.albumArt.classList.remove('paused');
        } else {
            this.elements.albumArt.classList.add('paused');
        }

        // Update play/pause button icon
        this.updatePlayPauseButton();

        // Update progress
        if (this.state.duration > 0) {
            const progressPercent = (this.state.progress / this.state.duration) * 100;
            this.elements.progressFill.style.width = progressPercent + '%';
            this.elements.currentTime.textContent = this.formatTime(this.state.progress);
            this.elements.duration.textContent = this.formatTime(this.state.duration);
        }
    }

    updatePlayPauseButton() {
        const playIcon = this.elements.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.elements.playPauseBtn.querySelector('.pause-icon');

        if (this.state.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    togglePlayPause() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('play-pause');
    }

    nextTrack() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('next');
    }

    prevTrack() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('prev');
    }

    setVolume(value) {
        this.state.volume = parseInt(value);
        this.elements.volumeValue.textContent = value + '%';
        
        // Update visual fill for slider
        this.elements.volumeSlider.value = value;
        this.elements.volumeSlider.style.backgroundSize = (value) + '% 100%';
        this.elements.volumeSlider.style.setProperty('--value', value + '%');

        if (!this.isConnected) return;

        // Debounce volume updates
        clearTimeout(this.volumeTimeout);
        this.volumeTimeout = setTimeout(() => {
            this.socket.emit('volume', this.state.volume);
        }, 100);
    }

    toggleShuffle() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('shuffle');
    }

    toggleRepeat() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('repeat');
    }

    toggleLike() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('like');
    }

    openQueue() {
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        this.socket.emit('queue');
    }

    getAvailablePlaylists() {
        if (!this.isConnected) {
            console.warn('Not connected to get playlists');
            return;
        }
        console.log('[MiniConnect] Requesting playlists from server...');
        this.socket.emit('get-playlists');
        
        // Retry if no playlists received after 2 seconds
        setTimeout(() => {
            if (this.elements.playlistSelect.options.length <= 1 && this.isConnected) {
                console.log('[MiniConnect] No playlists yet, retrying...');
                this.socket.emit('get-playlists');
            }
        }, 2000);
    }

    playSelectedPlaylist() {
        const playlistId = this.elements.playlistSelect.value;
        const playlistName = this.elements.playlistSelect.options[this.elements.playlistSelect.selectedIndex].text;
        
        if (!playlistId) {
            this.showError('Please select a playlist');
            return;
        }
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }
        
        console.log('[MiniConnect Phone] Playing playlist:');
        console.log('  Name:', playlistName);
        console.log('  ID:', playlistId);
        
        this.socket.emit('play-playlist', playlistId);
        this.showError(`Playing: ${playlistName}`);
    }

    updatePlaylistOptions(playlists) {
        // Filter out duplicates and songs
        const seenNames = new Set();
        const uniquePlaylists = [];
        
        if (playlists && Array.isArray(playlists)) {
            for (const playlist of playlists) {
                // Skip songs (they have video IDs)
                if (playlist.id && playlist.id.includes('&v=')) {
                    console.log('  Skipped (song):', playlist.name);
                    continue;
                }
                
                // Skip duplicates
                if (!seenNames.has(playlist.name)) {
                    uniquePlaylists.push(playlist);
                    seenNames.add(playlist.name);
                }
            }
        }
        
        // Clear existing options (except the first one)
        while (this.elements.playlistSelect.options.length > 1) {
            this.elements.playlistSelect.remove(1);
        }

        // Add new playlist options
        if (uniquePlaylists.length > 0) {
            console.log('[MiniConnect] Adding', uniquePlaylists.length, 'playlists to dropdown');
            for (const playlist of uniquePlaylists) {
                const option = document.createElement('option');
                option.value = playlist.id || playlist.name;
                option.textContent = playlist.name;
                this.elements.playlistSelect.appendChild(option);
                console.log('  ✓ Added playlist:', playlist.name);
            }
        } else {
            console.warn('[MiniConnect] No playlists received or all were duplicates/songs');
        }
    }

    formatTime(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showError(message) {
        console.error(message);
        // Optional: Show toast notification
        const originalText = this.elements.statusText.textContent;
        this.elements.statusText.textContent = message;
        setTimeout(() => {
            this.elements.statusText.textContent = originalText;
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.miniConnectApp = new MiniConnectController();
    console.log('MiniConnect Controller initialized');
});
