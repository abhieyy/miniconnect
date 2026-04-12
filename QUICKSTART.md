# QUICK START GUIDE

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

Or manually:
```bash
cd server
npm install
cd ..
```

### Step 2: Start Server (1 min)

```bash
cd server
npm start
```

You should see:
```
[timestamp] MiniConnect Server running on http://0.0.0.0:3000
[timestamp] Server initialized - waiting for connections
```

### Step 3: Load Chrome Extension (1 min)

1. Open `chrome://extensions/`
2. Turn ON "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. You should see MiniConnect with green icon

### Step 4: Open YouTube Music (1 min)

1. Go to https://music.youtube.com in Chrome
2. Click the MiniConnect extension icon
3. If no errors, you're connected!

## Using MiniConnect

### On Your Phone

1. Open any browser
2. Go to `http://YOUR_LAPTOP_IP:3000`
   - Find your laptop IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3000`
3. Click "Connect"
4. Start controlling YouTube Music!

### Controls

- **Play/Pause**: Center button
- **Next/Previous**: Left/Right arrows
- **Volume**: Slider at bottom
- **Info**: Song title and artist update in real-time

## Troubleshooting

**"Can't connect to server"**
- Is server running? (Check terminal where you ran `npm start`)
- Is port 3000 open? (Check firewall)
- Is IP address correct? (Should be laptop's internal IP, not 127.0.0.1)

**"Controls not working"**
- Is YouTube Music playing?
- Refresh the page
- Check Chrome DevTools console (F12)

**"No song information showing"**
- YouTube Music might not have loaded completely
- Try skipping to next track
- Refresh the tab

## File Structure

```
miniconnect/
├── server/                 # Backend
│   ├── server.js          # Main server file
│   └── package.json       # Dependencies
├── mobile/                 # Phone web app
│   ├── index.html         # UI
│   ├── style.css          # Styling
│   └── app.js             # Client logic
├── extension/              # Chrome extension
│   ├── manifest.json      # Extension config
│   ├── content.js         # YouTube integration
│   ├── service-worker.js  # Background tasks
│   └── popup.html         # Settings
├── README.md              # Full documentation
├── QUICKSTART.md          # This file
├── setup.sh               # Linux/Mac setup
└── setup.bat              # Windows setup
```

## How It Works

1. **Server** (Node.js) - Relays messages between phone and extension
2. **Extension** (Chrome) - Controls YouTube Music and sends updates
3. **Mobile App** (Browser) - Shows UI and sends commands

### Message Flow

```
Phone App
   ↓ (click play)
Server
   ↓ (send command)
Extension (YouTube Music)
   ↓ (play starts)
Server (receives update)
   ↓ (new state)
Phone App (displays playing)
```

## Advanced Usage

### Change Server Port

Edit `server/server.js`, line containing `const PORT = ...`:

```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

Then restart server.

### Run on Startup (Windows)

Create a batch file in Windows Startup folder:
```batch
@echo off
cd X:\CODE\miniconnect\server
npm start
```

### Run on Startup (macOS)

Create file `~/Library/LaunchAgents/miniconnect.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.miniconnect.server</string>
    <key>Program</key>
    <string>/usr/local/bin/npm</string>
    <key>ProgramArguments</key>
    <array>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/miniconnect/server</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Then run: `launchctl load ~/Library/LaunchAgents/miniconnect.plist`

## Tips

1. **Same WiFi**: Phone and laptop must be on same network
2. **YouTube Music First**: Open YouTube Music before connecting phone
3. **Keep Tab Open**: Don't close the YouTube Music tab
4. **Auto-Reconnect**: Phone automatically reconnects if connection drops
5. **Multiple Phones**: Multiple phones can control the same laptop

## Support

- Check console logs (F12 in browser, terminal for server)
- Extension icon shows connection status (green = connected)
- Mobile app shows connection status at top

## Next

Read the full [README.md](README.md) for:
- Detailed architecture
- Production deployment
- Security considerations
- Troubleshooting guide
- Advanced features
