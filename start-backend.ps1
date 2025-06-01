Write-Host "Starting EcoTrack Backend Server..." -ForegroundColor Green
Set-Location "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack"
$env:PORT = "3001"
npm run dev
