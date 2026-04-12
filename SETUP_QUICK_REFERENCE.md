# MiniConnect Setup - Quick Reference

## Local Setup (Current - Works on Same WiFi)
```
Laptop:   192.168.1.9 (WiFi)
Phone:    192.168.1.x (WiFi)
Extension: Polls 192.168.1.9:3000 ✅
Phone:    Connect to 192.168.1.9:3000 ✅
```

**Issue:** Phone cannot use mobile data (different network)

**Start Server:**
```powershell
cd x:\CODE\miniconnect\server
node server.js
```

**Phone URL:** `192.168.1.9:3000`

---

## Cloud Setup (Recommended - Works Anywhere)
```
Replit Server: https://miniconnect-server.replit.dev (cloud)
Phone:    Mobile data OR WiFi ✅
Laptop:   WiFi ✅
Both:     Connect to Replit cloud ✅
```

**Issue:** None - works worldwide!

**Setup:** See `DEPLOY_TO_REPLIT.md` (2 minutes)

**Phone URL:** `https://miniconnect-server.replit.dev` (your URL)

---

## Choose Your Config

### If You Want: Local WiFi Only
1. Run: `node server.js` on laptop
2. Phone WiFi only
3. Phone URL: `192.168.1.9:3000`
✅ **Fast & Free**

### If You Want: Phone on Mobile Data
1. Deploy to Replit (once, takes 2 min)
2. Never run local server again
3. Phone/Laptop both use cloud URL
✅ **Works Anywhere**

---

## Quick Deploy Timeline

| When | Action | Time |
|------|--------|------|
| First Time | Deploy to Replit | 2 min |
| After Update | Push code to GitHub | 1 min |
| Server Sleep | Click Replit "Run" | 10 sec |

---

## Full URLs to Copy

Paste these in your phone app (Server URL field):

**Local (WiFi only):**
```
192.168.1.9:3000
```

**Cloud (Mobile Data + WiFi):**
```
https://miniconnect-server.replit.dev
```
(Replace with YOUR Replit URL)

---

That's it! Pick one approach and go! 🎉
