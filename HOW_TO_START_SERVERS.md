# 🚀 How to Start the Servers Correctly

## ⚠️ Important: Server Must Run from Correct Directory

The backend server MUST be started from the `backend` directory, otherwise it won't find `router.php`.

---

## ✅ Method 1: Using Batch Files (EASIEST)

### Start Backend:
1. Go to the project root folder: `web-based-digitallibrary`
2. Double-click: **`START_BACKEND_CORRECTLY.bat`**
3. Wait for: "Development Server (http://localhost:8000) started"
4. Keep this window open

### Start Frontend:
1. Go to the project root folder: `web-based-digitallibrary`
2. Double-click: **`start-frontend.bat`**
3. Wait for: "webpack compiled successfully"
4. Browser will open automatically

---

## ✅ Method 2: Using PowerShell

### Start Backend:
```powershell
# Navigate to the project
cd "C:\Users\tesfa\Desktop\Web development\digitalliberary\web-based-digitallibrary"

# Go to backend directory
cd backend

# Start server
php -S localhost:8000 router.php
```

### Start Frontend (in a new terminal):
```powershell
# Navigate to the project
cd "C:\Users\tesfa\Desktop\Web development\digitalliberary\web-based-digitallibrary"

# Go to frontend directory
cd frontend

# Start server
npm start
```

---

## ✅ Method 3: Using Command Prompt

### Start Backend:
```cmd
cd "C:\Users\tesfa\Desktop\Web development\digitalliberary\web-based-digitallibrary\backend"
php -S localhost:8000 router.php
```

### Start Frontend (in a new terminal):
```cmd
cd "C:\Users\tesfa\Desktop\Web development\digitalliberary\web-based-digitallibrary\frontend"
npm start
```

---

## 🧪 Verify Backend is Running Correctly

### Test 1: Check API Root
Open browser and go to: **http://localhost:8000/api**

**Expected Response:**
```json
{
  "message": "Digital Library API",
  "version": "1.0.0",
  "status": "running"
}
```

**If you see an error about "router.php not found":**
- ❌ Server is running from wrong directory
- ✅ Stop the server (Ctrl+C)
- ✅ Use one of the methods above to restart correctly

### Test 2: Check Categories Endpoint
Open browser and go to: **http://localhost:8000/api/categories**

**Expected Response:**
```json
{
  "success": true,
  "categories": [...]
}
```

---

## 🐛 Troubleshooting

### Problem: "Failed to open stream: No such file or directory"

**Cause:** Server is running from wrong directory

**Solution:**
1. Stop the server (Ctrl+C in the terminal)
2. Make sure you're in the `backend` directory
3. Run: `php -S localhost:8000 router.php`

### Problem: "Address already in use"

**Cause:** Server is already running

**Solution:**
```powershell
# Stop all PHP processes
Get-Process | Where-Object {$_.ProcessName -eq "php"} | Stop-Process -Force

# Then restart the server
cd backend
php -S localhost:8000 router.php
```

### Problem: Port 8000 is used by another application

**Solution:**
Use a different port:
```bash
php -S localhost:8001 router.php
```

Then update frontend API URL in `frontend/src/contexts/AuthContext.js`:
```javascript
const API_URL = 'http://localhost:8001/api';
```

---

## 📋 Quick Checklist

Before testing the application:

- [ ] Backend server is running from `backend` directory
- [ ] Backend shows: "Development Server (http://localhost:8000) started"
- [ ] http://localhost:8000/api returns JSON (not an error)
- [ ] Frontend server is running
- [ ] Frontend shows: "webpack compiled successfully"
- [ ] Browser opens to http://localhost:3000

---

## 🎯 Current Status

Based on your terminal output:

✅ **Backend server started** (but may be from wrong directory)  
❓ **Need to verify** it's working correctly  

**Next Steps:**
1. Stop the current server (Ctrl+C)
2. Use **START_BACKEND_CORRECTLY.bat** to restart
3. Test http://localhost:8000/api
4. If you see JSON response, you're good to go!

---

## 💡 Pro Tips

1. **Always start backend from the `backend` directory**
2. **Keep both terminal windows open** while testing
3. **Check terminal for errors** if something doesn't work
4. **Use batch files** for easiest startup
5. **Restart backend after code changes** to PHP files

---

## 🔗 Quick Links

After servers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Test Login:** http://localhost:3000/login
- **Browse Books:** http://localhost:3000/browse

---

**Remember:** The backend MUST run from the `backend` directory! 🎯

