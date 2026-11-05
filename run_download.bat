@echo off
title Download and Extract SortLens Extension
echo ========================================================
echo   SortLens Chrome Extension - Offline Downloader
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download_and_extract.ps1"

echo.
pause

