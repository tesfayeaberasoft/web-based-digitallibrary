# PWA Installation Troubleshooting Guide

## 🔍 Understanding PWA Installation

PWAs (Progressive Web Apps) can be installed on devices to work like native apps. However, the installation experience varies by platform and browser.

---

## Platform-Specific Installation

### 🖥️ Windows (Desktop)

**Supported Browsers:**
- ✅ Chrome (recommended)
- ✅ Edge (recommended)
- ❌ Firefox (limited PWA support)
- ❌ Internet Explorer (not supported)

**Installation Methods:**

**Method 1: Automatic Prompt**
- Browser shows install icon (⊕) in address bar
- Click icon → Click "Install"
- App opens in standalone window

**Method 2: Manual via Menu**
- Chrome: Menu (⋮) → "Install Digital Library..."
- Edge: Menu (⋯) → "Apps" → "Install this site as an app"

**Method 3: From Settings**
- Chrome: Settings → Apps → Install Digital Library

**What You'll See:**
- Standalone app window (no browser chrome)
- App in Start Menu
- App in taskbar when running
- Desktop shortcut (optional during install)

### 📱 Android

**Supported Browsers:**
- ✅ Chrome (best support)
- ✅ Edge
- ✅ Samsung Internet
- ⚠️ Firefox (limited)

**Installation Methods:**

**Method 1: Install Banner**
- Visit site in Chrome
- Banner appears at bottom: "Add to Home screen"
- Tap "Add" or "Install"

**Method 2: Menu Install**
- Chrome: Menu (⋮) → "Add to Home screen" or "Install app"
- Select where to add (Home screen, App drawer)
- Tap "Add"

**What You'll See:**
- Icon on home screen
- Full screen app (no browser UI)
- Splash screen on launch
- In app drawer with other apps
- Shows in recent apps

### 🍎 iOS (iPhone/iPad)

**Important:** iOS Safari does NOT show automatic install prompts. Installation is ALWAYS manual.

**Supported Browsers:**
- ✅ Safari (only browser that supports PWA installation)
- ❌ Chrome (redirects to Safari for installation)
- ❌ Firefox (no PWA support)

**Installation Method (Safari Only):**
1. Open Safari
2. Visit `https://tdigitallibrarysystem.free.nf/`
3. Tap Share button (square with ↑)
4. Scroll down in share menu
5. Tap "Add to Home Screen"
6. (Optional) Edit name
7. Tap "Add"

**What You'll See:**
- Icon on home screen
- Full screen (no Safari UI)
- Splash screen on launch
- Status bar matches theme color
- Long press to remove like any app

### 💻 macOS (Desktop)

**Supported Browsers:**
- ✅ Chrome
- ✅ Edge
- ✅ Safari (limited)

**Chrome/Edge Installation:**
- Same as Windows (see above)

**Safari Installation:**
- File → Add to Dock
- (Limited PWA support)

---

## Why Install Prompt May Not Appear

### Requirements Checklist

For the browser to show an install prompt, ALL these must be true:

- [ ] Site served over HTTPS (not HTTP)
- [ ] Valid manifest.json file
- [ ] Manifest includes:
  - [ ] name or short_name
  - [ ] start_url
  - [ ] display: standalone/fullscreen/minimal-ui
  - [ ] icons: at least 192x192 and 512x512
- [ ] Service worker registered
- [ ] Service worker has fetch handler
- [ ] Site visited at least twice (with 5+ minutes between visits) - Chrome heuristic
- [ ] User hasn't dismissed prompt for this site before
- [ ] User hasn't installed app already
- [ ] Site has meaningful engagement (opened, interacted with)

### Common Issues & Fixes

#### Issue 1: No Install Icon in Chrome/Edge

**Possible Causes:**
1. Site not HTTPS
2. manifest.json has errors
3. Icons missing or wrong format
4. Service worker not registered
5. Already installed
6. Prompt previously dismissed

**How to Check:**

**Step 1: Verify HTTPS**
```
Look at address bar:
✅ https://tdigitallibrarysystem.free.nf/
❌ http://tdigitallibrarysystem.free.nf/
```

**Step 2: Check Manifest**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" in left sidebar
4. Look for errors (red text)
5. Verify all fields populated:
   - name ✓
   - short_name ✓
   - start_url ✓
   - icons (2+) ✓
   - display ✓

**Step 3: Check Icons**
1. In Manifest view, click each icon link
2. Verify icons load (not 404)
3. Verify icon sizes match manifest:
   - digital-library-icon-192x192.png (192x192)
   - digital-library-icon-512x512.png (512x512)

**Step 4: Check Service Worker**
1. DevTools → Application → Service Workers
2. Verify status: "activated and is running"
3. If not registered:
   - Check console for errors
   - Verify sw.js loads (not 404)
   - Hard refresh: Ctrl+Shift+R

**Step 5: Run Lighthouse Audit**
1. DevTools → Lighthouse
2. Select "Progressive Web App"
3. Click "Generate report"
4. Review "Installable" section
5. Fix any failing criteria

**Fix:**
```javascript
// Check if already installed
window.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is already installed');
  }
});
```

#### Issue 2: "Add to Home Screen" on Android but No "Install App"

**Why This Happens:**
- "Add to Home Screen" = bookmark (opens in browser)
- "Install app" = true PWA install (standalone)

**Requirements for "Install app":**
- All basic PWA requirements met (see checklist above)
- Chrome 68+ or Edge
- manifest display: "standalone"

**Check:**
```javascript
// Check if installable
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ App is installable!');
  deferredPrompt = e;
});
```

#### Issue 3: iOS Safari - Can't Find "Add to Home Screen"

**Steps to Find It:**
1. Make sure you're using Safari (not Chrome)
2. Tap Share button at bottom of screen
3. Scroll DOWN in the share sheet
4. Look for "Add to Home Screen" with ⊕ icon
5. If not visible:
   - Update iOS to latest version
   - Restart Safari
   - Clear Safari cache

**Not There?**
- Verify site is HTTPS
- Check manifest.json exists
- Make sure icons are PNG (not JPEG)

#### Issue 4: Windows - Install but Opens in Browser

**Problem:** Clicking app opens in browser tab, not standalone window

**Cause:** manifest.json has `display: "browser"` or incorrect start_url

**Fix:**
1. Check manifest.json:
   ```json
   {
     "display": "standalone",  // Not "browser"
     "start_url": "/",         // Absolute path
     "scope": "/"              // Absolute path
   }
   ```
2. Uninstall app
3. Clear cache
4. Reinstall

#### Issue 5: Icons Look Wrong/Blurry

**Problem:** App icon is low quality or generic

**Causes:**
1. Icon files missing
2. Icon sizes wrong
3. Icon format not PNG
4. Icons not in manifest

**Fix:**
1. Verify icon files exist:
   - digital-library-icon-192x192.png (exactly 192x192 pixels)
   - digital-library-icon-512x512.png (exactly 512x512 pixels)
2. Verify manifest references them correctly
3. Verify icons are PNG format
4. Add "purpose": "any maskable" for adaptive icons:
   ```json
   {
     "icons": [{
       "src": "icon-512x512.png",
       "sizes": "512x512",
       "type": "image/png",
       "purpose": "any maskable"  // ← Important
     }]
   }
   ```
5. Uninstall and reinstall app

---

## Debugging Tools

### Chrome DevTools - Application Tab

**Manifest:**
- Shows parsed manifest
- Highlights errors
- Shows icon previews
- Indicates if installable

**Service Workers:**
- Shows registration status
- Allows manual update
- Shows scope and source
- Can unregister

**Storage:**
- Clear site data
- View cache storage
- Reset PWA install state

### Lighthouse PWA Audit

**Run Audit:**
1. DevTools → Lighthouse
2. Check "Progressive Web App"
3. Generate report

**Key Metrics:**
- ✅ Installable (must pass)
- Registers service worker
- Responds with 200 when offline
- Fast load times
- Valid manifest

**Common Failures:**
- ❌ "Page does not work offline" → Service worker issue
- ❌ "Manifest doesn't have icons" → Add icons to manifest
- ❌ "start_url doesn't respond with 200" → Fix start_url path
- ❌ "Not served over HTTPS" → Must use HTTPS

### Testing Install Prompt Manually

**Trigger Install Programmatically:**
```javascript
// Add this to test installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Install prompt captured');
  
  // Show custom install button
  showInstallButton();
});

function showInstallButton() {
  const btn = document.createElement('button');
  btn.textContent = 'Install App';
  btn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
    }
  };
  document.body.appendChild(btn);
}
```

---

## Platform Limitations

### What iOS Can't Do (vs Android/Desktop)

**iOS Limitations:**
- ❌ No automatic install prompts
- ❌ No background sync
- ❌ No push notifications
- ❌ No file system access
- ❌ Limited storage (50MB typical)
- ❌ Only works in Safari

**iOS Can Do:**
- ✅ Add to home screen
- ✅ Standalone mode (full screen)
- ✅ Service worker (caching)
- ✅ Offline support
- ✅ Custom splash screen
- ✅ Theme color

### Android/Desktop Features

**Full Support:**
- ✅ Automatic install prompts
- ✅ Background sync
- ✅ Push notifications
- ✅ File system access
- ✅ Larger storage quotas
- ✅ Multiple browsers supported
- ✅ App shortcuts
- ✅ Share target

---

## Alternative: QR Code for Installation

If users have trouble installing, create a QR code guide:

### Create QR Code
1. Go to https://www.qr-code-generator.com/
2. Enter: `https://tdigitallibrarysystem.free.nf/`
3. Download QR code

### Print Instructions

```
┌─────────────────────────────────────┐
│  Install Digital Library App        │
├─────────────────────────────────────┤
│                                     │
│  1. Scan this QR code               │
│     [QR CODE HERE]                  │
│                                     │
│  2. Android/Desktop:                │
│     • Look for install icon in      │
│       address bar and click it      │
│                                     │
│  3. iPhone/iPad:                    │
│     • Tap Share button              │
│     • Tap "Add to Home Screen"      │
│                                     │
└─────────────────────────────────────┘
```

---

## Success Checklist

Your PWA is properly installed when:

**Desktop:**
- [ ] Opens in standalone window (no browser chrome)
- [ ] Has app icon in Start Menu / Applications
- [ ] Shows in taskbar with app name
- [ ] Window title shows app name

**Android:**
- [ ] Icon on home screen (not Chrome icon)
- [ ] Opens full screen (no browser UI)
- [ ] Shows splash screen on launch
- [ ] Appears in app drawer
- [ ] Shows in recent apps as separate app

**iOS:**
- [ ] Icon on home screen
- [ ] Opens full screen (no Safari UI)
- [ ] Shows splash screen
- [ ] Status bar matches theme color
- [ ] Works offline

**All Platforms:**
- [ ] Works offline (shows cached content)
- [ ] Looks and feels like native app
- [ ] Fast loading (cached resources)
- [ ] No browser address bar visible
- [ ] Back button works correctly

---

## Getting Help

If still having issues:

1. **Check Browser Console:**
   - Press F12 → Console
   - Look for errors (red text)
   - Share errors when asking for help

2. **Run Lighthouse Audit:**
   - DevTools → Lighthouse → PWA
   - Share results showing failures

3. **Test Different Browsers:**
   - Try Chrome (most reliable)
   - Try Edge
   - Try on different device

4. **Clear Everything and Retry:**
   ```
   1. DevTools → Application → Storage → Clear site data
   2. DevTools → Application → Service Workers → Unregister
   3. Close browser completely
   4. Reopen and visit site
   5. Wait for service worker to register
   6. Try install again
   ```

5. **Verify Server Configuration:**
   - Ensure HTTPS enabled
   - Verify manifest.json accessible
   - Check icons load (not 404)
   - Verify sw.js loads

---

## Final Notes

**Remember:**
- iOS NEVER shows automatic prompts (by design)
- Chrome requires 2 visits before showing prompt
- User can dismiss prompt (won't show again for ~90 days)
- Some browsers don't support PWA installation
- HTTPS is absolutely required
- Icons must be exactly sized correctly

**Best Practice:**
- Add manual "Install App" button on your site
- Show installation instructions for each platform
- Test on multiple devices/browsers
- Use Lighthouse to verify PWA readiness

---

Good luck with your PWA! 📱🖥️
