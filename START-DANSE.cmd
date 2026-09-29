@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist node_modules exit /b 1
start "" http://localhost:5183/
call npm run dev
pause
