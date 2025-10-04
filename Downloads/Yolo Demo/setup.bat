@echo off
REM setup.bat - Easy setup script for Exercise Tracker (Windows)

echo 🏋️ Setting up Exercise Tracker...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found:
python --version

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv .venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📥 Installing dependencies...
pip install -r requirements.txt

echo.
echo 🎉 Setup complete!
echo.
echo To run the exercise tracker:
echo 1. Activate the virtual environment:
echo    .venv\Scripts\activate
echo 2. Run the tracker:
echo    python advanced_bicep_tracker.py
echo.
echo Press 'q' to quit, 'r' to reset, 's' to switch arms, 'a' for analytics, 'e' to export data
echo.
pause