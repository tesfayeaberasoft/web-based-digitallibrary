# Test the admin stats API with proper authentication
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body '{"email":"admin@digitallibrary.com","password":"password"}' -ContentType "application/json"
$loginData = $loginResponse.Content | ConvertFrom-Json

if ($loginData.success) {
    $token = $loginData.data.token
    Write-Host "Login successful, token received"
    
    # Test the admin stats API
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $statsResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/admin/stats" -Method GET -Headers $headers
        $statsData = $statsResponse.Content | ConvertFrom-Json
        
        if ($statsData.success) {
            Write-Host "Admin stats API working!"
            Write-Host "Analytics data:"
            Write-Host "   - Popular books: $($statsData.stats.analytics.popular_books.Count)"
            Write-Host "   - Peak hours: $($statsData.stats.analytics.peak_hours.Count)"
            Write-Host "   - Weekly patterns: $($statsData.stats.analytics.weekly_patterns.Count)"
            Write-Host "   - Collection utilization: $($statsData.stats.analytics.collection_utilization.utilization_rate)%"
            Write-Host "   - Return rate: $($statsData.stats.analytics.return_analysis.return_rate)%"
        } else {
            Write-Host "Stats API returned error: $($statsData.message)"
        }
    } catch {
        Write-Host "Stats API request failed: $($_.Exception.Message)"
    }
} else {
    Write-Host "Login failed: $($loginData.message)"
}