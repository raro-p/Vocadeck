@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing dependencies...
call npm install
echo.
echo Starting frontend server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start
pause

