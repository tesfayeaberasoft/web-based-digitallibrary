# Testing Guide - Digital Library Management System

## Overview

This guide provides comprehensive testing procedures for the Digital Library Management System to ensure all features work correctly.

## Prerequisites

- System is installed and running (see SETUP.md)
- Database is populated with sample data
- Both frontend (localhost:3000) and backend (localhost:8000) are running

## Test Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@digitallibrary.com | password | Full system access |
| Librarian | sarah@library.com | password | Book management |
| User | john.doe@example.com | password | Regular user features |

## Testing Checklist

### 1. Authentication Tests

#### Registration
- [ ] Navigate to `/register`
- [ ] Fill in all required fields
- [ ] Test validation (invalid email, short password)
- [ ] Complete multi-step registration
- [ ] Verify success message
- [ ] Check new user in database

**Expected Result:** New user account created successfully

#### Login
- [ ] Navigate to `/login`
- [ ] Test with invalid credentials (should fail)
- [ ] Test with valid credentials (should succeed)
- [ ] Verify JWT token is stored in localStorage
- [ ] Check redirect based on user role
  - Admin → `/admin`
  - Librarian → `/librarian`
  - User → `/dashboard`

**Expected Result:** Successful login with appropriate redirect

#### Quick Access Demo Buttons
- [ ] Click "User" chip - credentials auto-fill
- [ ] Click "Librarian" chip - credentials auto-fill
- [ ] Click "Admin" chip - credentials auto-fill
- [ ] Login with auto-filled credentials

**Expected Result:** Quick login for testing different roles

#### Token Verification
- [ ] Login successfully
- [ ] Refresh the page
- [ ] Verify user remains logged in
- [ ] Check Authorization header in API calls

**Expected Result:** Session persists across page refreshes

#### Logout
- [ ] Click user avatar in navbar
- [ ] Click "Logout"
- [ ] Verify redirect to home page
- [ ] Check localStorage is cleared
- [ ] Try accessing protected route

**Expected Result:** User logged out, redirected, cannot access protected routes

---

### 2. Admin Dashboard Tests

Login as: `admin@digitallibrary.com` / `password`

#### Overview Page (`/admin`)
- [ ] Verify all 6 stat cards display correctly:
  - Total Users: 5,234
  - Total Books: 10,234
  - Active Loans: 856
  - Revenue: $45,678
  - Librarians: 12
  - Fines Collected: $2,345
- [ ] Check percentage changes are visible
- [ ] Verify Monthly Circulation chart displays
- [ ] Verify Revenue Trend chart displays
- [ ] Check Category Distribution section
- [ ] Verify Recent Activities list shows 4 items

**Expected Result:** Dashboard displays all statistics and charts correctly

#### Users Management (`/admin/users`)
- [ ] Verify user table displays
- [ ] Check all columns are visible:
  - User info with avatar
  - User ID
  - Contact info
  - Books Issued count
  - Fines amount
  - Status badge
  - Member Since date
  - Actions menu
- [ ] Test search functionality
- [ ] Click "Add User" button
- [ ] Verify dialog opens
- [ ] Click actions menu (three dots)
- [ ] Verify menu options:
  - Edit User
  - View Details
  - Suspend User
  - Delete User

**Expected Result:** User management interface fully functional

#### Librarians Management (`/admin/librarians`)
- [ ] Verify 3 librarian cards display
- [ ] Check each card shows:
  - Avatar with initials
  - Name and email
  - Books Managed count
  - Performance percentage with progress bar
  - Status badge
  - Action buttons (View, Edit, Delete)
- [ ] Click "Add Librarian" button
- [ ] Verify action buttons respond

**Expected Result:** Librarian cards display with all information

#### Analytics (`/admin/analytics`)
- [ ] Verify 3 gradient metric cards:
  - Collection Rate: 92%
  - User Satisfaction: 4.8/5
  - Avg Processing Time: 2.3h
- [ ] Check Performance Overview chart displays
- [ ] Verify chart shows 5 months of data
- [ ] Check legend shows Books, Users, Revenue

**Expected Result:** Analytics page displays metrics and charts

#### Settings (`/admin/settings`)
- [ ] Verify settings form displays
- [ ] Check all fields are editable:
  - Library Name
  - Maximum Borrow Days
  - Fine Per Day
  - Maximum Books Per User
- [ ] Modify a setting
- [ ] Click "Save Settings"
- [ ] Verify success notification

**Expected Result:** Settings can be viewed and updated

---

### 3. Librarian Dashboard Tests

Login as: `sarah@library.com` / `password`

#### Overview Page (`/librarian`)
- [ ] Verify 3 gradient stat cards:
  - Issued Books: 856
  - Total Books: 10,234
  - Active Members: 5,234
- [ ] Check 3 action buttons:
  - Issue Book (blue gradient)
  - Return Book (pink gradient)
  - Add Member (cyan gradient)
- [ ] Click each action button
- [ ] Verify buttons are interactive

**Expected Result:** Librarian dashboard displays stats and action buttons

#### Inventory (`/librarian/inventory`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** Inventory page accessible (full implementation pending)

#### Requests (`/librarian/requests`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** Requests page accessible (full implementation pending)

---

### 4. User Dashboard Tests

Login as: `john.doe@example.com` / `password`

#### Overview Page (`/dashboard`)
- [ ] Verify 4 stat cards display:
  - Books Read: 47 (+12)
  - Reading Streak: 12 days (+2)
  - Total Hours: 156 (+24)
  - Achievements: 8/12 (+2)
- [ ] Check each card has:
  - Colored avatar icon
  - Label
  - Large number
  - Change indicator

**Expected Result:** User dashboard shows reading statistics

#### Profile (`/profile`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** Profile page accessible (full implementation pending)

#### My Books (`/my-books`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** My Books page accessible (full implementation pending)

#### History (`/history`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** History page accessible (full implementation pending)

#### Achievements (`/achievements`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** Achievements page accessible (full implementation pending)

---

### 5. Public Pages Tests

Logout or use incognito mode

#### Home Page (`/`)
- [ ] Verify hero section displays
- [ ] Check "Welcome to Your Digital Library" heading
- [ ] Verify "Get Started" and "Learn More" buttons
- [ ] Check "Our Impact in Numbers" section
- [ ] Verify 4 stat cards:
  - 10,000+ Total Books
  - 5,000+ Active Members
  - 100K+ Reading Hours
  - 4.8 Avg Rating
- [ ] Click "Get Started" → redirects to `/register`
- [ ] Click "Learn More" → redirects to `/browse`

**Expected Result:** Home page displays marketing content correctly

#### Browse Books (`/browse`)
- [ ] Verify page title displays
- [ ] Check description text

**Expected Result:** Browse page accessible (full implementation pending)

---

### 6. Navigation Tests

#### Navbar
- [ ] Verify navbar displays on all pages
- [ ] Check "Digital Library" title with book icon
- [ ] When logged in:
  - [ ] Verify user name displays
  - [ ] Check notification bell icon (badge shows 3)
  - [ ] Click notification icon
  - [ ] Click user avatar
  - [ ] Verify dropdown menu shows:
    - Dashboard
    - My Profile
    - Logout
- [ ] When logged out:
  - [ ] Verify "Login" and "Register" buttons display

**Expected Result:** Navbar adapts based on authentication state

#### Sidebar (Logged In)
- [ ] Verify sidebar displays on dashboard pages
- [ ] Check menu items based on role:
  - **Admin:** Overview, Analytics, Users, Librarians, Settings
  - **Librarian:** Overview, Requests, Inventory, Members, Reports
  - **User:** Overview, My Books, History, Reading Goals, Achievements
- [ ] Click each menu item
- [ ] Verify active state highlighting (teal background)
- [ ] Check "System Health" indicator shows "Healthy"
- [ ] Verify role-specific action button:
  - Admin/Librarian: "Export Report"
  - User: "Browse Books"

**Expected Result:** Sidebar shows role-appropriate menu items

---

### 7. Responsive Design Tests

#### Desktop (1920x1080)
- [ ] All elements display correctly
- [ ] Sidebar is visible
- [ ] Charts are full width
- [ ] Cards are in grid layout

#### Tablet (768x1024)
- [ ] Layout adjusts appropriately
- [ ] Sidebar may collapse
- [ ] Cards stack in 2 columns
- [ ] Touch targets are adequate

#### Mobile (375x667)
- [ ] Mobile-friendly layout
- [ ] Sidebar becomes hamburger menu
- [ ] Cards stack vertically
- [ ] Text is readable
- [ ] Buttons are touch-friendly

**Expected Result:** Responsive design works across all screen sizes

---

### 8. API Tests

Use browser DevTools Network tab or Postman

#### Authentication Endpoints

**POST /api/auth/login**
```json
{
  "email": "john.doe@example.com",
  "password": "password"
}
```
- [ ] Returns 200 with token and user data
- [ ] Invalid credentials return 401

**POST /api/auth/register**
```json
{
  "full_name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1-555-0000"
}
```
- [ ] Returns 201 on success
- [ ] Duplicate email returns 409

**GET /api/auth/verify**
- [ ] With valid token returns 200
- [ ] Without token returns 401
- [ ] With expired token returns 401

#### User Endpoints

**GET /api/users** (Admin only)
- [ ] Returns paginated user list
- [ ] Includes user statistics
- [ ] Supports search parameter
- [ ] Supports role filter
- [ ] Supports status filter

#### Book Endpoints

**GET /api/books**
- [ ] Returns paginated book list
- [ ] Includes category information
- [ ] Includes ratings and reviews
- [ ] Supports search parameter
- [ ] Supports category filter
- [ ] Supports availability filter

**Expected Result:** All API endpoints return correct data

---

### 9. Security Tests

#### Authentication
- [ ] Cannot access protected routes without login
- [ ] JWT token expires after 24 hours
- [ ] Token is validated on each request
- [ ] Logout clears token

#### Authorization
- [ ] User cannot access admin routes
- [ ] User cannot access librarian routes
- [ ] Librarian cannot access admin-only features
- [ ] API returns 403 for unauthorized access

#### Input Validation
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] Email validation works
- [ ] Password requirements enforced

**Expected Result:** Security measures prevent unauthorized access

---

### 10. Database Tests

Connect to MySQL and verify:

#### Data Integrity
```sql
-- Check user count
SELECT COUNT(*) FROM users;
-- Should return 8 (1 admin, 3 librarians, 4 users)

-- Check book count
SELECT COUNT(*) FROM books;
-- Should return 8

-- Check active loans
SELECT COUNT(*) FROM book_loans WHERE status = 'active';
-- Should return 5

-- Check categories
SELECT COUNT(*) FROM categories;
-- Should return 12
```

#### Relationships
```sql
-- Verify foreign keys
SELECT * FROM book_loans 
JOIN users ON book_loans.user_id = users.id
JOIN books ON book_loans.book_id = books.id;

-- Check reservations
SELECT * FROM book_reservations
WHERE status = 'pending';
```

**Expected Result:** Database contains sample data with proper relationships

---

## Performance Tests

### Page Load Times
- [ ] Home page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Book list loads in < 2 seconds
- [ ] API responses in < 500ms

### Concurrent Users
- [ ] System handles 10 simultaneous users
- [ ] No database deadlocks
- [ ] No memory leaks

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected Result:** Consistent behavior across browsers

---

## Bug Reporting

If you find issues:

1. **Document the bug:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/videos
   - Browser and OS

2. **Report on GitHub:**
   - Create an issue at: https://github.com/tesfayeaberasoft/web-based-digitallibrary/issues
   - Use appropriate labels (bug, enhancement, etc.)

---

## Test Results Template

```
Test Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

Authentication: ✅ Pass / ❌ Fail
Admin Dashboard: ✅ Pass / ❌ Fail
Librarian Dashboard: ✅ Pass / ❌ Fail
User Dashboard: ✅ Pass / ❌ Fail
Public Pages: ✅ Pass / ❌ Fail
Navigation: ✅ Pass / ❌ Fail
Responsive Design: ✅ Pass / ❌ Fail
API Endpoints: ✅ Pass / ❌ Fail
Security: ✅ Pass / ❌ Fail
Database: ✅ Pass / ❌ Fail

Issues Found: [Number]
Critical Issues: [Number]
Notes: [Additional comments]
```

---

## Automated Testing (Future)

Planned automated tests:
- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Cypress
- API tests with Postman/Newman
- Load tests with Apache JMeter

---

## Support

For testing assistance:
- GitHub Issues: https://github.com/tesfayeaberasoft/web-based-digitallibrary/issues
- Documentation: See SETUP.md and README.md