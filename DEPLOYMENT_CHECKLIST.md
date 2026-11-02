# 📋 Deployment Checklist for InfinityFree

## Pre-Deployment Checklist

Before you start, ensure you have:

- [ ] Access to InfinityFree control panel
- [ ] FTP credentials OR access to File Manager
- [ ] Database already created and imported
- [ ] Backend `.env` file configured
- [ ] FileZilla installed (if using FTP)
- [ ] Git bash or PowerShell available

---

## Step 1: Build Frontend ⚙️

### Commands to Run:

```powershell
# Navigate to project root
cd "c:\Users\pc\Desktop\Projects\web-based-digitallibrary"

# Option 1: Use the automated script
.\deploy-fixes.bat

# Option 2: Manual build
cd frontend
npm install  # If dependencies changed
npm run build
```

### Verification:
- [ ] Build completes without errors
- [ ] `frontend/build/` folder exists
- [ ] `frontend/build/index.html` exists
- [ ] `frontend/build/manifest.json` exists
- [ ] `frontend/build/sw.js` exists
- [ ] `frontend/build/static/` folder has CSS and JS

**If build fails:**
```powershell
# Clear node modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

---

## Step 2: Prepare Files for Upload 📦

### Files That MUST Be Uploaded:

#### From `frontend/build/` → `htdocs/`

Create a checklist:
```
frontend/build/
├── [ ] index.html ✓
├── [ ] manifest.json ✓
├── [ ] browserconfig.xml ✓
├── [ ] sw.js ✓
├── [ ] asset-manifest.json ✓
├── [ ] favicon.ico ✓
├── [ ] digital-library-icon-192x192.png ✓
├── [ ] digital-library-icon-512x512.png ✓
├── [ ] robots.txt ✓
└── [ ] static/
    ├── [ ] css/ (all files) ✓
    ├── [ ] js/ (all files) ✓
    └── [ ] media/ (all files) ✓
```

#### Backend PHP Files:

```
backend/api/
├── [ ] books/create.php → htdocs/backend/api/books/
└── [ ] loans/list.php → htdocs/backend/api/loans/
```

### Files That Should NOT Be Uploaded:

❌ Do NOT upload:
- `frontend/src/` (source files not needed)
- `frontend/node_modules/`
- `backend/.env.example` (upload only `.env` with real credentials)
- Any `.git` folders
- `README.md` files
- Local logs or backups

---

## Step 3: Upload via FTP (FileZilla) 🚀

### Setup FileZilla:

1. Open FileZilla
2. Enter connection details:
   ```
   Host: ftp.example.epizy.com (check your control panel)
   Username: epiz_xxxxx
   Password: your_password
   Port: 21
   ```
3. Click "Quickconnect"

### Upload Process:

#### 3.1: Upload Frontend Files

**Left Panel (Local):** Navigate to `c:\Users\pc\Desktop\Projects\web-based-digitallibrary\frontend\build\`

**Right Panel (Remote):** Navigate to `/htdocs/`

**Upload Method:**
1. Select ALL files in `frontend/build/`
2. Right-click → Upload
3. When asked about overwriting: "Overwrite"
4. Wait for transfer to complete

**Verify Upload:**
- [ ] Visit: `https://tdigitallibrarysystem.free.nf/manifest.json`
- [ ] Visit: `https://tdigitallibrarysystem.free.nf/browserconfig.xml`
- [ ] Both should load without 404 errors

#### 3.2: Upload Backend PHP Files

**Upload `create.php`:**
- Local: `backend/api/books/create.php`
- Remote: `/htdocs/backend/api/books/create.php`
- Action: Upload and overwrite

**Upload `list.php`:**
- Local: `backend/api/loans/list.php`
- Remote: `/htdocs/backend/api/loans/list.php`
- Action: Upload and overwrite

**Verify Upload:**
- Check file modification dates in FileZilla
- Should show today's date/time

---

## Step 4: Upload via File Manager (Alternative) 📁

### Using InfinityFree File Manager:

1. Login to InfinityFree control panel
2. Click "File Manager"
3. Navigate to `htdocs/`

#### Upload Frontend:

**Method: Zip and Upload (Faster for many files)**

1. **On your computer:**
   ```powershell
   cd frontend/build
   # Create zip of all files
   Compress-Archive -Path * -DestinationPath ..\build-files.zip
   ```

2. **In File Manager:**
   - Click "Upload" button
   - Select `build-files.zip`
   - Wait for upload (may take 2-5 minutes)
   - Right-click `build-files.zip` → "Extract"
   - Select "Extract Here"
   - Delete `build-files.zip` after extraction

3. **Verify:**
   - Check that `index.html`, `manifest.json`, etc. are in `htdocs/`
   - NOT in a subfolder like `htdocs/build/`

#### Upload Backend Files (Individual):

1. Navigate to `htdocs/backend/api/books/`
2. Click "Upload"
3. Select `create.php` from your local `backend/api/books/`
4. Confirm overwrite

5. Navigate to `htdocs/backend/api/loans/`
6. Click "Upload"
7. Select `list.php` from your local `backend/api/loans/`
8. Confirm overwrite

---

## Step 5: Verify File Structure 🔍

### Check InfinityFree File Structure:

Your `htdocs/` should look like:
```
htdocs/
├── index.html ✓
├── manifest.json ✓
├── browserconfig.xml ✓
├── sw.js ✓
├── asset-manifest.json ✓
├── favicon.ico ✓
├── digital-library-icon-192x192.png ✓
├── digital-library-icon-512x512.png ✓
├── robots.txt ✓
├── .htaccess ✓
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── backend/
    ├── .htaccess ✓
    ├── .env ✓
    ├── api/
    │   ├── books/
    │   │   ├── create.php ✓ (updated)
    │   │   └── ...
    │   ├── loans/
    │   │   ├── list.php ✓ (updated)
    │   │   └── ...
    │   └── ...
    ├── config/
    ├── utils/
    └── vendor/
```

### Common Mistakes to Avoid:

❌ **Wrong:** `htdocs/build/index.html`
✅ **Correct:** `htdocs/index.html`

❌ **Wrong:** `htdocs/frontend/build/index.html`
✅ **Correct:** `htdocs/index.html`

❌ **Wrong:** Uploaded source files (`src/`)
✅ **Correct:** Only uploaded `build/` contents

---

## Step 6: Clear All Caches 🧹

### On Server (InfinityFree):

Some control panels have cache management:
1. Go to control panel
2. Look for "Cache Manager" or similar
3. Click "Clear All Caches"

### On Your Browser:

#### Method 1: DevTools
1. Open site: `https://tdigitallibrarysystem.free.nf/`
2. Press `F12` (open DevTools)
3. Go to "Application" tab
4. Click "Service Workers" in left sidebar
5. Click "Unregister" for all service workers
6. Click "Storage" in left sidebar
7. Click "Clear site data" button
8. Close DevTools

#### Method 2: Browser Settings
```
Chrome/Edge:
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check:
   ✓ Cookies and site data
   ✓ Cached images and files
4. Click "Clear data"
```

#### Method 3: Hard Refresh
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### On Mobile:

**Android Chrome:**
1. Menu (⋮) → Settings
2. Privacy and security → Clear browsing data
3. Select "All time"
4. Clear cache and cookies

**iOS Safari:**
1. Settings → Safari
2. Clear History and Website Data

---

## Step 7: Test Everything ✅

### Test 1: Basic Functionality

Visit: `https://tdigitallibrarysystem.free.nf/`

- [ ] Home page loads
- [ ] No console errors (F12 → Console)
- [ ] Images load
- [ ] Navigation works
- [ ] Browse books page works

### Test 2: API Endpoints

Visit: `https://tdigitallibrarysystem.free.nf/backend/api/public/stats`

Expected: JSON response like:
```json
{
  "success": true,
  "stats": {
    "total_books": 123,
    ...
  }
}
```

- [ ] Returns JSON (not HTML)
- [ ] No 404 error
- [ ] No PHP errors

### Test 3: Book Creation

1. Login as librarian
2. Go to Inventory → Add New Book
3. Fill all fields:
   - Title: "Test Deployment Book"
   - Author: "Test Author"
   - ISBN: "9780000000001"
   - Category: Select any
   - Total Copies: 1
4. Click "Add Book"

**Expected:**
- [ ] Success message appears
- [ ] Modal closes
- [ ] Book appears in inventory

5. Go to Browse Books
6. Search for "Test Deployment"

**Expected:**
- [ ] Book appears in results
- [ ] All details correct

### Test 4: Book Borrowing

1. Login as regular user
2. Go to Browse Books
3. Find an available book
4. Click "Borrow"
5. Confirm

**Expected:**
- [ ] Success message
- [ ] Book status updates

6. Go to "My Books"

**Expected:**
- [ ] Borrowed book appears
- [ ] Shows loan date (today)
- [ ] Shows due date (today + 14 days)
- [ ] Status badge: "Active" (green)
- [ ] Return and Renew buttons work

### Test 5: PWA Installation

#### Desktop (Chrome/Edge):

1. Visit site
2. Wait 3-5 seconds
3. Look in address bar for install icon (⊕)

**Expected:**
- [ ] Install icon appears
- [ ] Click shows install dialog
- [ ] After install: opens standalone
- [ ] App in Start Menu

**If no icon:**
- Try: Menu (⋮) → "Install Digital Library..."
- Or: Settings → Apps → Install

#### Android:

1. Open in Chrome
2. Wait for banner OR menu → "Add to Home screen"

**Expected:**
- [ ] Install option available
- [ ] After install: icon on home screen
- [ ] Opens full screen

#### iOS Safari:

1. Open in Safari
2. Tap Share → "Add to Home Screen"

**Expected:**
- [ ] Option appears
- [ ] After adding: icon on home screen
- [ ] Opens full screen

### Test 6: PWA Manifest

Visit: `https://tdigitallibrarysystem.free.nf/manifest.json`

**Expected:**
```json
{
  "short_name": "Digital Library",
  "name": "Digital Library Management System",
  "start_url": "/",
  "display": "standalone",
  "icons": [...],
  "shortcuts": [...]
}
```

- [ ] Loads without 404
- [ ] Valid JSON (no syntax errors)
- [ ] All fields present

### Test 7: Service Worker

1. Open DevTools (F12)
2. Go to Application → Service Workers

**Expected:**
- [ ] Service worker registered
- [ ] Status: "activated and is running"
- [ ] Source: `/sw.js`

3. Go to Application → Cache Storage

**Expected:**
- [ ] Cache: "digital-library-shell-v5" exists
- [ ] Contains cached files

### Test 8: Offline Mode

1. Open site (make sure it's loaded)
2. Enable Airplane Mode / Disconnect WiFi
3. Try navigating to different pages

**Expected:**
- [ ] Home page still loads (from cache)
- [ ] Static content shows
- [ ] Error message for dynamic content

---

## Step 8: Performance Check 📊

### Lighthouse Audit:

1. Open site in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Select all categories
5. Click "Analyze page load"

**Target Scores:**
- [ ] Performance: > 70
- [ ] Progressive Web App: > 90
- [ ] Best Practices: > 80
- [ ] Accessibility: > 85
- [ ] SEO: > 85

### PWA Specific Checks:

In Lighthouse PWA report, should PASS:
- [ ] ✓ Registers a service worker
- [ ] ✓ Responds with a 200 when offline
- [ ] ✓ Has a valid manifest
- [ ] ✓ Manifest has icons (192px and 512px)
- [ ] ✓ Manifest display is standalone
- [ ] ✓ Sets a theme color
- [ ] ✓ Content properly sized for viewport
- [ ] ✓ Provides a valid apple-touch-icon

---

## Troubleshooting Quick Reference 🔧

### Issue: Books don't appear after creation

**Quick Fix:**
1. Check browser console for errors
2. Verify API response: `/api/books` returns success
3. Check database: `SELECT * FROM books ORDER BY id DESC LIMIT 1`
4. Verify backend `.env` has correct DB credentials

### Issue: Borrowed books don't show in "My Books"

**Quick Fix:**
1. Check browser console
2. Verify API: `/api/loans?status=active` returns data
3. Check database: `SELECT * FROM book_loans WHERE status='active'`
4. Verify JWT token is valid (localStorage)

### Issue: PWA install prompt doesn't appear

**Quick Fix:**
1. Verify HTTPS (not HTTP)
2. Check manifest.json loads
3. Check service worker registered
4. Run Lighthouse PWA audit
5. Try manual install: Menu → Install app
6. Remember: iOS needs manual "Add to Home Screen"

### Issue: 404 on API calls

**Quick Fix:**
1. Verify `.htaccess` in root (`htdocs/.htaccess`)
2. Verify `.htaccess` in backend (`htdocs/backend/.htaccess`)
3. Check Apache `mod_rewrite` is enabled
4. Verify file paths are correct

### Issue: Site shows old version

**Quick Fix:**
1. Unregister service worker (DevTools → Application)
2. Clear cache: Ctrl+Shift+Delete
3. Hard refresh: Ctrl+Shift+R
4. Close and reopen browser

---

## Post-Deployment Checklist ✨

After everything is working:

- [ ] Test from different devices (desktop, mobile)
- [ ] Test from different browsers (Chrome, Edge, Safari)
- [ ] Test all user roles (admin, librarian, user)
- [ ] Verify email notifications work (if configured)
- [ ] Check error logs on server
- [ ] Document any issues for users
- [ ] Create user guide if needed
- [ ] Share installation instructions with users
- [ ] Monitor for errors in first 24 hours

---

## Success! 🎉

Your deployment is complete when:

✅ Site loads over HTTPS
✅ All pages navigate correctly
✅ Books can be created and appear in browse
✅ Books can be borrowed and show in "My Books"
✅ PWA can be installed (at least one platform tested)
✅ No console errors
✅ API endpoints return JSON
✅ Service worker registered
✅ Lighthouse PWA score > 90

---

## Rollback Plan 🔄

If something goes wrong:

1. **Restore Previous Build:**
   - Keep backup of previous `htdocs/` contents
   - Re-upload old files via FTP

2. **Restore Backend:**
   - Re-upload previous PHP files
   - Restore `.env` if changed

3. **Restore Database:**
   - Keep database backup
   - Import via phpMyAdmin if needed

4. **Clear Caches:**
   - Server and browser
   - Force service worker update

---

## Support Resources 📚

- **QUICK_FIX_GUIDE.md** - Step-by-step fixes
- **DEPLOYMENT_FIXES.md** - Technical details
- **TEST_DEPLOYMENT.md** - Comprehensive tests
- **PWA_TROUBLESHOOTING.md** - PWA installation help

---

## Final Notes 📝

- Always test locally before deploying
- Keep backups of database and files
- Document any custom changes
- Monitor server logs after deployment
- Update documentation as needed

**Deployment Time Estimate:** 30-45 minutes (first time)

Good luck with your deployment! 🚀
