@echo off
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)

echo Starting Next.js dev server...
call npm run dev
pause
