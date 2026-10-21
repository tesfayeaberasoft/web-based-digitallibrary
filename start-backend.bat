@echo off
title Digital Library - Backend Server
echo ================================================
echo   Digital Library - Backend Server
echo   Running on http://localhost:8000
echo ================================================
echo.
echo Make sure MySQL is started in XAMPP first!
echo.
cd /d "%~dp0backend"
php -d upload_max_filesize=50M -d post_max_size=55M -S localhost:8000 router.php
pause
