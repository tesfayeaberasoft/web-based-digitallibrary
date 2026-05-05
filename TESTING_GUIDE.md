# 🧪 Testing Guide - Borrow Books Feature

## Current Situation

The borrow functionality is **working correctly**! ✅

The error "User has reached maximum loan limit (5 books)" means the system is working as designed.

## Test Users and Their Current Loans

### ❌ John Doe (john.doe@example.com)
- **Password:** password
- **Active Loans:** 5/5 (LIMIT REACHED)
- **Status:** Cannot borrow more books
- **Books borrowed:**
  1. The Great Gatsby
  2. 1984
  3. Pride and Prejudice
  4. To Kill a Mockingbird
  5. The Catcher in the Rye

### ✅ Jane Smith (jane.smith@example.com)
- **Password:** password
- **Active Loans:** 1/5
- **Status:** Can borrow 4 more books
- **Books borrowed:** The Great Gatsby

### ✅ Bob Johnson (bob.johnson@example.com)
- **Password:** password
- **Active Loans:** 1/5
- **Status:** Can borrow 4 more books
- **Books borrowed:** Pride and Prejudice

### ✅ tesfa (tesfa@gmail.com)
- **Password:** (your password)
- **Active Loans:** 0/5
- **Status:** Can borrow 5 books

### ✅ Alice Brown (alice.brown@example.com)
- **Password:** password
- **Active Loans:** 0/5
- **Status:** Can borrow 5 books

### ✅ Charlie Wilson (charlie.wilson@example.com)
- **Password:** password
- **Active Loans:** 0/5
- **Status:** Can borrow 5 books

---

## How to Test Borrowing

### Option 1: Login as a Different User

1. **Logout** from current account
2. **Login** as one of these users:
   - Email: `jane.smith@example.com` or `bob.johnson@example.com` or `tesfa@gmail.com`
   - Password: `password` (or your password for tesfa)
3. Go to **Browse Books**
4. Click **"Borrow"** on any available book
5. **Success!** ✅

### Option 2: Clear John Doe's Loans

If you want to continue using John Doe's account, run this command:

```bash
cd backend
php clear_user_loans.php
```

This will return all of John Doe's books so he can borrow again.

---

## System Limits

- **Maximum loans per user:** 5 books
- **Loan duration:** 14 days
- **Fine for overdue:** $5 per day

These limits are working correctly! The system is preventing users from borrowing more than 5 books at once.

---

## Testing Checklist

- [ ] Login as user with available loan slots
- [ ] Browse books page loads
- [ ] Click "Borrow" button
- [ ] Confirm in dialog
- [ ] See success message
- [ ] Book appears in "My Books"
- [ ] Available copies decrease
- [ ] Try borrowing 6th book (should fail with limit message)

---

## Expected Behavior

### ✅ When user has < 5 loans:
- Borrow button works
- Success message appears
- Book is added to user's loans
- Available copies decrease

### ✅ When user has 5 loans:
- Error message: "User has reached maximum loan limit (5 books)"
- This is **correct behavior**!
- User must return a book before borrowing another

### ✅ When book has 0 copies:
- Button shows "Reserve"
- Creates reservation instead of loan
- User gets queue position

---

## Quick Fix: Clear John Doe's Loans

Create this file: `backend/clear_user_loans.php`

```php
<?php
require_once 'config/database.php';

$db = Database::getInstance()->getConnection();

// Return all of John Doe's books
$stmt = $db->prepare("
    UPDATE book_loans 
    SET status = 'returned', return_date = CURDATE()
    WHERE user_id = (SELECT id FROM users WHERE email = 'john.doe@example.com')
    AND status = 'active'
");
$stmt->execute();

echo "Cleared " . $stmt->rowCount() . " loans for John Doe\n";

// Update book availability
$db->exec("
    UPDATE books b
    SET available_copies = total_copies - (
        SELECT COUNT(*) 
        FROM book_loans bl 
        WHERE bl.book_id = b.id AND bl.status = 'active'
    )
");

echo "Updated book availability\n";
echo "John Doe can now borrow books again!\n";
?>
```

Then run:
```bash
php clear_user_loans.php
```

---

## Summary

🎉 **The borrow functionality is working perfectly!**

The error you're seeing is **expected behavior** - the system is correctly enforcing the 5-book limit.

**To test successfully:**
1. Login as a different user (jane.smith@example.com)
2. Or clear John Doe's loans using the script above
3. Then try borrowing - it will work! ✅

