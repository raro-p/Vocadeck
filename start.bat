@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting Word App...
echo.
echo This will start:
echo 1. Backend server (port 8000)
echo 2. Frontend server (port 3000)
echo.
echo Press any key to start...
pause >nul

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && py -m pip install -r requirements.txt && py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && call npm install && call npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul
