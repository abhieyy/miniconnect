/**
 * MiniConnect Chrome Extension - Content Script
 * Runs on https://music.youtube.com/*
 * Interacts with YouTube Music DOM and communicates with server via HTTP polling
 */

let isConnected = false;
let pollInterval = null;
let serverUrl = 'http://localhost:3000';
let playlistsDetected = false; // Track if playlists have been detected
let lastState = {
    isPlaying: false,
    title: 'Loading...',
    artist: '',
    volume: 100,
    progress: 0,
    duration: 0
};

/**
 * Initialize HTTP polling connection
 */
function initializeConnection() {
    try {
        console.log('[MiniConnect] Starting HTTP polling to:', serverUrl);
        
        // Register with server
        registerWithServer();
        
        // Poll for commands and send state
        pollInterval = setInterval(() => {
            getCommandsFromServer();
            sendStateToServer();
        }, 1000);
        
        console.log('[MiniConnect] HTTP polling started');
    } catch (error) {
        console.error('[MiniConnect] Connection initialization error:', error);
    }
}

/**
 * Register as extension client
 */
async function registerWithServer() {
    try {
        await fetch(`${serverUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientType: 'extension' })
        });
        isConnected = true;
        console.log('[MiniConnect] Registered with server as extension');
    } catch (error) {
        console.error('[MiniConnect] Registration error:', error);
    }
}

/**
 * Get pending commands from server
 */
async function getCommandsFromServer() {
    try {
        const response = await fetch(`${serverUrl}/api/commands`);
        const data = await response.json();
        
        if (data.command) {
            console.log('[MiniConnect] ⭐ COMMAND RECEIVED:', data.command, 'Value:', data.value);
            
            switch(data.command) {
                case 'play-pause':
                    console.log('[MiniConnect] Executing: PLAY/PAUSE');
                    togglePlayPause();
                    break;
                case 'next':
                    console.log('[MiniConnect] Executing: NEXT');
                    clickNextButton();
                    break;
                case 'prev':
                    console.log('[MiniConnect] Executing: PREVIOUS');
                    clickPrevButton();
                    break;
                case 'volume':
                    console.log('[MiniConnect] Executing: VOLUME =', data.value);
                    setVolume(data.value);
                    break;
                case 'shuffle':
                    console.log('[MiniConnect] Executing: SHUFFLE');
                    toggleShuffle();
                    break;
                case 'repeat':
                    console.log('[MiniConnect] Executing: REPEAT');
                    toggleRepeat();
                    break;
                case 'like':
                    console.log('[MiniConnect] Executing: LIKE/THUMBS UP');
                    toggleLike();
                    break;
                case 'queue':
                    console.log('[MiniConnect] Executing: OPEN QUEUE');
                    openQueue();
                    break;
                case 'get-playlists':
                    console.log('[MiniConnect] Executing: GET PLAYLISTS');
                    getAvailablePlaylists();
                    break;
                case 'play-playlist':
                    console.log('[MiniConnect] Executing: PLAY PLAYLIST =', data.value);
                    playPlaylist(data.value);
                    break;
                default:
                    console.warn('[MiniConnect] Unknown command:', data.command);
            }
        }
    } catch (error) {
        // Silently fail - server might not have this endpoint
    }
}

/**
 * Send current state to server
 */
async function sendStateToServer() {
    try {
        const currentState = getPlaybackState();
        
        // Only send if state changed
        if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
            lastState = currentState;
            
            await fetch(`${serverUrl}/api/state`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentState)
            });
            
            console.log('[MiniConnect] State sent:', currentState);
        }
    } catch (error) {
        // Silently fail on network errors
    }
}

/**
 * Find and click the play/pause button
 */
function togglePlayPause() {
    try {
        const selectors = [
            'button[aria-label="Play"]',
            'button[aria-label="Pause"]',
            'button.yt-spec-button-shape-next[aria-label*="Play"]',
            'button.yt-spec-button-shape-next[aria-label*="Pause"]',
            '[role="button"][aria-label*="Play"]',
            '[role="button"][aria-label*="Pause"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Clicking play/pause button');
            button.click();
            setTimeout(sendStateToServer, 500);
        } else {
            console.warn('[MiniConnect] Play/Pause button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] togglePlayPause error:', error);
    }
}

/**
 * Find and click the next button
 */
function clickNextButton() {
    try {
        const selectors = [
            'button[aria-label="Next"]',
            'button.yt-spec-button-shape-next[aria-label*="Next"]',
            '[role="button"][aria-label*="Next"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Clicking next button');
            button.click();
            setTimeout(sendStateToServer, 500);
        } else {
            console.warn('[MiniConnect] Next button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] clickNextButton error:', error);
    }
}

/**
 * Find and click the previous button
 */
function clickPrevButton() {
    try {
        const selectors = [
            'button[aria-label="Previous"]',
            'button.yt-spec-button-shape-next[aria-label*="Previous"]',
            '[role="button"][aria-label*="Previous"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Clicking previous button');
            button.click();
            setTimeout(sendStateToServer, 500);
        } else {
            console.warn('[MiniConnect] Previous button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] clickPrevButton error:', error);
    }
}

/**
 * Toggle shuffle mode
 */
function toggleShuffle() {
    try {
        const selectors = [
            'button[aria-label*="Shuffle"]',
            'button[aria-label*="shuffle"]',
            '[role="button"][aria-label*="Shuffle"]',
            'ytmusic-icon-button[aria-label*="Shuffle"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                console.log('[MiniConnect] Found shuffle button');
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Toggling shuffle');
            button.click();
            setTimeout(sendStateToServer, 300);
        } else {
            console.warn('[MiniConnect] Shuffle button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] toggleShuffle error:', error);
    }
}

/**
 * Toggle repeat mode
 */
function toggleRepeat() {
    try {
        const selectors = [
            'button[aria-label*="Repeat"]',
            'button[aria-label*="repeat"]',
            '[role="button"][aria-label*="Repeat"]',
            'ytmusic-icon-button[aria-label*="Repeat"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                console.log('[MiniConnect] Found repeat button');
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Toggling repeat');
            button.click();
            setTimeout(sendStateToServer, 300);
        } else {
            console.warn('[MiniConnect] Repeat button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] toggleRepeat error:', error);
    }
}

/**
 * Toggle like/thumbs up
 */
function toggleLike() {
    try {
        const selectors = [
            'button[aria-label*="like"]',
            'button[aria-label*="Like"]',
            'button[aria-label*="Thumbs up"]',
            '[role="button"][aria-label*="like"]',
            'ytmusic-like-button'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                console.log('[MiniConnect] Found like button');
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Toggling like');
            button.click();
            setTimeout(sendStateToServer, 300);
        } else {
            console.warn('[MiniConnect] Like button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] toggleLike error:', error);
    }
}

/**
 * Open queue/playlist
 */
function openQueue() {
    try {
        const selectors = [
            'button[aria-label*="Queue"]',
            'button[aria-label*="queue"]',
            '[role="button"][aria-label*="Queue"]',
            'ytmusic-icon-button[aria-label*="Queue"]'
        ];

        let button = null;
        for (const selector of selectors) {
            button = document.querySelector(selector);
            if (button && button.offsetParent !== null) {
                console.log('[MiniConnect] Found queue button');
                break;
            }
        }

        if (button) {
            console.log('[MiniConnect] Opening queue');
            button.click();
            setTimeout(sendStateToServer, 300);
        } else {
            console.warn('[MiniConnect] Queue button not found');
        }
    } catch (error) {
        console.error('[MiniConnect] openQueue error:', error);
    }
}

/**
 * Get available playlists from YouTube Music sidebar
 */
function getAvailablePlaylists() {
    try {
        console.log('[MiniConnect] === FETCHING PLAYLISTS ===');
        const playlists = [];
        const seenNames = new Set();

        // Search for ALL links on the page
        const allLinks = document.querySelectorAll('a[href]');
        console.log('[MiniConnect] Found', allLinks.length, 'total links');
        
        // Filter for playlist-like links
        allLinks.forEach((elem, idx) => {
            const text = elem.textContent.trim();
            const href = elem.getAttribute('href') || '';
            
            // Skip empty text
            if (!text || text.length === 0 || text.length > 100) return;
            
            // Skip obvious non-playlist items
            if (text.includes('•') || text.includes('▶') || text.includes('⏸')) return;
            
            // Look for playlists - BOTH system (/browse/) AND user playlists (?list=)
            const isSystemPlaylist = href.includes('/browse/');
            const isUserPlaylist = href.includes('?list=') || href.includes('&list=');
            
            if ((isSystemPlaylist || isUserPlaylist) && !seenNames.has(text)) {
                // Build full URL for user playlists that are just query strings
                let fullHref = href;
                if (isUserPlaylist && !href.startsWith('http')) {
                    fullHref = 'https://music.youtube.com/playlist' + (href.startsWith('?') ? '' : '?') + href;
                }
                
                playlists.push({
                    name: text,
                    id: fullHref,
                    url: fullHref
                });
                seenNames.add(text);
                console.log('[MiniConnect] ✓ Added:', text, '→', fullHref.substring(0, 80));
            }
        });

        console.log('[MiniConnect] === TOTAL PLAYLISTS FOUND: ' + playlists.length + ' ===');
        
        // Mark playlists as detected
        playlistsDetected = true;
        
        // If nothing found, use defaults
        if (playlists.length === 0) {
            console.warn('[MiniConnect] No playlists detected, using defaults');
            playlists.push(
                { name: 'Liked Songs', id: '/browse/FEmusic_library_landed_explore_loved', url: '/browse/FEmusic_library_landed_explore_loved' }
            );
        }

        fetch(`${serverUrl}/api/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlists: playlists })
        }).then(r => {
            console.log('[MiniConnect] ✓ Playlists sent');
        }).catch(e => {
            console.error('[MiniConnect] Failed to send playlists:', e);
        });

    } catch (error) {
        console.error('[MiniConnect] getAvailablePlaylists error:', error);
    }
}

/**
 * Play a specific playlist
 */
function playPlaylist(playlistId) {
    try {
        console.log('[MiniConnect] === PLAYLIST PLAY ATTEMPT ===');
        console.log('[MiniConnect] Received playlistId:', playlistId);
        
        if (!playlistId || typeof playlistId !== 'string') {
            console.error('[MiniConnect] ✗ Invalid playlistId');
            return;
        }
        
        let fullUrl = null;
        
        // Handle /browse/ URLs (system categories)
        if (playlistId.includes('/browse/')) {
            console.log('[MiniConnect] System playlist detected');
            fullUrl = 'https://music.youtube.com' + (playlistId.startsWith('/') ? '' : '/') + playlistId;
        }
        // Handle ?list= URLs (user playlists) 
        else if (playlistId.includes('?list=') || playlistId.includes('&list=')) {
            console.log('[MiniConnect] User playlist detected');
            // Already a full URL or needs construction
            fullUrl = playlistId.startsWith('http') ? playlistId : ('https://music.youtube.com/playlist' + playlistId);
        }
        // Handle just list= pattern
        else if (playlistId.includes('list=')) {
            console.log('[MiniConnect] Query parameter detected');
            fullUrl = 'https://music.youtube.com/playlist?' + playlistId;
        }
        else {
            console.error('[MiniConnect] ✗ Unrecognized playlist format:', playlistId);
            return;
        }
        
        console.log('[MiniConnect] Final URL:', fullUrl);
        console.log('[MiniConnect] >> Navigating to playlist...');
        
        window.location.href = fullUrl;
        
    } catch (error) {
        console.error('[MiniConnect] playPlaylist error:', error);
    }
}

/**
 * Play a specific playlist
 */

/**
 * Set volume on YouTube Music
 */
function setVolume(value) {
    try {
        const volumePercent = Math.min(Math.max(value, 0), 100);
        console.log('[MiniConnect] === VOLUME SET ATTEMPT ===');
        console.log('[MiniConnect] Target volume:', volumePercent + '%');

        // Log all possible volume elements found
        const allInputs = document.querySelectorAll('input[type="range"]');
        console.log('[MiniConnect] Found', allInputs.length, 'range inputs');
        
        allInputs.forEach((input, idx) => {
            console.log(`  [${idx}] aria-label: "${input.getAttribute('aria-label')}", value: ${input.value}, max: ${input.max}`);
        });

        // Try to find volume slider by checking attributes
        let volumeSlider = null;
        
        // Method 1: Direct volme label search
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        for (const input of rangeInputs) {
            const label = input.getAttribute('aria-label') || '';
            if (label.toLowerCase().includes('volume')) {
                volumeSlider = input;
                console.log('[MiniConnect] Found volume slider by aria-label');
                break;
            }
        }

        // Method 2: Try data attributes or container classes
        if (!volumeSlider) {
            volumeSlider = document.querySelector('[aria-label*="olume"]');
            if (volumeSlider) console.log('[MiniConnect] Found by aria-label*="olume"');
        }

        // Method 3: Look in player container
        if (!volumeSlider) {
            const playerElements = document.querySelectorAll('[role="slider"]');
            console.log('[MiniConnect] Found', playerElements.length, 'slider elements');
            for (const elem of playerElements) {
                const label = elem.getAttribute('aria-label') || '';
                if (label.toLowerCase().includes('volume')) {
                    volumeSlider = elem;
                    console.log('[MiniConnect] Found volume through [role="slider"]');
                    break;
                }
            }
        }

        // Method 4: Last resort - find any range input in player area
        if (!volumeSlider) {
            const playerArea = document.querySelector('[role="main"]');
            if (playerArea) {
                const inputs = playerArea.querySelectorAll('input[type="range"]');
                if (inputs.length > 0) {
                    // Last input is usually volume (progress is first)
                    volumeSlider = inputs[inputs.length - 1];
                    console.log('[MiniConnect] Using last range input in player area');
                }
            }
        }

        if (volumeSlider) {
            console.log('[MiniConnect] Setting volume slider value:', volumePercent);
            const oldValue = volumeSlider.value;
            
            // Set value directly
            volumeSlider.value = volumePercent;
            volumeSlider.setAttribute('value', volumePercent);
            
            // Ensure slider is active/visible
            if (volumeSlider.style) {
                volumeSlider.style.opacity = '1';
            }
            
            // Get parent for potential event bubbling 
            const parent = volumeSlider.parentElement;
            
            // Dispatch critical events multiple times
            const criticalEvents = ['input', 'change'];
            for (const eventName of criticalEvents) {
                for (let i = 0; i < 3; i++) {
                    const event = new Event(eventName, { bubbles: true, cancelable: true });
                    volumeSlider.dispatchEvent(event);
                    if (parent) parent.dispatchEvent(event);
                }
            }
            
            // Dispatch other events once
            const otherEvents = ['mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup', 'focus'];
            for (const eventName of otherEvents) {
                const event = new Event(eventName, { bubbles: true, cancelable: true });
                volumeSlider.dispatchEvent(event);
            }
            
            // Try pointer events 
            try {
                const pointerDownEvent = new PointerEvent('pointerdown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: 50,
                    clientY: 0
                });
                volumeSlider.dispatchEvent(pointerDownEvent);
                
                const pointerUpEvent = new PointerEvent('pointerup', {
                    bubbles: true,
                    cancelable: true
                });
                volumeSlider.dispatchEvent(pointerUpEvent);
            } catch (e) {
                // PointerEvent not supported
            }
            
            // Focus to ensure it's active
            volumeSlider.focus();
            
            // Verify change took effect
            setTimeout(() => {
                const newValue = volumeSlider.value;
                console.log('[MiniConnect] Volume verification: was', oldValue, 'now', newValue, '(expected', volumePercent + ')');
                if (newValue == volumePercent) {
                    console.log('[MiniConnect] ✅ Volume changed successfully!');
                } else {
                    console.warn('[MiniConnect] ⚠️ Volume may not have changed. Trying alternative method...');
                    // Try alternative: manipulate the parent container
                    if (parent && parent.style) {
                        parent.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            }, 150);
            
            console.log('[MiniConnect] === VOLUME SET COMPLETE ===');
        } else {
            console.warn('[MiniConnect] === VOLUME SLIDER NOT FOUND ===');
            console.warn('[MiniConnect] Could not locate volume control');
            console.warn('[MiniConnect] Try playing a song first to populate player controls');
        }
    } catch (error) {
        console.error('[MiniConnect] setVolume error:', error);
    }
}

/**
 * Extract current playback state from YouTube Music
 */
function getPlaybackState() {
    try {
        const state = {
            isPlaying: false,
            title: 'No song',
            artist: 'Unknown',
            volume: 50,
            progress: 0,
            duration: 0
        };

        // Check if playing - look for pause button (means music is playing)
        const pauseButton = document.querySelector('button[aria-label="Pause"]');
        state.isPlaying = pauseButton ? true : false;
        
        // Log what we're finding
        console.log('[MiniConnect] Play/Pause check:', state.isPlaying);

        // Extract title - use multiple methods
        let foundTitle = null;
        
        // Method 1: Document title parsing
        const pageTitle = document.title;
        if (pageTitle && pageTitle.includes(' - ')) {
            foundTitle = pageTitle.split(' - ')[0].trim();
        }
        
        // Method 2: Meta tags
        if (!foundTitle) {
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle && ogTitle.getAttribute('content')) {
                foundTitle = ogTitle.getAttribute('content').split(' - ')[0]?.trim();
            }
        }
        
        // Method 3: DOM search for heading
        if (!foundTitle) {
            const titleSelectors = [
                'ytmusic-player div[role="heading"]',
                '.now-playing .title',
                'h1[class*="title"]',
                '.yt-formatted-string[role="link"]'
            ];
            for (const selector of titleSelectors) {
                const elem = document.querySelector(selector);
                if (elem) {
                    const text = elem.textContent.trim();
                    if (text && text.length > 2) {
                        foundTitle = text;
                        break;
                    }
                }
            }
        }
        
        if (foundTitle && foundTitle.length > 2) {
            state.title = foundTitle.substring(0, 100);
        }

        // Extract artist
        let foundArtist = null;
        
        // Method 1: Meta tags
        const ogMusicArtist = document.querySelector('meta[property="music:musician"]');
        if (ogMusicArtist) {
            foundArtist = ogMusicArtist.getAttribute('content');
        }
        
        // Method 2: Meta description parsing
        if (!foundArtist) {
            const description = document.querySelector('meta[name="description"]');
            if (description) {
                const content = description.getAttribute('content');
                if (content && content.includes('by')) {
                    const parts = content.split('by');
                    if (parts[1]) foundArtist = parts[1].trim().substring(0, 100);
                }
            }
        }
        
        // Method 3: Look for subtitle in DOM
        if (!foundArtist) {
            const artistSelectors = [
                'ytmusic-player .subtitle.yt-formatted-string',
                '.yt-formatted-string[role="button"]',
                'a.yt-simple-endpoint[href*="browse"]'
            ];
            for (const selector of artistSelectors) {
                const elems = document.querySelectorAll(selector);
                for (const elem of elems) {
                    const text = elem.textContent.trim();
                    if (text && text.length > 1 && !text.includes(state.title)) {
                        foundArtist = text;
                        break;
                    }
                }
                if (foundArtist) break;
            }
        }
        
        if (foundArtist && foundArtist.length > 1) {
            state.artist = foundArtist.substring(0, 100);
        }
        
        console.log('[MiniConnect] Extracted - Title:', state.title, 'Artist:', state.artist);

        const volumeSlider = document.querySelector('input[aria-label*="Volume"]');
        if (volumeSlider && volumeSlider.value) {
            state.volume = parseInt(volumeSlider.value) || 50;
        }

        const progressBar = document.querySelector('[role="progressbar"]');
        if (progressBar) {
            const ariaValueNow = progressBar.getAttribute('aria-valuenow');
            const ariaValueMax = progressBar.getAttribute('aria-valuemax');
            if (ariaValueNow && ariaValueMax) {
                state.progress = parseInt(ariaValueNow) / 1000 || 0;
                state.duration = parseInt(ariaValueMax) / 1000 || 0;
            }
        }

        return state;
    } catch (error) {
        console.error('[MiniConnect] getPlaybackState error:', error);
        return lastState;
    }
}

/**
 * Wait for YouTube Music to load
 */
function waitForYouTubeMusicLoad() {
    const maxAttempts = 30;
    let attempts = 0;

    const checkIfLoaded = () => {
        attempts++;

        const musicElements = document.querySelector('[role="main"]') ||
                            document.querySelector('ytmusic-player') ||
                            document.querySelector('[aria-label*="Play"]');

        if (musicElements || attempts >= maxAttempts) {
            console.log('[MiniConnect] YouTube Music loaded, initializing...');
            setTimeout(() => {
                initializeConnection();
            }, 1000);
        } else {
            setTimeout(checkIfLoaded, 500);
        }
    };

    checkIfLoaded();
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForYouTubeMusicLoad);
} else {
    waitForYouTubeMusicLoad();
}

window.addEventListener('load', () => {
    console.log('[MiniConnect] Page load detected');
    
    // Only fetch playlists on first load, not on every navigation
    if (!playlistsDetected) {
        setTimeout(() => {
            console.log('[MiniConnect] Auto-fetching playlists (first load)...');
            getAvailablePlaylists();
        }, 2000);
    } else {
        console.log('[MiniConnect] Playlists already detected, skipping re-detection');
    }
});


