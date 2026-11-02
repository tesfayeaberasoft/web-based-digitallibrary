@echo off
echo ========================================
echo Digital Library - Deployment Fix Script
echo ========================================
echo.

REM Navigate to frontend directory
cd /d "%~dp0frontend"

echo [1/3] Building frontend with latest fixes...
echo Note: Source maps disabled for InfinityFree compatibility
set GENERATE_SOURCEMAP=false
call npm run build

if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Build completed successfully!
echo.
echo [3/3] Files ready for deployment:
echo.
echo FRONTEND FILES TO UPLOAD (from frontend\build\ to htdocs\):
echo   - index.html
echo   - manifest.json
echo   - browserconfig.xml (NEW)
echo   - sw.js
echo   - static\ folder
echo   - All other files in build\
echo.
echo BACKEND FILES TO UPLOAD (to htdocs\backend\):
echo   - backend\api\books\create.php
echo   - backend\api\loans\list.php
echo.
echo ========================================
echo DEPLOYMENT INSTRUCTIONS:
echo ========================================
echo.
echo 1. Use FileZilla or InfinityFree File Manager
echo 2. Upload ALL files from frontend\build\ to htdocs\
echo 3. Upload the 2 backend PHP files to their respective folders
echo 4. Clear browser cache and test!
echo.
echo TESTING CHECKLIST:
echo   [ ] Create a new book as librarian
echo   [ ] Verify book appears in browse page
echo   [ ] Borrow a book as user
echo   [ ] Check My Books shows the borrowed book
echo   [ ] Test PWA install (look for + icon in address bar)
echo.
echo ========================================
pause
