# Installation & Verification Checklist

## Pre-Installation Requirements

- [ ] Node.js 12+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Chrome/Chromium browser installed
- [ ] YouTube Music accessible (music.youtube.com)
- [ ] Port 3000 available (or configured alternative)
- [ ] Admin access to install Chrome extension

## Installation Steps

### 1. Backend Setup

```bash
# Navigate to server directory
cd x:\CODE\miniconnect\server

# Install dependencies
npm install

# Verify installation
npm list
```

**Expected output:**
```
├── express@4.18.2
├── socket.io@4.5.4
└── cors@2.8.5
```

- [ ] Dependencies installed
- [ ] No errors in npm install
- [ ] node_modules folder created

### 2. Start Server

```bash
# From server directory
npm start
```

**Expected output:**
```
[2026-04-11T...] MiniConnect Server running on http://0.0.0.0:3000
[2026-04-11T...] Server initialized - waiting for connections
```

- [ ] Server starts without errors
- [ ] Port 3000 shows "listening"
- [ ] No EADDRINUSE errors

**To stop server:** Press `Ctrl+C`

### 3. Chrome Extension Installation

**Steps:**
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" (top-right)
4. Click "Load unpacked"
5. Select folder: `x:\CODE\miniconnect\extension`

**Expected result:**
- [ ] MiniConnect extension appears in list
- [ ] Shows green icon
- [ ] No "Manifest Error"
- [ ] Extension enabled (toggle is ON)

### 4. Mobile App Setup

**Open browser and test:**
1. Same machine: `http://localhost:3000`
2. Different machine: `http://YOUR_LAPTOP_IP:3000`

**Expected result:**
- [ ] HTML page loads
- [ ] "MiniConnect" title appears
- [ ] "Connecting..." status shows
- [ ] Server input field visible
- [ ] Connect button responsive

## Connection Verification

### Verify Server is Running

```bash
# From another terminal
curl http://localhost:3000/api/state
```

**Expected response:**
```json
{
  "isPlaying": false,
  "title": "No song playing",
  "artist": "Unknown artist",
  "volume": 50,
  "progress": 0,
  "duration": 0
}
```

- [ ] Returns JSON state
- [ ] All fields present
- [ ] HTTP 200 status

### Verify Extension Connection

1. Open YouTube Music: https://music.youtube.com
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Look for messages starting with `[MiniConnect]`

**Expected logs:**
```
[MiniConnect] Content script loaded
[MiniConnect] Connecting to: ws://localhost:3000
[MiniConnect] Connected to server
[MiniConnect] State polling started
```

- [ ] Content script loaded
- [ ] Connection attempt visible
- [ ] No error messages
- [ ] Polling messages appear

### Verify Mobile Connection

1. Navigate to `http://localhost:3000` on phone
2. Enter server address: `localhost:3000`
3. Click "Connect" button
4. Check browser console (F12)

**Expected behavior:**
- [ ] Status changes to "Connected"
- [ ] Status dot turns green
- [ ] Config section hides
- [ ] "Now Playing" section shows
- [ ] No connection errors

## End-to-End Test

### Test Play/Pause

1. **Laptop**: Open YouTube Music, play any song
2. **Phone**: Watch for song title and artist
3. **Phone**: Click play/pause button
4. **Laptop**: Music should pause
5. **Repeat**: Music should resume

- [ ] Title appears on phone
- [ ] Artist appears on phone
- [ ] Play button worked
- [ ] Pause button worked
- [ ] State updated in real-time

### Test Next/Previous

1. **Laptop**: Have queue with multiple songs
2. **Phone**: Click "Next" button
3. **Laptop**: Song should skip
4. **Phone**: New song title appears
5. **Phone**: Click "Previous" button
6. **Laptop**: Previous song plays

- [ ] Next button worked
- [ ] Song changed on laptop
- [ ] Mobile updated title
- [ ] Previous button worked

### Test Volume Control

1. **Phone**: Adjust volume slider to 25%
2. **Laptop**: YouTube Music volume changes
3. **Laptop**: Manually change volume to 75%
4. **Phone**: Slider updates to 75%

- [ ] Volume changed on click
- [ ] Updates synchronized
- [ ] Percentage displayed
- [ ] No lag in response

### Test Reconnection

1. **Stop server**: Press Ctrl+C in terminal
2. **Phone**: Should show "Connecting..."
3. **Restart server**: `npm start` again
4. **Phone**: Should auto-reconnect
5. **Controls**: Should work again

- [ ] Connection lost detected
- [ ] Auto-reconnect triggered
- [ ] Connection restored
- [ ] Status updated
- [ ] Controls functional

## Troubleshooting Verification

### Issue: Port Already in Use

**Command:**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

**Fix:**
```bash
# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>

# Or use different port in server.js
```

- [ ] Process killed if needed
- [ ] Port now available
- [ ] Server can start

### Issue: Extension Not Loading

**Checks:**
- [ ] manifest.json syntax valid (paste in JSON validator)
- [ ] File paths in manifest exist
- [ ] Developer mode is ON
- [ ] Extension shows in list
- [ ] No red error messages

**Fix if needed:**
```
chrome://extensions/
→ Remove extension
→ Reload folder
```

### Issue: Controls Not Working

**Checks on Laptop:**
1. YouTube Music is playing
2. Browser tab is in focus
3. Refresh tab (F5)
4. Check Console for `[MiniConnect]` errors

**Checks on Phone:**
1. Status shows "Connected"
2. Server IP is correct
3. Same network as laptop
4. Try again with F5 refresh

- [ ] YouTube Music is responsive
- [ ] Extension logs show updates
- [ ] No DOM selector errors

## Performance Verification

### Check Memory Usage

**Server:**
```bash
# MacOS/Linux
ps aux | grep node

# Windows (PowerShell)
Get-Process node | Select-Object WorkingSet
```

Expected: 15-30MB

- [ ] Memory is reasonable
- [ ] No memory leak growth

### Check Network Traffic

**DevTools Network Tab:**
1. Open phone browser DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Observe messages sent/received

Expected: <1-2KB per second

- [ ] WebSocket connected
- [ ] Regular messages flowing
- [ ] No excessive traffic

### Check CPU Usage

**Activity Monitor (Mac):**
- Open Activity Monitor
- Search for "node"
- CPU% should be: <2% idle

**Task Manager (Windows):**
- Press Ctrl+Shift+Esc
- Look for Node.js process
- CPU% should be: <2% idle

- [ ] CPU usage minimal
- [ ] No sustained spikes
- [ ] System responsive

## Security Verification

- [ ] Extension only runs on music.youtube.com
- [ ] No sensitive data in console logs
- [ ] Only localhost/local IP connects
- [ ] CORS allows limited origins
- [ ] Input validation in place
- [ ] No eval() or innerHTML(unsanitized)
- [ ] No hardcoded credentials

## Browser Compatibility Check

Test on:
- [ ] Chrome 90+
- [ ] Firefox 88+ (mobile app only)
- [ ] Safari 14+ (mobile app only)
- [ ] Edge 90+ (with extension)

## Final Verification Checklist

### Basic Functionality
- [ ] Server runs without errors
- [ ] Extension loads and connects
- [ ] Mobile app loads and connects
- [ ] Play/Pause works
- [ ] Next/Previous works
- [ ] Volume slider works
- [ ] State updates visible

### Real-time Updates
- [ ] Song title updates within 1 second
- [ ] Artist name shows correctly
- [ ] Playback status changes instantly
- [ ] Volume changes synchronized
- [ ] Progress bar updates

### Connection Resilience
- [ ] Auto-reconnect on disconnect
- [ ] Multiple phones can connect
- [ ] Extension reconnects after error
- [ ] No data loss during reconnect
- [ ] Graceful error handling

### UI/UX
- [ ] Mobile UI responsive on all sizes
- [ ] Dark theme displays correctly
- [ ] Buttons responsive and clickable
- [ ] Animations smooth
- [ ] Status indicator updates

### Performance
- [ ] No noticeable lag (<100ms)
- [ ] CPU usage minimal (<3%)
- [ ] Memory stable (<50MB)
- [ ] Network efficient (<2KB/s)
- [ ] Battery drain minimal (phone)

## Production Readiness Checklist

- [ ] All tests pass
- [ ] Error messages clear
- [ ] Logging working
- [ ] Documentation complete
- [ ] No console errors
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Browser compatible
- [ ] Source code clean
- [ ] Ready to deploy

## Sign-Off

**Date Verified:** ___________  
**Verified By:** ___________  
**Environment:** ___________  
**Status:** ✅ READY FOR PRODUCTION

---

## Quick Ref: Command Quick Start

```bash
# Navigate to project
cd x:\CODE\miniconnect

# Start server
cd server && npm install && npm start

# Install extension
# 1. chrome://extensions/
# 2. Developer mode ON
# 3. Load unpacked → select extension/ folder

# Access mobile app
# Browser → http://localhost:3000 (same machine)
#        → http://YOUR_IP:3000 (different machine)

# View server logs
# Watch terminal where npm start is running

# View extension logs
# F12 on YouTube Music tab → Console → filter [MiniConnect]

# Stop server
# Ctrl+C in terminal running npm start

# Troubleshoot port
# netstat -ano | findstr :3000 (Windows)
# lsof -i :3000 (Mac/Linux)
```

---

**Verification Guide Version**: 1.0  
**Last Updated**: April 11, 2026  
**Status**: Complete
