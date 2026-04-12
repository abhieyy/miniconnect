# MiniConnect - Spotify Connect Clone for YouTube Music

Control YouTube Music playback on your laptop from your mobile phone in real-time, just like Spotify Connect.

## Features

✅ **Real-time Control**
- Play/Pause toggle
- Next/Previous track navigation
- Volume control with slider
- Progress bar with current time display

✅ **Live Updates**
- Song title and artist display
- Playback status indicator
- Auto-reconnect on connection loss
- Real-time state synchronization

✅ **Production Ready**
- Responsive mobile UI with dark theme
- Chrome Extension with Manifest V3
- Robust DOM selectors with fallbacks
- Error handling and logging
- WebSocket communication via Socket.IO

## Architecture

```
MiniConnect
├── server/                 # Node.js backend
│   ├── server.js          # Express + Socket.IO server
│   └── package.json       # Dependencies
├── mobile/                 # Mobile web app
│   ├── index.html         # UI markup
│   ├── style.css          # Responsive styling
│   └── app.js             # Socket.IO client logic
└── extension/              # Chrome extension
    ├── manifest.json      # Manifest V3 config
    ├── content.js         # YouTube Music integration
    ├── service-worker.js  # Background service worker
    └── popup.html         # Extension settings
```

## Installation

### 1. Backend Setup

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3000` by default. For network access, note your laptop's IP address (e.g., `192.168.1.100`).

### 2. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Navigate to the `extension/` folder and select it
5. The MiniConnect icon will appear in your toolbar

### 3. Mobile App Setup

1. Open any browser on your phone
2. Navigate to: `http://<YOUR_LAPTOP_IP>:3000`
3. Enter your laptop's IP and port (or `localhost:3000` if on same machine)
4. Click **Connect**
5. Open YouTube Music on your laptop (extension will auto-connect)

## Usage

### On Laptop:
1. Open **YouTube Music** in Chrome
2. Click the **MiniConnect** extension icon
3. Configure your server address if needed
4. Keep the tab open

### On Mobile Phone:
1. Open the mobile app in your browser
2. Enter your laptop's IP:port
3. Connect
4. Control playback with buttons and volume slider
5. See live song info and playback status

## Configuration

### Change Server Address (Extension)
- Click the MiniConnect icon in Chrome
- Enter your server IP:port
- Click "Save & Test"

### Change Server Address (Mobile)
- Disconnect from current server
- Enter new server address
- Click "Connect"

### Custom Server Port

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

Then restart the server:
```bash
npm start
```

## Supported YouTube Music Elements

The extension intelligently finds and interacts with YouTube Music controls:

- **Play/Pause Button**: Multiple selector fallbacks
- **Next/Previous Buttons**: Full button navigation
- **Volume Slider**: Percentage-based control
- **Song Info**: Title and artist extraction
- **Progress Bar**: Real-time tracking with duration

The extension uses robust CSS selectors and DOM attribute matching to handle YouTube Music layout changes gracefully.

## Network Requirements

- **Same WiFi network** (for local IP access) OR
- **Same device** (localhost)
- Port 3000 (or custom configured port) must be accessible
- WebSocket connections must be allowed

## Troubleshooting

### Extension Not Connecting
1. Check server is running: `npm start`
2. Verify YouTube Music is open
3. Check Chrome console for errors (DevTools > Console)
4. Ensure firewall allows port 3000

### Mobile App Won't Connect
1. Enter correct laptop IP (not localhost if on different devices)
2. Include port number (e.g., `192.168.1.100:3000`)
3. Ensure both devices are on same network
4. Check server logs for errors

### Controls Not Working
1. Refresh YouTube Music page
2. Check if video is actually playing
3. Verify extension is installed and enabled
4. Check Chrome DevTools console for errors

### Volume Not Changing
1. Ensure YouTube Music has focus
2. Try adjusting volume manually first
3. Check if YouTube Music volume is already at 0% or 100%

## Performance Notes

- **State polling interval**: 1 second (adjustable in content.js)
- **Volume update debounce**: 100ms
- **Reconnect attempts**: 10 (infinite for mobile)
- **Socket.IO transports**: WebSocket first, polling fallback

## Browser Compatibility

- **Mobile**: Chrome, Firefox, Safari, Edge (any modern browser)
- **Extension**: Chrome/Edge only (Manifest V3)
- **Server**: Node.js 12+

## Development

### Enable Debug Logging
All console logs are prefixed with `[MiniConnect]` for easy filtering.

In Chrome DevTools:
```javascript
// Filter console by '[MiniConnect]'
```

### Modify UI Theme
Edit `mobile/style.css` - all colors use CSS variables and gradients.

### Add New Commands
1. Add event in `mobile/app.js`
2. Add Socket.IO listener in `server/server.js`
3. Add handler in `extension/content.js`
4. Emit state update from extension

## Production Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server/server.js --name miniconnect
pm2 startup
pm2 save
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/ .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t miniconnect .
docker run -p 3000:3000 miniconnect
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name music-remote.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Considerations

⚠️ **Note**: This is designed for local network use only.

- **No authentication** - suitable for home/office networks only
- **No encryption** - use HTTPS/WSS for public deployment
- **Open CORS** - restricted to authorized devices in production

For production:
1. Add authentication tokens
2. Use SSL/TLS certificates
3. Restrict CORS to known origins
4. Add rate limiting
5. Implement proper error handling

## Troubleshooting in Production

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### WebSocket Connection Issues
- Check firewall settings
- Verify port forwarding if behind NAT
- Enable both WebSocket and polling transports

### YouTube Music Layout Changes
- Extension uses multiple selector fallbacks
- If buttons change, add new selectors to `extension/content.js`
- Test with `getPlaybackState()` function

## License

MIT License - Feel free to use, modify, and distribute.

## Future Enhancements

- [ ] Song queue display
- [ ] Playlist selection
- [ ] Search and play
- [ ] Multiple device support
- [ ] Playback history
- [ ] Lyrics sync
- [ ] Dark/Light mode toggle
- [ ] Spotify Connect comparison

## Support

For issues and questions, check:
1. Console logs (browser DevTools)
2. Server logs (terminal output)
3. Network tab (check WebSocket connections)
4. Extension manifest and permissions

Enjoy your music!
