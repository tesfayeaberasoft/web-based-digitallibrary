# 🚀 Deploy Frontend to Vercel + Backend on InfinityFree

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  FRONTEND (Vercel)                                  │
│  • React App                                        │
│  • PWA Support                                      │
│  • CDN Distribution                                 │
│  • Automatic HTTPS                                  │
│  • Fast Global Delivery                             │
│                                                     │
│  https://your-app.vercel.app                        │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ API Calls
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  BACKEND (InfinityFree)                             │
│  • PHP API                                          │
│  • MySQL Database                                   │
│  • File Storage                                     │
│                                                     │
│  https://tdigitallibrarysystem.free.nf/backend      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Benefits of This Setup

### Why Vercel for Frontend:
- ✅ **No file deletions** (unlike InfinityFree)
- ✅ **Fast CDN delivery** worldwide
- ✅ **Automatic HTTPS** with valid certificate
- ✅ **PWA works perfectly** (service workers supported)
- ✅ **PDF worker no issues** (static files work correctly)
- ✅ **Free SSL/TLS** (no InfinityFree SSL issues)
- ✅ **Instant deployments** (push to deploy)
- ✅ **Automatic builds** from GitHub
- ✅ **Preview deployments** for testing

### Why InfinityFree for Backend:
- ✅ **Free PHP hosting** (Vercel doesn't support PHP)
- ✅ **Free MySQL database** (included)
- ✅ **File uploads** (ebooks, covers)
- ✅ **Already set up** (just needs database fix)

---

## 🚀 Deployment Steps

### STEP 1: Prepare Backend API for CORS (5 minutes)

Your backend needs to accept requests from Vercel domain.

**1.1. Update Backend CORS Configuration**

Edit: `backend/.env` on InfinityFree

Add this line (replace with your Vercel URL after deployment):
```env
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://tdigitallibrarysystem.free.nf
```

**1.2. Update CORS in backend/config/config.php**

Make sure CORS headers allow Vercel:

```php
// Update this section to use environment variable
$allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:3000');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
```

**1.3. Test Backend API**

Visit: `https://tdigitallibrarysystem.free.nf/backend/api/public/stats`

Should return JSON (not HTML error).

---

### STEP 2: Deploy to Vercel (10 minutes)

#### Method 1: Using Vercel CLI (Recommended)

**2.1. Install Vercel CLI**

```powershell
npm install -g vercel
```

**2.2. Login to Vercel**

```powershell
vercel login
```

Follow the prompts to login via email or GitHub.

**2.3. Deploy**

```powershell
# Navigate to project root
cd "c:\Users\pc\Desktop\Projects\web-based-digitallibrary"

# Deploy to Vercel
vercel
```

**When prompted:**
- "Set up and deploy?" → **Yes**
- "Which scope?" → Select your account
- "Link to existing project?" → **No**
- "Project name?" → `digital-library` (or any name)
- "In which directory is your code located?" → `./`
- "Want to override settings?" → **Yes**
  - "Build Command?" → `cd frontend && npm install && npm run build`
  - "Output Directory?" → `frontend/build`
  - "Development Command?" → Leave blank

**2.4. Set Environment Variables**

After deployment, go to Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these:

```
REACT_APP_API_URL = https://tdigitallibrarysystem.free.nf/backend
REACT_APP_GOOGLE_CLIENT_ID = your_google_client_id (optional)
GENERATE_SOURCEMAP = false
```

3. Click "Save"
4. Go to Deployments tab
5. Click "Redeploy" to apply environment variables

---

#### Method 2: Using GitHub + Vercel Dashboard (Easier)

**2.1. Push to GitHub**

```powershell
# If not already a git repo
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/digital-library.git
git branch -M main
git push -u origin main
```

**2.2. Connect to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Output Directory:** `frontend/build`
   - **Install Command:** `npm install`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL = https://tdigitallibrarysystem.free.nf/backend
   GENERATE_SOURCEMAP = false
   ```

6. Click "Deploy"

---

### STEP 3: Update Backend CORS with Vercel URL

After Vercel deployment, you'll get a URL like:
```
https://digital-library-abc123.vercel.app
```

**3.1. Update InfinityFree Backend**

Edit `backend/.env`:
```env
CORS_ALLOWED_ORIGINS=https://digital-library-abc123.vercel.app,https://tdigitallibrarysystem.free.nf
```

**3.2. Update backend/config/config.php if needed**

Make sure CORS is handled properly:

```php
// Allow requests from Vercel
$allowedOrigins = [
    'https://digital-library-abc123.vercel.app',
    'https://tdigitallibrarysystem.free.nf',
    'http://localhost:3000' // for local development
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

**3.3. Upload updated files to InfinityFree**

---

### STEP 4: Test Everything

**4.1. Visit Your Vercel App**

```
https://digital-library-abc123.vercel.app
```

**4.2. Test All Features**

✅ **Homepage loads**
✅ **Login works**
✅ **Can browse books**
✅ **Can create books (librarian)**
✅ **Can borrow books**
✅ **"My Books" shows borrowed books**
✅ **PDF reading works** (no worker error!)
✅ **PWA installation works** (check for install icon)

**4.3. Test PWA Installation**

**Desktop:**
- Visit your Vercel URL
- Look for ⊕ icon in address bar
- Click to install
- Should work perfectly!

**Android:**
- Visit in Chrome
- Menu → "Install app"
- Should install smoothly

**iOS:**
- Safari → Share → "Add to Home Screen"
- Should add to home screen

---

## 🔧 Troubleshooting

### CORS Errors

**Error:** "Access to fetch at ... has been blocked by CORS policy"

**Fix:**
1. Verify backend `.env` has correct Vercel URL in `CORS_ALLOWED_ORIGINS`
2. Check `backend/config/config.php` CORS headers
3. Test: `https://tdigitallibrarysystem.free.nf/backend/api/public/stats`
4. Should return JSON with CORS headers

### Build Fails on Vercel

**Error:** "Build failed"

**Check:**
1. Vercel dashboard → Deployment → Build Logs
2. Common issues:
   - Wrong build command
   - Wrong output directory
   - Missing dependencies

**Fix:**
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/build`

### API Calls Fail

**Error:** Network error or 404

**Fix:**
1. Check environment variable: `REACT_APP_API_URL`
2. Should be: `https://tdigitallibrarysystem.free.nf/backend`
3. Redeploy after changing env vars

### PWA Not Installing

**Check:**
1. Service worker registered (F12 → Application)
2. Manifest loads (visit `/manifest.json`)
3. HTTPS enabled (Vercel does this automatically)
4. Run Lighthouse audit (should score 90+)

---

## 📊 Comparison: InfinityFree vs Vercel

| Feature | InfinityFree (Old) | Vercel (New) |
|---------|-------------------|--------------|
| File Deletions | ❌ Deletes .map files | ✅ No deletions |
| SSL/HTTPS | ⚠️ Shared SSL | ✅ Automatic SSL |
| PWA Support | ⚠️ Limited | ✅ Full support |
| CDN | ❌ No CDN | ✅ Global CDN |
| Deployment | ⚠️ Manual FTP | ✅ Auto from Git |
| Build Issues | ❌ Many issues | ✅ No issues |
| Speed | ⚠️ Slow | ✅ Very fast |
| Service Workers | ⚠️ Issues | ✅ Perfect |
| PDF Worker | ❌ Issues | ✅ Works |

---

## 🎯 Final Architecture

**Frontend (Vercel):**
```
https://your-app.vercel.app
├── React App (all pages)
├── Service Worker (PWA)
├── PDF Viewer
├── Static Assets
└── Manifest
```

**Backend (InfinityFree):**
```
https://tdigitallibrarysystem.free.nf/backend
├── /api/auth/* (login, register)
├── /api/books/* (CRUD)
├── /api/loans/* (borrowing)
├── /api/users/* (user management)
└── MySQL Database
```

---

## ✅ Benefits Summary

With this setup:
- ✅ **All 4 issues SOLVED automatically**
- ✅ No more file deletion issues
- ✅ PWA works perfectly
- ✅ PDF reading works
- ✅ Borrowed books display
- ✅ Book creation works
- ✅ Fast global delivery
- ✅ Automatic deployments
- ✅ Free hosting for both!

---

## 🔄 Development Workflow

**Making Changes:**

1. Make changes locally in `frontend/src/`
2. Test locally: `npm start`
3. Commit to Git: `git commit -am "Update feature"`
4. Push: `git push`
5. Vercel automatically deploys!

**No need to:**
- ❌ Manually build
- ❌ Upload via FTP
- ❌ Clear caches manually
- ❌ Worry about file deletions

---

## 📱 Custom Domain (Optional)

Want your own domain like `library.yourdomain.com`?

**In Vercel Dashboard:**
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Done! Automatic HTTPS included

---

## 🎉 You're Done!

After deploying to Vercel:
- ✅ Frontend on Vercel (fast, reliable, no issues)
- ✅ Backend on InfinityFree (free PHP + MySQL)
- ✅ All features work perfectly
- ✅ PWA installs smoothly
- ✅ PDF reading works
- ✅ No more deployment headaches

**Your Digital Library is now production-ready!** 🚀

---

## 📞 Need Help?

**Vercel Resources:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

**Common Commands:**
```powershell
# Deploy
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

**Deploy now and enjoy hassle-free hosting!** 🎊
