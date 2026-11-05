@echo off
title Push to GitHub - Chrome-Extension-Downloader
echo ========================================================
echo   Pushing Chrome-Extension-Downloader to GitHub
echo ========================================================
echo.

cd /d "%~dp0"

echo [*] Initializing Git repository...
git init

echo [*] Adding all project files (frontend, netlify functions, configs)...
git add .

echo [*] Committing files...
git commit -m "Initial commit: Complete Chrome Extension Downloader with Netlify functions"

echo [*] Setting branch to main...
git branch -M main

echo [*] Setting remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/hitesh3119/Chrome-Extension-Downloader.git

echo [*] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================================
echo   Done! Check https://github.com/hitesh3119/Chrome-Extension-Downloader
echo ========================================================
pause

