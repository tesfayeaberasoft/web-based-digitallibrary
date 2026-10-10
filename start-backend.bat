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
C:\xampp\php\php.exe -S localhost:8000 router.php
pause
