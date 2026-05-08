# Debug User Management APIs - Show exact errors
Write-Host "=== Debugging User Management APIs ===" -ForegroundColor Green

# Login as admin
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body '{"email":"admin@digitallibrary.com","password":"password"}' -ContentType "application/json"
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        $token = $loginData.data.token
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Create a test user first
        Write-Host "`n=== Creating Test User ===" -ForegroundColor Yellow
        $newUser = @{
            full_name = "Debug Test User"
            email = "debugtest@example.com"
            password = "password123"
            phone = "+1-555-DEBUG"
            role = "user"
            status = "active"
        } | ConvertTo-Json
        
        try {
            $createResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/create" -Method POST -Body $newUser -Headers $headers
            $createData = $createResponse.Content | ConvertFrom-Json
            
            if ($createData.success) {
                $testUserId = $createData.user.id
                Write-Host "✅ Test user created (ID: $testUserId)" -ForegroundColor Green
                
                # Test 1: Update User
                Write-Host "`n=== Testing Update User ===" -ForegroundColor Yellow
                $updateData = @{
                    full_name = "Updated Debug User"
                    phone = "+1-555-UPDATED"
                } | ConvertTo-Json
                
                try {
                    $updateResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method PUT -Body $updateData -Headers $headers
                    $updateResult = $updateResponse.Content | ConvertFrom-Json
                    Write-Host "✅ Update Response: $($updateResponse.Content)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Update Error Details:" -ForegroundColor Red
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
                    if ($_.Exception.Response) {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $responseBody = $reader.ReadToEnd()
                        Write-Host "Response Body: $responseBody" -ForegroundColor Red
                    }
                }
                
                # Test 2: Suspend User
                Write-Host "`n=== Testing Suspend User ===" -ForegroundColor Yellow
                try {
                    $suspendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId/suspend" -Method PUT -Body '{"action":"suspend"}' -Headers $headers
                    $suspendResult = $suspendResponse.Content | ConvertFrom-Json
                    Write-Host "✅ Suspend Response: $($suspendResponse.Content)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Suspend Error Details:" -ForegroundColor Red
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
                    if ($_.Exception.Response) {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $responseBody = $reader.ReadToEnd()
                        Write-Host "Response Body: $responseBody" -ForegroundColor Red
                    }
                }
                
                # Test 3: Delete User
                Write-Host "`n=== Testing Delete User ===" -ForegroundColor Yellow
                try {
                    $deleteResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/users/$testUserId" -Method DELETE -Headers $headers
                    $deleteResult = $deleteResponse.Content | ConvertFrom-Json
                    Write-Host "✅ Delete Response: $($deleteResponse.Content)" -ForegroundColor Green
                } catch {
                    Write-Host "❌ Delete Error Details:" -ForegroundColor Red
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
                    if ($_.Exception.Response) {
                        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                        $responseBody = $reader.ReadToEnd()
                        Write-Host "Response Body: $responseBody" -ForegroundColor Red
                    }
                }
                
            } else {
                Write-Host "❌ Failed to create test user: $($createData.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Create User Error:" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login failed: $($loginData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n=== Debug Complete ===" -ForegroundColor Green