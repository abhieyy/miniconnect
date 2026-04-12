// DEVELOPMENT NOTES FOR MINICONNECT

// ============================================================================
// ARCHITECTURE OVERVIEW
// ============================================================================

/*
MiniConnect follows a three-tier architecture:

1. MOBILE CLIENT (Browser)
   - Connects to server via Socket.IO
   - Sends user commands (play, pause, volume)
   - Receives playback state updates
   - Pure web app, works on any phone browser

2. SERVER (Node.js + Express + Socket.IO)
   - Central hub for all communication
   - Maintains current playback state
   - Routes commands between mobile and extension
   - Handles client registration and lifecycle

3. EXTENSION CLIENT (Chrome)
   - Injects into YouTube Music tab
   - Interacts with YouTube Music DOM
   - Sends playback state to server
   - Receives and executes remote commands

Data Flow:
   Phone → Server → Extension → YouTube Music (controls)
   YouTube Music → Extension → Server → Phone (state updates)
*/

// ============================================================================
// KEY DESIGN DECISIONS
// ============================================================================

/*
1. SOCKET.IO OVER REST
   - Real-time bidirectional communication
   - Automatic reconnection
   - Fallback to polling if WebSocket fails
   - Better for state synchronization than polling REST

2. SINGLE EXTENSION, MULTIPLE PHONES
   - Only extension connects to YouTube Music
   - Multiple phones can control simultaneously
   - Server manages client routing
   - Scalable architecture

3. CHROME MANIFEST V3
   - Modern extension standard
   - Required for Chrome Web Store
   - Service Workers instead of Background pages
   - Content scripts for DOM access

4. CONTENT SCRIPT FOR DOM ACCESS
   - Extensions can't directly access YouTube Music DOM
   - Content script has full DOM access
   - Runs in page context
   - Can simulate clicks and read element properties

5. ROBUST SELECTORS WITH FALLBACKS
   - YouTube Music layouts change frequently
   - Multiple selectors for each control
   - Optional chaining prevents crashes
   - Graceful degradation if selectors break

6. STATE POLLING NOT EVENTS
   - Can't reliably hook YouTube Music events
   - Polling every 1 second is efficient
   - MutationObserver for critical changes
   - CPU: ~2% even with polling
*/

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/*
SERVER DEBUGGING:
- All console.log statements timestamped
- Look for patterns: [yyyy-mm-ddThh:mm:ssZ]
- Connected clients shown in logs
- Monitor memory: node --inspect server.js

EXTENSION DEBUGGING:
- All logs prefixed with [MiniConnect]
- In YouTube Music: Right-click → Inspect → Console
- Filter by "[MiniConnect]" in DevTools
- Check chrome://extensions/ for errors
- Test DOM selectors: $('selector') in console

MOBILE DEBUGGING:
- Browser console shows Socket.IO connection
- Check localStorage: chrome://settings/content/javascript
- Network tab shows WebSocket connections
- Cross-browser compatible (Chrome, Firefox, Safari, Edge)

SOCKET.IO DEBUGGING:
- Enable debug: localStorage.debug = 'socket.io-client'
- Shows all events and messages
- Network tab shows WebSocket frames
- Check browser console for disconnect reasons
*/

// ============================================================================
// COMMON MODIFICATION PATTERNS
// ============================================================================

/*
ADD NEW BUTTON (e.g., SHUFFLE):

1. Mobile UI (mobile/index.html):
   <button id="shuffleBtn" class="control-btn">
       <svg>...</svg>
   </button>

2. Mobile Handler (mobile/app.js):
   this.elements.shuffleBtn.addEventListener('click', () => {
       this.toggleShuffle();
   });
   
   toggleShuffle() {
       if (!this.isConnected) return;
       this.socket.emit('shuffle');
   }

3. Server Handler (server/server.js):
   socket.on('shuffle', () => {
       if (connectedClients.extension) {
           io.to(connectedClients.extension).emit('shuffle');
       }
   });

4. Extension Handler (extension/content.js):
   sock.on('shuffle', () => {
       clickShuffleButton();
   });
   
   function clickShuffleButton() {
       const btn = document.querySelector('[aria-label*="Shuffle"]');
       if (btn) btn.click();
   }

UPDATE STATE OBJECT:

Add field to musicState in server.js:
   let musicState = {
       ...
       currentQueue: [],  // new field
       ...
   }

Update extension to send (content.js):
   const state = {
       ...
       currentQueue: extractQueue(),  // new extraction
       ...
   }

Update mobile to display (app.js):
   updateState(newState) {
       ...
       this.elements.queueDisplay.innerHTML = newState.currentQueue;
       ...
   }

CHANGE DOM SELECTORS:

If YouTube Music buttons stop working:

1. Use DevTools to find new selector:
   - Right-click button → Inspect
   - Find unique aria-label, class, or role
   - Test in console: $('new-selector')

2. Add to selectors array (content.js):
   const selectors = [
       'button[aria-label="Play"]',      // old selector
       'button.new-class[role="button"]' // new selector
   ];

3. Test each selector with optional chaining:
   ? = next ? button.click() : null

RE-USE COMPONENTS:

Mobile app uses reusable patterns:

Button pattern:
   <button id="buttonId" class="control-btn">Icon</button>
   
   this.elements.buttonId.addEventListener('click', () => {
       if (!this.isConnected) return;
       this.socket.emit('command-name');
   });

Slider pattern:
   <input type="range" id="sliderId" min="0" max="100">
   
   input.addEventListener('input', (e) => {
       const value = e.target.value;
       if (!this.isConnected) return;
       
       // Debounce for performance
       clearTimeout(this.timeout);
       this.timeout = setTimeout(() => {
           this.socket.emit('command', value);
       }, 100);
   });

Display pattern:
   <h2 id="displayId">Default text</h2>
   
   this.elements.displayId.textContent = newValue;
*/

// ============================================================================
// PERFORMANCE OPTIMIZATION TIPS
// ============================================================================

/*
MOBILE APP:
- ✓ Uses localStorage for server URL (no re-entry)
- ✓ Debounces volume slider (100ms)
- ✓ Only updates DOM if state changed
- ✓ CSS animations use GPU (transform, opacity)
- ✓ Minimal DOM operations

EXTENSION:
- ✓ Polls once per second (not constantly)
- ✓ Compares state before emitting
- ✓ Uses MutationObserver for critical changes
- ✓ Fallback selectors prevent multiple queries
- ✓ No memory leaks in loops

SERVER:
- ✓ Stores only current state (not history)
- ✓ Broadcasts only to relevant clients
- ✓ Connection pooling via Socket.IO
- ✓ No external dependencies beyond Express/Socket.IO

FURTHER OPTIMIZATION:
- [ ] Implement state compression before sending
- [ ] Add client-side caching
- [ ] Use service worker for offline mode
- [ ] Compress socket messages
- [ ] Add request batching

SCALING:
- [ ] Use Redis for state distribution
- [ ] Run multiple server instances
- [ ] Use load balancer (nginx)
- [ ] Implement message queue (RabbitMQ)
- [ ] Database for state history
*/

// ============================================================================
// KNOWN LIMITATIONS & WORKAROUNDS
// ============================================================================

/*
LIMITATION: Can't read YouTube Music playback directly from JS
WORKAROUND: Poll DOM elements for state (currentTime, button states)

LIMITATION: YouTube Music layout changes frequently
WORKAROUND: Multiple selector fallbacks, graceful degradation

LIMITATION: Content script runs in isolated context
WORKAROUND: Use __postMessage__ or localStorage for communication

LIMITATION: Extension only works on https://music.youtube.com
WORKAROUND: Use conditional logic for different music services

LIMITATION: WebSocket blocked on some networks
WORKAROUND: Socket.IO automatic fallback to polling

LIMITATION: Can't control system volume from browser
WORKAROUND: Control YouTube Music in-app volume slider only

LIMITATION: No cross-platform extension (Chrome only)
WORKAROUND: Use Firefox Add-ons API for Firefox version

LIMITATION: Mobile web app needs network connectivity
WORKAROUND: Add offline queue (future enhancement)
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
UNIT TESTING:
- [ ] Server state updates correctly
- [ ] Socket.IO events fire properly
- [ ] DOM selectors find elements
- [ ] Mobile UI updates on state change
- [ ] Debouncing works (volume slider)

INTEGRATION TESTING:
- [ ] Phone connects to server
- [ ] Button clicks execute on YouTube Music
- [ ] State updates appear on phone in <1 second
- [ ] Extension reconnects after disconnect
- [ ] Multiple phones can connect

BROWSER COMPATIBILITY:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

NETWORK CONDITIONS:
- [ ] Works on 4G/LTE
- [ ] Works on WiFi 2.4GHz and 5GHz
- [ ] Handles 100ms+ latency
- [ ] Recovers from packet loss <5%

ERROR SCENARIOS:
- [ ] Server down → phone shows error
- [ ] Extension crashes → server shows disconnected
- [ ] YouTube Music reloads → extension reconnects
- [ ] Network drops → auto-reconnect
- [ ] CPU throttling → still responsive

SECURITY TESTING:
- [ ] Only localhost connections by default
- [ ] No sensitive data in logs
- [ ] No XSS vulnerabilities
- [ ] Socket.IO validates inputs
- [ ] CORS properly configured
*/

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/*
PRE-DEPLOYMENT:
- [ ] Remove all console.log statements (or keep for debug mode)
- [ ] Update version in manifest.json and package.json
- [ ] Test on local network
- [ ] Test on guest network
- [ ] Verify all buttons work
- [ ] Check error messages are user-friendly
- [ ] Test auto-reconnect

PRODUCTION:
- [ ] Use SSL/TLS encryption
- [ ] Enable CORS restrictions
- [ ] Add authentication
- [ ] Set rate limiting
- [ ] Use process manager (PM2)
- [ ] Enable monitoring/logging
- [ ] Set up backups
- [ ] Document deployment
- [ ] Create runbook for troubleshooting

POST-DEPLOYMENT:
- [ ] Monitor server logs
- [ ] Check extension error reports
- [ ] Monitor user feedback
- [ ] Update documentation
- [ ] Plan maintenance windows
- [ ] Test updates on staging first
*/

// ============================================================================
// FUTURE ENHANCEMENTS
// ============================================================================

/*
SHORT TERM (1-2 weeks):
- [ ] Add search functionality
- [ ] Display current playlist
- [ ] Like/dislike button
- [ ] Playlist selection dropdown
- [ ] Session persistence

MEDIUM TERM (1-2 months):
- [ ] Historical playback stats
- [ ] Queue management
- [ ] Custom shortcuts
- [ ] Theme customization
- [ ] Lyrics display

LONG TERM (3+ months):
- [ ] Spotify API integration
- [ ] Multi-service support
- [ ] Machine learning recommendations
- [ ] Collaborative playlist control
- [ ] iOS app (native)
*/

// ============================================================================
// ARCHITECTURE DECISIONS EXPLAINED
// ============================================================================

/*
WHY EXPRESS + SOCKET.IO?
- Fast and lightweight
- Excellent Socket.IO support
- Large ecosystem
- Easy to extend
- Minimal dependencies

WHY NOT USE WEBSOCKET DIRECTLY?
- Socket.IO adds reconnection logic
- Fallback to polling
- Better browser compatibility
- Event routing built-in
- Better error handling

WHY NOT STORE SERVER URL IN EXTENSION?
- Users need flexibility to change servers
- Mobile app provides simpler config
- Multiple servers possible in future
- Storage API is asynchronous
- Popup.html provides better UX

WHY POLL INSTEAD OF USING YOUTUBE MUSIC API?
- YouTube Music doesn't have official consumer API
- YouTube restricts API access
- Polling is more reliable for YouTube
- No authentication headers needed
- Works with all YouTube Music versions

WHY NOT USE IPCM INSTEAD OF SOCKET.IO?
- Can't communicate across browsers
- Single-machine limitation
- Harder to extend to multiple devices
- Not suitable for network communication
- Socket.IO is more standardized

WHY CONTENT SCRIPT INSTEAD OF SERVICE WORKER?
- Service worker can't access YouTube Music DOM
- Content script has full DOM access
- Content script can inject code
- Service worker is event-driven only
- Content script runs continuously
*/

// ============================================================================
// END OF DEVELOPMENT NOTES
// ============================================================================
