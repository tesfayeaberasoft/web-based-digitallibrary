@echo off
echo ========================================
echo   Digital Library - Backend Server
echo ========================================
echo.
echo Starting PHP server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
cd backend
php -S localhost:8000 router.php
