# Testing Deployment - Detailed Test Cases

## 🧪 Complete Testing Guide for InfinityFree Deployment

After deploying your fixes, follow these detailed test cases to ensure everything works correctly.

---

## Test Suite 1: Book Management 📚

### Test Case 1.1: Create a New Book

**Prerequisites:**
- Logged in as librarian or admin
- At Inventory page

**Steps:**
1. Click "Add New Book" button
2. Fill in the form:
   ```
   Title: "The Great Gatsby"
   Author: "F. Scott Fitzgerald"
   ISBN: "9780743273565"
   Publisher: "Scribner"
   Publication Year: 1925
   Category: Fiction
   Total Copies: 3
   Available Copies: (auto-fills to 3)
   Pages: 180
   Language: English
   Description: "A novel set in the Jazz Age..."
   Condition: Good
   ```
3. Click "Add Book"

**Expected Results:**
✅ Success toast appears: "Book created successfully"
✅ Modal closes automatically
✅ Book appears at the top of inventory list
✅ Book details match entered data
✅ Available copies = Total copies (3)

**Database Verification:**
```sql
SELECT * FROM books WHERE isbn = '9780743273565';
-- Should return 1 row with all correct data
-- created_at and updated_at should be current timestamp
```

### Test Case 1.2: Verify Book in Browse Page

**Steps:**
1. Navigate to Browse Books (public page)
2. Look for "The Great Gatsby" in the list
3. (Optional) Use search: type "Gatsby"

**Expected Results:**
✅ Book appears in browse page
✅ Cover image displays (or placeholder)
✅ Title, author, and description are correct
✅ "Available" badge shows
✅ "Borrow" button is enabled
✅ Category tag shows "Fiction"

### Test Case 1.3: Create Book with Digital Content

**Steps:**
1. Click "Add New Book"
2. Fill basic info
3. In "Digital Content" section:
   - Select file type: PDF or EPUB
   - Upload a test PDF/EPUB file (< 50MB)
4. Submit

**Expected Results:**
✅ Upload progress shows
✅ Success message appears
✅ Book shows "Read Online" badge in browse page
✅ Digital content icon appears

---

## Test Suite 2: Loan Management 📖

### Test Case 2.1: Borrow a Book

**Prerequisites:**
- Logged in as regular user
- At Browse Books page
- At least one available book

**Steps:**
1. Find a book with "Available" status
2. Click "Borrow" button
3. In the dialog, review:
   - Book details
   - Loan period (default 14 days)
   - Due date calculation
4. Click "Confirm Borrow"

**Expected Results:**
✅ Success toast: "Book borrowed successfully"
✅ Book status changes to "Unavailable" if last copy
✅ Available copies decrements by 1
✅ Dialog closes

**Database Verification:**
```sql
SELECT * FROM book_loans 
WHERE status = 'active' 
AND return_date IS NULL
ORDER BY loan_date DESC 
LIMIT 1;
-- Should show the new loan with:
-- - loan_date = today
-- - due_date = today + 14 days
-- - status = 'active'
```

### Test Case 2.2: View Borrowed Books in "My Books"

**Steps:**
1. Click user menu → "My Books"
2. Verify the page loads
3. Check the "Borrowed Books" tab

**Expected Results:**
✅ Page loads without errors
✅ Borrowed book card displays with:
   - ✅ Book title and author
   - ✅ Cover image
   - ✅ Loan date (today's date)
   - ✅ Due date (today + 14 days)
   - ✅ Status badge: "Active" (green)
   - ✅ Progress bar showing time used
   - ✅ Days remaining: "14 days remaining"
   - ✅ "Return" button (enabled)
   - ✅ "Renew" button (enabled)

**Console Check:**
- Open browser console (F12)
- Should see no errors
- Network tab should show successful API call to `/api/loans?status=active`

### Test Case 2.3: Return a Book

**Steps:**
1. From "My Books" page
2. Find the borrowed book
3. Click "Return" button
4. In the dialog, click "Confirm Return"

**Expected Results:**
✅ Success message appears
✅ Book disappears from "Borrowed Books" list
✅ Book count decreases
✅ Book becomes available again in Browse page

### Test Case 2.4: Renew a Book

**Steps:**
1. Borrow a book
2. In "My Books", click "Renew"
3. Review new due date in dialog
4. Click "Confirm Renew"

**Expected Results:**
✅ Success message with new due date
✅ Due date extends by 14 more days
✅ Renewals count: "1 / 2"
✅ Status updates

### Test Case 2.5: Test Overdue Display

**Database Setup (for testing):**
```sql
-- Set a loan's due date to yesterday
UPDATE book_loans 
SET due_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
WHERE id = [your_loan_id] 
AND status = 'active';
```

**Steps:**
1. Refresh "My Books" page
2. Look for the overdue book

**Expected Results:**
✅ Status badge: "Overdue" (red)
✅ Alert message: "⚠️ Overdue by 1 day"
✅ Card has red border/accent
✅ Appears at top of list (sorted first)

### Test Case 2.6: Test Due Soon Display

**Database Setup:**
```sql
-- Set a loan's due date to 2 days from now
UPDATE book_loans 
SET due_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
WHERE id = [your_loan_id] 
AND status = 'active';
```

**Expected Results:**
✅ Status badge: "Due Soon" (yellow/orange)
✅ Alert message: "📅 2 days remaining"
✅ Card has yellow border/accent

---

## Test Suite 3: PWA Installation 📱

### Test Case 3.1: Desktop Installation (Chrome/Edge on Windows)

**Prerequisites:**
- Using Chrome or Edge browser
- Site accessed via HTTPS
- Clean browser (or cleared cache)

**Steps:**
1. Visit `https://tdigitallibrarysystem.free.nf/`
2. Wait 3-5 seconds
3. Look in address bar (right side)
4. Look for install icon: ⊕ or 🖥️ or "Install"

**If prompt appears:**
1. Click the install icon
2. Click "Install" in the popup
3. Wait for installation

**Expected Results:**
✅ Install icon appears in address bar
✅ Click shows install dialog
✅ After installing:
   - ✅ App opens in standalone window (no browser UI)
   - ✅ App icon appears in Start Menu
   - ✅ App icon appears in taskbar when open
   - ✅ Window has custom title: "Digital Library Management System"
   - ✅ Theme color (teal) applies to title bar

**Manual Installation (if automatic prompt doesn't appear):**
1. Click browser menu (⋮)
2. Look for "Install Digital Library..." or "Apps" → "Install this site as app"
3. Follow prompts

### Test Case 3.2: Android Installation

**Prerequisites:**
- Android device with Chrome
- Site accessed via HTTPS

**Steps:**
1. Open Chrome on Android
2. Visit `https://tdigitallibrarysystem.free.nf/`
3. Wait for banner at bottom OR
4. Tap menu (⋮) → "Add to Home Screen" or "Install app"

**Expected Results:**
✅ Installation banner appears, OR
✅ Menu shows "Install app" option
✅ After installing:
   - ✅ Icon appears on home screen
   - ✅ Icon has correct image (not generic Chrome icon)
   - ✅ Opens in full screen (no browser chrome)
   - ✅ Splash screen shows during launch
   - ✅ Status bar color matches theme (teal)
   - ✅ Can be found in app drawer
   - ✅ Shows in recent apps as "Digital Library"

### Test Case 3.3: iOS Installation (iPhone/iPad)

**Prerequisites:**
- iOS device with Safari
- Site accessed via HTTPS

**Important Note:** iOS Safari NEVER shows automatic install prompts. Users MUST use manual method.

**Steps:**
1. Open Safari on iOS
2. Visit `https://tdigitallibrarysystem.free.nf/`
3. Tap Share button (square with ↑ arrow)
4. Scroll down in menu
5. Tap "Add to Home Screen"
6. Edit name if desired (optional)
7. Tap "Add" (top right)

**Expected Results:**
✅ Share menu shows "Add to Home Screen" option
✅ Preview shows correct icon
✅ After adding:
   - ✅ Icon appears on home screen
   - ✅ Opens in full screen (no Safari UI)
   - ✅ Shows splash screen during launch
   - ✅ Status bar at top matches theme
   - ✅ Can swipe up to close/switch apps
   - ✅ Can long-press icon to remove like any app

### Test Case 3.4: Verify PWA Features

**After installation on any platform:**

**Test Offline Capability:**
1. Open installed app
2. Turn on Airplane Mode (or disconnect internet)
3. Try navigating to different pages
4. **Expected:** Cached shell loads (home page structure)
5. **Expected:** Message about being offline appears for un-cached content

**Test App Identity:**
1. Check app name in system
2. Check app icon quality
3. **Expected:** Shows "Digital Library" not "Chrome" or generic name
4. **Expected:** Icon is clear and recognizable

**Test Standalone Mode:**
1. Open app
2. Look for browser UI (address bar, tabs, etc.)
3. **Expected:** No browser chrome visible
4. **Expected:** Looks like a native app

### Test Case 3.5: Verify Manifest.json

**Browser DevTools Check:**
1. Visit site in browser
2. Open DevTools (F12)
3. Go to "Application" tab
4. Click "Manifest" in left sidebar

**Expected Manifest Values:**
```json
name: "Digital Library Management System"
short_name: "Digital Library"
start_url: "/"
display: "standalone"
theme_color: "#2d6b61"
icons: [
  { src: "...-192x192.png", sizes: "192x192", purpose: "any maskable" },
  { src: "...-512x512.png", sizes: "512x512", purpose: "any maskable" }
]
shortcuts: [
  { name: "Browse Books", url: "/browse" },
  { name: "My Books", url: "/my-books" }
]
```

**Icon Verification:**
- Click each icon URL in manifest
- **Expected:** Icons load without 404 errors

### Test Case 3.6: Verify Service Worker

**DevTools Check:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar

**Expected Status:**
✅ Service worker status: "activated and is running"
✅ Source: shows `/sw.js`
✅ Cache storage shows "digital-library-shell-v5"

**Test Service Worker:**
1. In DevTools, click "Update" button
2. Check console for messages: `[SW] Installing service worker...`
3. Go offline (Airplane mode)
4. Reload page
5. **Expected:** Page still loads (from cache)

---

## Test Suite 4: Complete User Journey 🛤️

### Test Case 4.1: New User Registration to Book Borrowing

**Complete Flow:**
1. ✅ Visit homepage
2. ✅ Click "Register"
3. ✅ Fill registration form
4. ✅ Submit and verify success
5. ✅ Login with new account
6. ✅ Browse books
7. ✅ Borrow a book
8. ✅ View in "My Books"
9. ✅ Verify all details correct

### Test Case 4.2: Librarian Complete Workflow

**Complete Flow:**
1. ✅ Login as librarian
2. ✅ Add new book with all fields
3. ✅ Verify book in inventory
4. ✅ Edit book details
5. ✅ Issue book to user (if available)
6. ✅ Search for issued books
7. ✅ View librarian dashboard stats
8. ✅ Check notifications

---

## 🔍 Debugging Checklist

If any test fails, check these in order:

### For Book Creation Issues:
- [ ] Check browser console for JavaScript errors
- [ ] Check Network tab for API call status
- [ ] Verify response: should be `{"success": true, "book_id": 123}`
- [ ] Check database connection in backend/.env
- [ ] Verify audit_logs table exists
- [ ] Check PHP error logs on server

### For "My Books" Issues:
- [ ] Verify user is logged in (check token in localStorage)
- [ ] Check API call to `/api/loans?status=active`
- [ ] Verify response contains loans array
- [ ] Check if loans exist in database for user
- [ ] Verify book_id references valid book
- [ ] Check for JOIN errors (missing books)

### For PWA Issues:
- [ ] Verify HTTPS (not HTTP)
- [ ] Check manifest.json loads (no 404)
- [ ] Verify icons load (check URLs in manifest)
- [ ] Check service worker registration in DevTools
- [ ] Clear browser cache and try again
- [ ] Try different browser/device
- [ ] Check for console errors
- [ ] Verify all PWA criteria met (use Lighthouse audit)

---

## 📊 Success Metrics

All tests pass when:

| Metric | Target | Status |
|--------|--------|--------|
| Book creation success rate | 100% | ⬜ |
| Books appear in browse page | 100% | ⬜ |
| Loan creation success rate | 100% | ⬜ |
| Loans appear in "My Books" | 100% | ⬜ |
| PWA installable (desktop) | Yes | ⬜ |
| PWA installable (Android) | Yes | ⬜ |
| PWA installable (iOS) | Yes* | ⬜ |
| Offline capability | Works | ⬜ |
| No console errors | 0 errors | ⬜ |
| Page load time | < 3s | ⬜ |

*iOS requires manual "Add to Home Screen" - this is normal

---

## 🎯 Performance Testing

### Lighthouse Audit (Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - ✅ Performance
   - ✅ Progressive Web App
   - ✅ Best Practices
   - ✅ Accessibility
   - ✅ SEO
4. Click "Analyze page load"

**Target Scores:**
- Performance: > 80
- PWA: > 90
- Best Practices: > 80
- Accessibility: > 90
- SEO: > 90

### PWA Specific Checks (Lighthouse)

Should PASS all these:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Manifest has name, short_name, start_url
- ✅ Manifest has icons (192px, 512px)
- ✅ Manifest display is standalone/fullscreen/minimal-ui
- ✅ Themed omnibox (theme_color)
- ✅ Content sized correctly for viewport
- ✅ Page has valid HTML doctype
- ✅ Redirects HTTP to HTTPS
- ✅ Provides a valid apple-touch-icon

---

## 📝 Test Report Template

After completing all tests, fill out:

```
Test Date: _______________
Tested By: _______________
Environment: https://tdigitallibrarysystem.free.nf/

RESULTS:
□ Book Creation: PASS / FAIL
□ Book Display: PASS / FAIL
□ Book Borrowing: PASS / FAIL
□ My Books Display: PASS / FAIL
□ PWA Install (Desktop): PASS / FAIL / N/A
□ PWA Install (Android): PASS / FAIL / N/A
□ PWA Install (iOS): PASS / FAIL / N/A
□ Offline Mode: PASS / FAIL
□ Overall User Experience: PASS / FAIL

ISSUES FOUND:
1. ___________________________________
2. ___________________________________
3. ___________________________________

NOTES:
_______________________________________
_______________________________________
```

---

Good luck with testing! 🚀
