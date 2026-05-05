@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

cd /d "%~dp0backend"

echo Current directory: %CD%
echo.
echo Starting PHP Development Server...
echo Backend API will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

php -S localhost:8000 router.php

pause
