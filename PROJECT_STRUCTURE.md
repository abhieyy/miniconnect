# MiniConnect - Project Structure

```
miniconnect/
│
├── 📁 server/                          # Backend Server
│   ├── 📄 server.js                   # Express + Socket.IO server (MAIN)
│   ├── 📄 package.json                # Node dependencies
│   └── 📝 node_modules/               # (created after npm install)
│
├── 📁 mobile/                          # Mobile Web Application  
│   ├── 📄 index.html                  # UI Markup (responsive design)
│   ├── 📄 style.css                   # Styling (dark theme, animations)
│   ├── 📄 app.js                      # Socket.IO client (MAIN)
│   └── [Served from http://YOUR_IP:3000]
│
├── 📁 extension/                       # Chrome Extension (Manifest V3)
│   ├── 📄 manifest.json               # Extension configuration
│   ├── 📄 content.js                  # YouTube Music integration (MAIN)
│   ├── 📄 service-worker.js           # Background service worker
│   ├── 📄 popup.html                  # Extension settings/popup
│   └── [Load unpacked in chrome://extensions/]
│
├── 📄 README.md                        # Complete documentation
├── 📄 QUICKSTART.md                    # 5-minute setup guide
├── 📄 PROJECT_STRUCTURE.md             # This file
├── 📄 setup.sh                         # Linux/macOS setup script
├── 📄 setup.bat                        # Windows setup script
└── 📄 .gitignore                       # Git ignore file

```

## Key Files Explained

### Backend (server.js)

**Purpose**: Central hub for all communication

**Key Functions**:
- `io.on('connection')` - Handles client connections
- `socket.on('play-pause')` - Receives commands from phone
- `socket.emit('state-update')` - Sends updates to phone
- `io.to(clientId).emit()` - Routes commands to extension

**State Management**:
```javascript
let musicState = {
    isPlaying: boolean,
    title: string,
    artist: string,
    volume: 0-100,
    progress: seconds,
    duration: seconds
}
```

**Clients**:
- 1 Extension (sends/receives commands)
- N Controllers (mobile phones)

### Mobile App (app.js)

**Purpose**: Provides UI and controls

**Key Classes**:
- `MiniConnectController` - Main app class
- `connect()` - Establish Socket.IO connection
- `togglePlayPause()` - Send command to server
- `updateState()` - Update UI from state updates

**Events Emitted**:
- `play-pause`
- `next`
- `prev`
- `volume`

**Events Listened**:
- `state-update` - Receive new state

### Chrome Extension

**manifest.json** - Configuration
- Permissions and host permissions
- Service worker entry point
- Content script configuration

**content.js** - YouTube Music Control
- Runs on https://music.youtube.com/*
- Finds and clicks YouTube Music buttons
- Extracts song info
- Sends state to server

**service-worker.js** - Background Task
- Handles extension lifecycle
- Manages storage (server URL)
- Communicates with popup

**popup.html** - User Settings
- Configure server address
- Display status

## Data Flow

### Play Button Pressed (Phone → Server → Extension → YouTube)

```
User clicks Play on Phone
    ↓
app.js: togglePlayPause()
    ↓
socket.emit('play-pause')
    ↓
Server receives event
    ↓
server.js: socket.on('play-pause')
    ↓
io.to(extension_id).emit('play-pause')
    ↓
Extension receives command
    ↓
content.js: togglePlayPause()
    ↓
Find play/pause button in YouTube Music
    ↓
button.click()
    ↓
YouTube Music UI updates
    ↓
Music plays/pauses
```

### State Update (YouTube → Extension → Server → Phone)

```
YouTube Music state changes (song, volume, progress)
    ↓
DOM observer in content.js detects change
    ↓
getPlaybackState() extracts current state
    ↓
socket.emit('state-update', newState)
    ↓
Server receives update
    ↓
server.js: socket.on('state-update')
    ↓
Updates global musicState
    ↓
io.to(all_controllers).emit('state-update', state)
    ↓
Mobile app receives update
    ↓
app.js: socket.on('state-update')
    ↓
updateState() updates UI
    ↓
Phone display shows new info
```

## Component Interactions

### 1. Initialization

```
Extension loads → 
  Waits for YouTube Music →
  Connects to server →
  Registers as 'extension' →
  Starts polling for state changes

Phone opens → 
  Loads mobile app →
  User clicks Connect →
  Socket.IO connects to server →
  Registers as 'controller' →
  Requests current state
```

### 2. Normal Operation

```
Server maintains state:
  - Last known state
  - Connected clients list
  
Extension:
  - Polls YouTube Music every 1 second
  - Sends updates if state changed
  - Listens for commands (play, next, volume)
  - Executes commands on YouTube
  
Phone:
  - Sends commands on button click
  - Receives state updates
  - Updates UI in real-time
```

### 3. Disconnection Handling

```
Extension disconnects:
  - Server nullifies extension reference
  - Phone can still send commands (queued)
  - Shows "disconnected" UI
  
Phone disconnects:
  - Server removes from controller list
  - Extension still works (other phones can connect)
  
Automatic reconnect:
  - Both use Socket.IO reconnection config
  - Extension: infinite retries
  - Phone: 10 retry attempts
```

## Configuration Points

### Server (server.js)

- **Port**: Line 60 - Change `3000`
- **CORS**: Line 11 - Allow more origins
- **State Update Frequency**: Line 232 - Polling interval in content.js

### Mobile (app.js)

- **Server Input**: Configurable in UI
- **Storage**: Auto-saves server URL to localStorage
- **Volume Debounce**: Line 168 - Change `100`ms

### Extension (content.js)

- **State Polling**: Line 281 - Change `1000`ms interval
- **DOM Selectors**: Lines 91-115 - Update if YouTube changes
- **Button Fallbacks**: Multiple selectors for resilience

## Extending the System

### Add New Command

1. **Mobile (app.js)**:
   ```javascript
   button.addEventListener('click', () => {
       this.socket.emit('my-command', data);
   });
   ```

2. **Server (server.js)**:
   ```javascript
   socket.on('my-command', (data) => {
       io.to(connectedClients.extension).emit('my-command', data);
   });
   ```

3. **Extension (content.js)**:
   ```javascript
   sock.on('my-command', (data) => {
       // Execute command on YouTube Music
   });
   ```

### Add New State Field

1. **Extension (content.js)**: Add to `getPlaybackState()`
2. **Server (server.js)**: Add to `musicState` object
3. **Mobile (app.js)**: Update in `updateState()`

## Testing

### Test Server Connection
```bash
# Terminal 1
cd server
npm start

# Terminal 2
# Check connection
curl http://localhost:3000/api/state
```

### Test Extension
1. Open YouTube Music
2. Check Chrome DevTools Console (F12)
3. Look for `[MiniConnect]` prefixed logs

### Test Mobile Connection
1. Open browser on phone
2. Visit laptop IP:3000
3. Check browser console for Socket.IO logs

## Performance Considerations

- **Memory**: Minimal (stores only current state)
- **CPU**: Low (polling 1x/second)
- **Network**: ~1KB per state update
- **Latency**: <100ms in same network

## Security Notes

⚠️ **Local network only** - No authentication implemented

For public deployment:
- Add JWT authentication
- Use HTTPS/WSS
- Implement rate limiting
- Add CORS whitelist

## Deployment

### Production Checklist

- [ ] Change default port (not 3000)
- [ ] Set up SSL/TLS certificates
- [ ] Enable authentication
- [ ] Restrict CORS origins
- [ ] Set up logging/monitoring
- [ ] Use process manager (PM2)
- [ ] Configure auto-restart
- [ ] Set up backups
