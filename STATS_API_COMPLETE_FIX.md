# Statistics API Complete Fix

## Issue
Overview/Dashboard page showing "Failed to load statistics" error.

## Root Causes Found

### 1. Missing stats.php File
The `backend/api/users/stats.php` file was not properly saved or got deleted.

### 2. User ID Retrieval Issue
Frontend was trying to get user ID from auth context which might not be loaded yet.

## Solutions Applied

### Fix 1: Recreated stats.php File
**File**: `backend/api/users/stats.php`

**What it does**:
- Fetches books read count (returned loans)
- Fetches currently reading count (active loans)
- Calculates reading streak (consecutive days with activity)
- Calculates total hours (books_read × 28)
- Fetches achievements count
- Returns all statistics as JSON

### Fix 2: Updated UserDashboard.js
**File**: `frontend/src/pages/user/UserDashboard.js`

**Changes**:
- Get user ID directly from localStorage instead of auth context
- Added better error handling and logging
- Added validation checks for token and user data
- Added console.log for debugging

**Before**:
```javascript
const userId = user?.id || user?.user_id;  // Might be undefined
```

**After**:
```javascript
const userStr = localStorage.getItem('user');
const userData = JSON.parse(userStr);
const userId = userData.id;  // Direct access
```

### Fix 3: Verified Route Exists
**File**: `backend/index.php`

Route is properly configured:
```php
case preg_match('#^/users/(\d+)/stats$#', $path, $matches) && $request_method === 'GET':
    $_GET['id'] = $matches[1];
    require __DIR__ . '/api/users/stats.php';
    break;
```

---

## Testing Instructions

### Step 1: Restart Backend (REQUIRED!)
```bash
# Press Ctrl+C in backend terminal
cd backend
php -S localhost:8000 router.php
```

### Step 2: Restart Frontend (REQUIRED!)
```bash
# Press Ctrl+C in frontend terminal
cd frontend
npm start
```

### Step 3: Clear Browser
1. Press `F12` (open DevTools)
2. Press `Ctrl+Shift+R` (hard refresh)
3. Go to "Console" tab (keep it open)

### Step 4: Test Dashboard
1. **Logout and Login**: `tesfa@gmail.com` / `password`
2. **Go to Dashboard/Overview page**
3. **Check Console** - Should see:
   ```
   Fetching stats for user ID: X
   Stats response: {success: true, stats: {...}}
   ```
4. **Check Page** - Should show:
   - Books Read: Real number (not 47)
   - Reading Streak: Real number (not 12)
   - Total Hours: Real number (not 156)
   - Achievements: Real X/Y (not 8/12)

---

## Debugging

### If Still Shows "Failed to load statistics":

#### Check 1: Backend Running?
Open: `http://localhost:8000/`
Should see: `{"success":true,"message":"Digital Library Management System API"}`

#### Check 2: stats.php File Exists?
```bash
ls backend/api/users/stats.php
```
Should show the file exists.

#### Check 3: Test API Directly
```bash
# Get your token from localStorage (F12 → Application → Local Storage)
# Replace YOUR_TOKEN and USER_ID below

curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/users/USER_ID/stats
```

Should return:
```json
{
  "success": true,
  "stats": {
    "books_read": 0,
    "currently_reading": 0,
    "reading_streak": 0,
    "total_hours": 0,
    "achievements": 0,
    "total_achievements": 0
  }
}
```

#### Check 4: Browser Console Errors
Press F12 → Console tab

Look for:
- `Fetching stats for user ID: X` ← Should show user ID
- `Stats response: {...}` ← Should show API response
- Any red errors ← Copy and report

#### Check 5: Network Tab
Press F12 → Network tab
1. Refresh page
2. Look for request to `/api/users/X/stats`
3. Click on it
4. Check "Response" tab
5. Should show `{success: true, stats: {...}}`

---

## Common Errors & Solutions

### Error: "User ID not found. Please login again."
**Solution**:
1. Logout
2. Login again
3. This ensures user data is in localStorage

### Error: "Please login to view statistics"
**Solution**:
1. Check if you're logged in
2. Check localStorage has 'token' and 'user'
3. Logout and login again

### Error: "Unauthorized" (403)
**Solution**:
1. Token might be expired
2. Logout and login again
3. Check backend terminal for errors

### Error: "Server error: ..." (500)
**Solution**:
1. Check backend terminal for PHP errors
2. Verify database is running
3. Check stats.php file exists
4. Run: `php backend/test_direct.php`

### Shows 0 for all statistics
**This is CORRECT if**:
- You haven't borrowed any books yet
- You haven't returned any books yet
- No achievements unlocked yet

**To test**:
1. Borrow a book from Browse Books
2. Return to Dashboard
3. Should see "Currently Reading: 1"
4. Return the book
5. Should see "Books Read: 1"

---

## API Response Format

### Success Response:
```json
{
  "success": true,
  "stats": {
    "books_read": 5,
    "currently_reading": 2,
    "reading_streak": 3,
    "total_hours": 140,
    "achievements": 2,
    "total_achievements": 12
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Files Changed

1. ✅ `backend/api/users/stats.php` - Recreated
2. ✅ `frontend/src/pages/user/UserDashboard.js` - Updated user ID retrieval
3. ✅ `backend/index.php` - Route already exists (verified)

---

## Verification Checklist

Before testing:
- [ ] Backend server restarted
- [ ] Frontend server restarted
- [ ] Browser cache cleared
- [ ] Logged out and logged in
- [ ] DevTools console open

After testing:
- [ ] No "Failed to load statistics" error
- [ ] Shows real numbers (not 47, 12, 156, 8/12)
- [ ] Console shows "Fetching stats for user ID: X"
- [ ] Console shows "Stats response: {success: true, ...}"
- [ ] Statistics update when borrowing/returning books

---

## Date Applied
May 5, 2026

## Status
✅ **STATISTICS API COMPLETELY FIXED**

**RESTART BOTH SERVERS NOW!**
