# Test specific routes that are failing
Write-Host "=== Testing User Management Routes ===" -ForegroundColor Green

# Login first
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body '{"email":"admin@digitallibrary.com","password":"password"}' -ContentType "application/json"
$loginData = $loginResponse.Content | ConvertFrom-Json

if ($loginData.success) {
    $token = $loginData.data.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Test 1: Check if DELETE route exists
    Write-Host "`n=== Testing DELETE Route ===" -ForegroundColor Yellow
    try {
        # Try to delete a non-existent user to test routing
        $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/999999" -Method DELETE -Headers $headers
        Write-Host "DELETE route exists - Response: $($deleteResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "DELETE route error:" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
    
    # Test 2: Check if PUT route exists
    Write-Host "`n=== Testing PUT Route ===" -ForegroundColor Yellow
    try {
        # Try to update a non-existent user to test routing
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/999999" -Method PUT -Body '{"full_name":"Test"}' -Headers $headers
        Write-Host "PUT route exists - Response: $($updateResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "PUT route error:" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
    
    # Test 3: Test with a real user
    Write-Host "`n=== Testing with Real User ===" -ForegroundColor Yellow
    
    # First get the list of users
    try {
        $listResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/list" -Method GET -Headers $headers
        $listData = $listResponse.Content | ConvertFrom-Json
        
        if ($listData.success -and $listData.users.Count -gt 0) {
            # Find a user that's not admin and has no active loans
            $testUser = $null
            foreach ($user in $listData.users) {
                if ($user.role -ne "admin" -and $user.active_loans -eq 0) {
                    $testUser = $user
                    break
                }
            }
            
            if ($testUser) {
                Write-Host "Found test user: $($testUser.full_name) (ID: $($testUser.id))" -ForegroundColor Cyan
                
                # Test update
                Write-Host "`nTesting UPDATE on real user..." -ForegroundColor Yellow
                try {
                    $updateData = @{
                        full_name = $testUser.full_name + " (Updated)"
                    } | ConvertTo-Json
                    
                    $updateResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$($testUser.id)" -Method PUT -Body $updateData -Headers $headers
                    Write-Host "✅ UPDATE successful: $($updateResponse.Content)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ UPDATE failed:" -ForegroundColor Red
                    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    if ($_.Exception.Response) {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $responseBody = $reader.ReadToEnd()
                        Write-Host "Response: $responseBody" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "No suitable test user found (all have active loans or are admins)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "Failed to get user list" -ForegroundColor Red
    }
    
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}

Write-Host "`n=== Route Test Complete ===" -ForegroundColor Green