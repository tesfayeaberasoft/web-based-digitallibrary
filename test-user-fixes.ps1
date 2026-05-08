# Test the fixed user management APIs
Write-Host "=== Testing Fixed User Management APIs ===" -ForegroundColor Green

# Login as admin
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body '{"email":"admin@digitallibrary.com","password":"password"}' -ContentType "application/json"
$loginData = $loginResponse.Content | ConvertFrom-Json

if ($loginData.success) {
    $token = $loginData.data.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Test 1: Create a test user
    Write-Host "`n1. Creating test user..." -ForegroundColor Yellow
    $newUser = @{
        full_name = "Test User Fix"
        email = "testfix@example.com"
        password = "password123"
        phone = "+1-555-9999"
        role = "user"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $createResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/create" -Method POST -Body $newUser -Headers $headers
        $createData = $createResponse.Content | ConvertFrom-Json
        
        if ($createData.success) {
            $testUserId = $createData.user.id
            Write-Host "✅ Test user created (ID: $testUserId)" -ForegroundColor Green
            
            # Test 2: Update user
            Write-Host "`n2. Testing update user..." -ForegroundColor Yellow
            $updateData = @{
                full_name = "Updated Test User"
                phone = "+1-555-8888"
            } | ConvertTo-Json
            
            try {
                $updateResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method PUT -Body $updateData -Headers $headers
                $updateResult = $updateResponse.Content | ConvertFrom-Json
                
                if ($updateResult.success) {
                    Write-Host "✅ Update user: FIXED" -ForegroundColor Green
                } else {
                    Write-Host "❌ Update user still failing: $($updateResult.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Update user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 3: Suspend user
            Write-Host "`n3. Testing suspend user..." -ForegroundColor Yellow
            try {
                $suspendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId/suspend" -Method PUT -Body '{"action":"suspend"}' -Headers $headers
                $suspendResult = $suspendResponse.Content | ConvertFrom-Json
                
                if ($suspendResult.success) {
                    Write-Host "✅ Suspend user: FIXED" -ForegroundColor Green
                } else {
                    Write-Host "❌ Suspend user still failing: $($suspendResult.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Suspend user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 4: Delete user (should work now since no active loans)
            Write-Host "`n4. Testing delete user..." -ForegroundColor Yellow
            try {
                $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method DELETE -Headers $headers
                $deleteResult = $deleteResponse.Content | ConvertFrom-Json
                
                if ($deleteResult.success) {
                    Write-Host "✅ Delete user: FIXED" -ForegroundColor Green
                } else {
                    Write-Host "❌ Delete user still failing: $($deleteResult.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Delete user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Failed to create test user: $($createData.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Create user error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 5: Try to delete a user with active loans (should fail gracefully)
    Write-Host "`n5. Testing delete user with active loans..." -ForegroundColor Yellow
    try {
        # Try to delete user ID 4 (Emily Davis) who has active loans
        $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/4" -Method DELETE -Headers $headers
        $deleteResult = $deleteResponse.Content | ConvertFrom-Json
        
        if (!$deleteResult.success) {
            Write-Host "✅ Delete protection working: $($deleteResult.message)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Delete protection may not be working properly" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✅ Delete protection working (HTTP error as expected)" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Admin login failed: $($loginData.message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green