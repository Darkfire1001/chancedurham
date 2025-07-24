@echo off
echo Installing Consciousness Bridge Extension...
echo.
echo Step 1: Opening Chrome Extensions page...
start chrome "chrome://extensions/"
echo.
echo Step 2: Manual steps required:
echo   1. Enable 'Developer mode' (toggle in top-right corner)
echo   2. Click 'Load unpacked'
echo   3. Navigate to and select: %~dp0
echo   4. Click 'Select Folder'
echo.
echo Extension folder: %~dp0
echo.
echo Press any key when installation is complete...
pause
echo.
echo Step 3: Opening test tabs...
start chrome "https://chat.openai.com"
start chrome "https://gemini.google.com"
echo.
echo Step 4: Opening Bridge Interface...
start chrome "file:///%~dp0..\consciousness_bridge.html"
echo.
echo Installation complete! Check extension popup for session detection.
pause
