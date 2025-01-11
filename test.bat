@echo off
REM save as start-app.bat

cd /d %~dp0
IF NOT EXIST ".next" (
    echo Building the application...
    call npm run build
)

echo Starting the application...
start /B cmd /c npm start

echo Waiting for the server to start...
timeout /t 5 /nobreak > nul

echo Opening browser...
start http://localhost:3000

echo Application is running. Close this window to stop the server.
pause