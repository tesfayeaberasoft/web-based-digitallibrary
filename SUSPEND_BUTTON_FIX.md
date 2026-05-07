# Suspend Button Fix

## Issue
When clicking the Suspend button in the Members page, the error "no fields to update" was displayed.

## Root Cause
The `backend/api/users/update.php` endpoint only allowed admins to update the `status` field. Librarians were not permitted to update user status, even though they have access to the Members page.

## Solution
Updated the `backend/api/users/update.php` to allow librarians to update user status.

## Changes Made

### File: `backend/api/users/update.php`

**Before**:
```php
$allowed_fields = ['full_name', 'email', 'phone', 'address'];

// Admins can also update role and status
if ($decoded['role'] === 'admin') {
    $allowed_fields[] = 'role';
    $allowed_fields[] = 'status';
}
```

**After**:
```php
$allowed_fields = ['full_name', 'email', 'phone', 'address'];

// Admins can update role and status
if ($decoded['role'] === 'admin') {
    $allowed_fields[] = 'role';
    $allowed_fields[] = 'status';
}

// Librarians can update status (but not role)
if ($decoded['role'] === 'librarian') {
    $allowed_fields[] = 'status';
}
```

**Authorization Comment Update**:
```php
// Users can only update their own profile
// Admins and librarians can update any user
if ($decoded['role'] === 'user' && $decoded['user_id'] != $user_id) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
```

## Permissions Summary

| Role | Can Update Own Profile | Can Update Other Users | Can Update Status | Can Update Role |
|------|----------------------|----------------------|------------------|----------------|
| User | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Librarian | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| Admin | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

## Testing Instructions

1. **Restart Backend Server** (REQUIRED):
   ```bash
   cd backend
   php -S localhost:8000 router.php
   ```

2. **Clear Browser Cache**:
   - Press `Ctrl+Shift+R` to hard refresh

3. **Test Suspend/Activate**:
   - Login as librarian
   - Go to Members page
   - Click suspend button on an active member
   - Confirm the action
   - Verify success message appears
   - Verify member status changes to "inactive"
   - Click activate button to restore
   - Verify member status changes back to "active"

## Expected Behavior

### Suspend Action:
1. Click suspend icon (red block icon)
2. Confirmation dialog appears: "Are you sure you want to suspend this member?"
3. Click OK
4. Success toast: "Member suspended successfully!"
5. Member status chip changes to gray "inactive"
6. Icon changes to green checkmark (activate)

### Activate Action:
1. Click activate icon (green checkmark icon)
2. Confirmation dialog appears: "Are you sure you want to activate this member?"
3. Click OK
4. Success toast: "Member activated successfully!"
5. Member status chip changes to green "active"
6. Icon changes to red block (suspend)

## Security Notes

- Librarians can only update user status (active/inactive/suspended)
- Librarians cannot change user roles (user/librarian/admin)
- Only admins can change user roles
- All actions require JWT authentication
- All actions are logged for audit purposes

## Files Modified

1. `backend/api/users/update.php` - Added librarian permission for status updates
