# Test Admin User Management APIs
Write-Host "=== Testing Admin User Management APIs ===" -ForegroundColor Green

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
    
    # Test 1: List Users
    Write-Host "`n1. Testing List Users API..." -ForegroundColor Yellow
    try {
        $listResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/list" -Method GET -Headers $headers
        $listData = $listResponse.Content | ConvertFrom-Json
        
        if ($listData.success) {
            Write-Host "✅ List users: OK (Found $($listData.users.Count) users)" -ForegroundColor Green
        } else {
            Write-Host "❌ List users failed: $($listData.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ List users error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 2: Create User
    Write-Host "`n2. Testing Create User API..." -ForegroundColor Yellow
    $newUser = @{
        full_name = "Test User"
        email = "testuser@example.com"
        password = "password123"
        phone = "+1-555-0123"
        address = "123 Test Street"
        role = "user"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $createResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/create" -Method POST -Body $newUser -Headers $headers
        $createData = $createResponse.Content | ConvertFrom-Json
        
        if ($createData.success) {
            $testUserId = $createData.user.id
            Write-Host "✅ Create user: OK (ID: $testUserId)" -ForegroundColor Green
            
            # Test 3: Get User Details
            Write-Host "`n3. Testing Get User Details API..." -ForegroundColor Yellow
            try {
                $detailsResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method GET -Headers $headers
                $detailsData = $detailsResponse.Content | ConvertFrom-Json
                
                if ($detailsData.success) {
                    Write-Host "✅ Get user details: OK" -ForegroundColor Green
                    Write-Host "   - Name: $($detailsData.user.full_name)" -ForegroundColor Cyan
                    Write-Host "   - Email: $($detailsData.user.email)" -ForegroundColor Cyan
                    Write-Host "   - Active Loans: $($detailsData.user.active_loans)" -ForegroundColor Cyan
                } else {
                    Write-Host "❌ Get user details failed: $($detailsData.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Get user details error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 4: Suspend User
            Write-Host "`n4. Testing Suspend User API..." -ForegroundColor Yellow
            try {
                $suspendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId/suspend" -Method PUT -Body '{"action":"suspend"}' -Headers $headers
                $suspendData = $suspendResponse.Content | ConvertFrom-Json
                
                if ($suspendData.success) {
                    Write-Host "✅ Suspend user: OK" -ForegroundColor Green
                } else {
                    Write-Host "❌ Suspend user failed: $($suspendData.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Suspend user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 5: Activate User
            Write-Host "`n5. Testing Activate User API..." -ForegroundColor Yellow
            try {
                $activateResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId/suspend" -Method PUT -Body '{"action":"activate"}' -Headers $headers
                $activateData = $activateResponse.Content | ConvertFrom-Json
                
                if ($activateData.success) {
                    Write-Host "✅ Activate user: OK" -ForegroundColor Green
                } else {
                    Write-Host "❌ Activate user failed: $($activateData.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Activate user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            # Test 6: Delete User
            Write-Host "`n6. Testing Delete User API..." -ForegroundColor Yellow
            try {
                $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method DELETE -Headers $headers
                $deleteData = $deleteResponse.Content | ConvertFrom-Json
                
                if ($deleteData.success) {
                    Write-Host "✅ Delete user: OK" -ForegroundColor Green
                } else {
                    Write-Host "❌ Delete user failed: $($deleteData.message)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Delete user error: $($_.Exception.Message)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Create user failed: $($createData.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Create user error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Admin login failed: $($loginData.message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green