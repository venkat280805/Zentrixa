@echo off
echo Installing backend dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)

echo Starting FastAPI server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
