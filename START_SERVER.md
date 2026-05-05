# 🚀 How to Start the Digital Library System

## Quick Start Guide

### Step 1: Stop Any Running PHP Server

If you have a PHP server already running, stop it first:

**Windows (PowerShell):**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*php*"} | Stop-Process
```

**Or manually:** Press `Ctrl+C` in the terminal where PHP is running.

---

### Step 2: Start Backend Server

Open a terminal and run:

```bash
cd backend
php -S localhost:8000 router.php
```

**✅ You should see:**
```
PHP 7.4.x Development Server (http://localhost:8000) started
```

**⚠️ Important:** You MUST use `router.php` - this handles CORS and routing for the API.

---

### Step 3: Start Frontend Server

Open a **NEW** terminal (keep the backend running) and run:

```bash
cd frontend
npm start
```

**✅ You should see:**
```
Compiled successfully!
You can now view digital-library in the browser.
Local: http://localhost:3000
```

---

### Step 4: Login

The browser should automatically open to `http://localhost:3000`

**Quick Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| 👤 User | john.doe@example.com | password |
| 📚 Librarian | sarah@library.com | password |
| 👑 Admin | admin@digitallibrary.com | password |

**Tip:** On the login page, click the colored chips (User/Librarian/Admin) to auto-fill credentials!

---

## Troubleshooting

### Problem: "Login failed. Please try again."

**Cause:** Backend server not started with `router.php`

**Solution:**
1. Stop the PHP server (Ctrl+C)
2. Restart with: `php -S localhost:8000 router.php`

---

### Problem: "404: OPTIONS /api/auth/login - No such file or directory"

**Cause:** Started server without router.php

**Solution:**
```bash
# WRONG ❌
php -S localhost:8000

# CORRECT ✅
php -S localhost:8000 router.php
```

---

### Problem: "Network Error" or "CORS Error"

**Cause:** Backend not running or wrong port

**Solution:**
1. Check backend is running on port 8000
2. Check frontend is running on port 3000
3. Restart both servers

---

### Problem: Database Connection Error

**Cause:** Database not created or credentials wrong

**Solution:**
1. Open MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create database:
   ```sql
   CREATE DATABASE digital_library;
   exit;
   ```

3. Import schema:
   ```bash
   mysql -u root -p digital_library < database/schema.sql
   mysql -u root -p digital_library < database/sample_data.sql
   ```

4. Check credentials in `backend/config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'digital_library');
   define('DB_USER', 'root');
   define('DB_PASS', ''); // Your MySQL password
   ```

---

## Verify Everything is Working

### Test Backend API

Open a new terminal and run:

```bash
curl http://localhost:8000/api
```

**Expected response:**
```json
{
  "success": true,
  "message": "Digital Library Management System API",
  "version": "1.0.0"
}
```

### Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitallibrary.com","password":"password"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {...}
}
```

---

## Common Commands

### Check if ports are in use

**Windows:**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

### Kill process on port

**Windows:**
```powershell
# Find process ID
netstat -ano | findstr :8000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## Need More Help?

- 📖 Full Setup Guide: `SETUP.md`
- 🧪 Testing Guide: `TESTING_GUIDE.md`
- 🚀 Deployment Guide: `DEPLOYMENT.md`
- 📚 API Documentation: `API_DOCUMENTATION.md`
- ⚡ Quick Reference: `QUICK_REFERENCE.md`

---

## Summary

**Always remember:**
1. ✅ Start backend with: `php -S localhost:8000 router.php`
2. ✅ Start frontend with: `npm start`
3. ✅ Use the quick login chips on the login page
4. ✅ Keep both terminals running

**Happy coding! 🎉**
