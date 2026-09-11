@echo off
title The Wayward Flagon — Launcher
color 06

echo ===================================================
echo     THE WAYWARD FLAGON - AI DUNGEON MASTER RPG
echo ===================================================
echo.
echo Starting backend server (port 3001) and frontend (port 5173)...
echo.

cd /d "%~dp0"
npm run dev
