@echo off
echo ========================================
echo Digital Library - Deployment Verifier
echo ========================================
echo.

REM Check if build directory exists
if not exist "frontend\build" (
    echo [ERROR] frontend\build directory not found!
    echo Please run deploy-fixes.bat first to build the frontend.
    echo.
    pause
    exit /b 1
)

echo [✓] Build directory exists
echo.

echo Checking required files...
echo.

REM Check frontend files
set "missing=0"

if exist "frontend\build\index.html" (
    echo [✓] index.html
) else (
    echo [✗] index.html - MISSING
    set "missing=1"
)

if exist "frontend\build\manifest.json" (
    echo [✓] manifest.json
) else (
    echo [✗] manifest.json - MISSING
    set "missing=1"
)

if exist "frontend\build\browserconfig.xml" (
    echo [✓] browserconfig.xml
) else (
    echo [✗] browserconfig.xml - MISSING
    set "missing=1"
)

if exist "frontend\build\sw.js" (
    echo [✓] sw.js
) else (
    echo [✗] sw.js - MISSING
    set "missing=1"
)

if exist "frontend\build\static" (
    echo [✓] static folder
) else (
    echo [✗] static folder - MISSING
    set "missing=1"
)

if exist "frontend\build\digital-library-icon-192x192.png" (
    echo [✓] icon-192x192.png
) else (
    echo [✗] icon-192x192.png - MISSING
    set "missing=1"
)

if exist "frontend\build\digital-library-icon-512x512.png" (
    echo [✓] icon-512x512.png
) else (
    echo [✗] icon-512x512.png - MISSING
    set "missing=1"
)

echo.
echo Checking backend files...
echo.

if exist "backend\api\books\create.php" (
    echo [✓] backend\api\books\create.php
) else (
    echo [✗] backend\api\books\create.php - MISSING
    set "missing=1"
)

if exist "backend\api\loans\list.php" (
    echo [✓] backend\api\loans\list.php
) else (
    echo [✗] backend\api\loans\list.php - MISSING
    set "missing=1"
)

echo.
echo ========================================
echo.

if "%missing%"=="1" (
    echo [ERROR] Some required files are missing!
    echo Please ensure all files are present before deploying.
    echo.
) else (
    echo [SUCCESS] All required files are present!
    echo.
    echo ========================================
    echo READY TO DEPLOY
    echo ========================================
    echo.
    echo FILES TO UPLOAD:
    echo.
    echo 1. Upload ALL contents from:
    echo    frontend\build\
    echo    to: htdocs\ (on InfinityFree)
    echo.
    echo 2. Upload these backend files:
    echo    backend\api\books\create.php
    echo    to: htdocs\backend\api\books\
    echo.
    echo    backend\api\loans\list.php
    echo    to: htdocs\backend\api\loans\
    echo.
    echo AFTER UPLOADING:
    echo 1. Clear browser cache (Ctrl+Shift+Delete)
    echo 2. Unregister service worker (F12 - Application)
    echo 3. Hard refresh (Ctrl+Shift+R)
    echo 4. Test functionality
    echo.
    echo DOCUMENTATION:
    echo - QUICK_FIX_GUIDE.md - Step-by-step deployment
    echo - DEPLOYMENT_CHECKLIST.md - Detailed checklist
    echo - TEST_DEPLOYMENT.md - Testing procedures
    echo.
)

echo ========================================
pause
