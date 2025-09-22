@echo off
echo 🚀 Preparing Naomi's Barbershop for deployment...

REM Build backend to ensure everything compiles
echo 📦 Building backend...
cd backend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Backend build successful!

REM Build frontend to ensure everything compiles
echo 📦 Building frontend...
cd ..
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Frontend build successful!
echo.
echo 🎉 Ready for deployment!
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Follow the DEPLOYMENT.md guide
echo 3. Deploy backend to Render first
echo 4. Then deploy frontend to Vercel with the backend URL
echo.
pause