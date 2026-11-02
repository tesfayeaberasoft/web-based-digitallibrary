@echo off
echo ========================================
echo Rebuild Without Source Maps
echo ========================================
echo.

echo [1/4] Cleaning old build...
cd /d "%~dp0frontend"
if exist "build" (
    rmdir /s /q "build"
    echo ✓ Old build removed
) else (
    echo ✓ No old build found
)
echo.

echo [2/4] Setting environment variable...
set GENERATE_SOURCEMAP=false
echo ✓ GENERATE_SOURCEMAP=false
echo.

echo [3/4] Building frontend (this may take 1-2 minutes)...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Verifying no .map files...
echo.

REM Check for any .map files
set "mapfound=0"
for /r "build" %%F in (*.map) do (
    echo ❌ Found: %%F
    set "mapfound=1"
)

if "%mapfound%"=="0" (
    echo ✓ SUCCESS - No .map files found!
    echo.
    echo ========================================
    echo Build Complete!
    echo ========================================
    echo.
    echo Files ready in: frontend\build\
    echo.
    echo Next Steps:
    echo 1. Upload ALL files from frontend\build\ to htdocs\
    echo 2. InfinityFree will NOT delete any files
    echo 3. Clear browser cache
    echo 4. Test your site
    echo.
) else (
    echo.
    echo ⚠️  WARNING: .map files still present!
    echo.
    echo Try this manually:
    echo   cd frontend
    echo   $env:GENERATE_SOURCEMAP = "false"
    echo   npm run build
    echo.
)

echo ========================================
pause
