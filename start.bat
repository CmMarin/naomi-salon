@echo off
echo Starting Naomi's Barbershop Booking App...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting up!
echo Backend API: http://localhost:3001/api
echo Frontend: http://localhost:3000 (or next available port)
echo Admin Dashboard: http://localhost:3000/admin
echo.
echo Press any key to close this window...
pause > nul