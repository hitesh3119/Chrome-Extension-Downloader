@echo off
title Push to GitHub - Chrome-Extension-Downloader
echo ========================================================
echo   Pushing Chrome-Extension-Downloader to GitHub
echo ========================================================
echo.

cd /d "%~dp0"

if not exist ".git" (
    echo [*] Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/hitesh3119/Chrome-Extension-Downloader.git
) else (
    git remote set-url origin https://github.com/hitesh3119/Chrome-Extension-Downloader.git 2>nul
)

echo [*] Staging all files...
git add .

echo [*] Committing files...
git commit -m "Add Hitesh Khambhoo developer credits, 100/100 SEO optimization, sitemap and robots.txt"

echo [*] Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo ========================================================
echo   Done! Check https://github.com/hitesh3119/Chrome-Extension-Downloader
echo ========================================================
pause

