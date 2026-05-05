# 🔄 How to Restart Servers After Fixes

## ⚠️ IMPORTANT: You MUST Restart the Backend Server!

All backend files have been updated. PHP caches the old code in memory, so you **MUST** restart the backend server for the changes to take effect.

---

## 🚀 Quick Restart Guide

### Option 1: Using Batch Files (Easiest)

#### Stop Current Servers:
1. Find the terminal windows running the servers
2. Press `Ctrl+C` in each terminal to stop them

#### Restart Backend:
1. Double-click `start-backend.bat`
2. Wait for message: "Development Server (http://localhost:8000) started"

#### Restart Frontend (if needed):
1. Double-click `start-frontend.bat`
2. Wait for message: "webpack compiled successfully"

---

### Option 2: Using Command Line

#### Stop Current Servers:
1. Press `Ctrl+C` in backend terminal
2. Press `Ctrl+C` in frontend terminal

#### Restart Backend:
```bash
cd backend
php -S localhost:8000 router.php
```

#### Restart Frontend:
```bash
cd frontend
npm start
```

---

## ✅ Verify Servers Are Running

### Check Backend:
Open browser and go to: http://localhost:8000/api

Should see:
```json
{
  "message": "Digital Library API",
  "version": "1.0.0",
  "status": "running"
}
```

### Check Frontend:
Open browser and go to: http://localhost:3000

Should see the Digital Library homepage

---

## 🧪 Test the Fixes

After restarting, test these pages:

1. **Registration:** http://localhost:3000/register
2. **Login:** http://localhost:3000/login
3. **Browse Books:** http://localhost:3000/browse
4. **My Books:** http://localhost:3000/my-books (after login)
5. **Profile:** http://localhost:3000/profile (after login)
6. **Notifications:** http://localhost:3000/notifications (after login)

All pages should now work without errors!

---

## 🐛 Still Having Issues?

### Check Backend Terminal:
- Should NOT see any 404 errors
- Should NOT see "Class not found" errors
- Should see successful API requests

### Check Browser Console (F12):
- Should NOT see 404 errors
- Should NOT see "Failed to load" errors
- Should see successful API responses

### If Problems Persist:

1. **Verify you're using the correct command:**
   ```bash
   # WRONG:
   php -S localhost:8000
   
   # CORRECT:
   php -S localhost:8000 router.php
   ```

2. **Check database is running:**
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

3. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Reload page

4. **Check file permissions:**
   - Make sure all PHP files are readable
   - Check that database.php has correct credentials

---

## 📝 Quick Reference

### Test Credentials:

**Admin:**
- Email: admin@library.com
- Password: password

**Librarian:**
- Email: sarah@library.com
- Password: password

**User:**
- Email: john.doe@example.com
- Password: password

---

**Remember:** Always restart the backend server after making changes to PHP files!

