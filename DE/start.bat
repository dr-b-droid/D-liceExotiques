@echo off

cd /d %~dp0

set PATH=%~dp0\nodejs;%~dp0\node_modules\.bin;%PATH%

start pm2 start "backend/server.js" --name "delices-exotiques"

echo.
echo En attente du demarrage du serveur...
:checkServer
powershell -Command "try {Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0} catch {exit 1}" 

if %errorlevel% neq 0 (
    timeout /t 1 /nobreak >nul
    goto checkServer
)

start "" "http://localhost:3000"

echo.
echo Serveur lance avec succes! ouverture automatique du navigateur.
cmd /k
