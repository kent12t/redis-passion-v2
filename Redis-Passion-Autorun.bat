@echo off
REM Change this to your project directory path
cd /d C:\Users\Admin\Documents\GitHub\redis-passion-v2

REM Run npm dev command
echo Starting Web Server...
start /b npm start

REM Wait for 4 seconds
echo Waiting...
timeout /t 3 /nobreak

REM Open another batch file - replace with the actual path
echo Opening second batch file...
start "" ".\EdgeKioskLauncher.bat"

REM Close this batch file
echo Closing this batch file...
exit