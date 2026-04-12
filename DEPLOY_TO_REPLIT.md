# Deploy to Replit (Permanent Free Server)

## Why Replit?
✅ Free tier - always online (no ngrok)
✅ Permanent public URL like: `https://miniconnect-server.replit.dev`
✅ Works on WiFi + mobile data
✅ Phone + Laptop both connect to same URL

---

## Deploy Steps (2 minutes)

### 1. Go to Replit
- Visit: https://replit.com
- Sign up with GitHub or email (free)

### 2. Import Your Project
- Click **"+ Create"** → **"Import from GitHub"**
- Paste: `https://github.com/YOUR_USERNAME/miniconnect`
  - OR manually upload the `x:\CODE\miniconnect` folder

- Click **"Create Repl"**

### 3. Run the Server
- Replit automatically detects `.replit` file
- Click **"Run"** button
- See output: `Listening on https://xxxxxxxx.replit.dev`
- Copy this URL

### 4. Connect Phone
On your phone:
1. Open the mobile app (or go to `https://xxxxxxxx.replit.dev`)
2. In the **Server URL** field, paste: `https://xxxxxxxx.replit.dev`
3. Click **"Connect"**

✅ **That's it!** Phone on mobile data ✓ Laptop on WiFi ✓ Both work!

---

## For Laptop Extension

The extension still works locally:
- It polls your laptop's localhost (no changes needed)
- The extension sends commands to Replit
- Replit forwards to the extension

---

## Keep Server Running

**Option A (Free, Always On):**
- Replit free tier keeps server online
- No action needed

**Option B (Auto-wake on timeout):**
- If server sleeps after 1 hour, add Uptimerobot
- Visit: https://uptimerobot.com (free)
- Monitor your Replit URL every 5 minutes to keep it awake

---

## Next Time You Want to Update Code

1. Edit files locally on your laptop
2. Push to GitHub: `git push`
3. In Replit: Click **"Refresh"** or restart

**OR** manually upload new files in Replit editor

---

## Troubleshooting

**"Cannot connect"**
- Make sure you copied the FULL URL (including `https://`)
- Wait 30 seconds after clicking Run

**"Page not loading"**
- Mobile app tries to auto-detect server
- Manually enter: `https://xxxxxxxx.replit.dev`

**"Server went offline"**
- Replit free tier sleeps after ~1 hour of no activity
- Use Uptimerobot (free) to keep it awake
- OR click "Run" again

---

## Questions?
Your server is now working worldwide!
- Phone on 4G = can connect
- Laptop on WiFi = extension works
- Both controlling YouTube Music = ✅ Done!
