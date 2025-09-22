# Naomi's Barbershop Booking App Startup Script
Write-Host "Starting Naomi's Barbershop Booking App..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting up!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000 (or next available port)" -ForegroundColor Cyan
Write-Host "Admin Dashboard: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")