@echo off
REM MiniConnect Quick Start Script for Windows

echo 🎵 MiniConnect Setup
echo ====================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 12+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%

REM Install server dependencies
echo.
echo 📦 Installing server dependencies...
cd server
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✓ Dependencies installed

cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Start the server: cd server && npm start
echo 2. Load the extension in Chrome:
echo    - Go to chrome://extensions/
echo    - Enable Developer mode
echo    - Click 'Load unpacked' and select the 'extension' folder
echo 3. Open YouTube Music in Chrome
echo 4. On your phone, visit: http://^<YOUR_LAPTOP_IP^>:3000
echo.
echo Happy listening! 🎧
