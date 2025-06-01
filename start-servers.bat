@echo off
echo Starting EcoTrack Backend Server...
cd "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack"
start cmd /k "npm run dev"

echo Starting EcoTrack Frontend Server...
cd "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack-frontend"
start cmd /k "npm start"

echo Both servers are starting...
echo Backend will run on http://localhost:3001
echo Frontend will run on http://localhost:3000
pause
