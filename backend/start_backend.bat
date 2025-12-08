@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing dependencies...
py -m pip install -r requirements.txt
echo.
echo Starting backend server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
