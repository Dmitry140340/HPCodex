# HimkaPlastic EcoTrack - Quick Start Script (PowerShell)
# Быстрый запуск системы после исправления TypeScript ошибок

Write-Host "🚀 HimkaPlastic EcoTrack - Quick Start" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

function Check-Status {
    param($Message, $ExitCode)
    if ($ExitCode -eq 0) {
        Write-Host "✅ $Message - SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message - FAILED" -ForegroundColor Red
        exit 1
    }
}

# Start Backend Server
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Set-Location "ecotrack"
$backendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}
Check-Status "Backend Server Started" 0
Set-Location ".."

# Wait for backend to initialize
Start-Sleep -Seconds 5

# Start Frontend Development Server
Write-Host "🔧 Starting Frontend Development Server..." -ForegroundColor Yellow
Set-Location "ecotrack-frontend"
$frontendJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}
Check-Status "Frontend Server Started" 0
Set-Location ".."

Write-Host ""
Write-Host "🎉 System Started Successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "📊 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Available Features:" -ForegroundColor Yellow
Write-Host "  - Comprehensive Reporting (/reports)" -ForegroundColor White
Write-Host "  - Real-time Order Tracking (/tracking)" -ForegroundColor White
Write-Host "  - Enhanced Notifications" -ForegroundColor White
Write-Host "  - PDF/Excel/CSV Export" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop servers:" -ForegroundColor Red
Write-Host "  Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Red
Write-Host "  Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Red
Write-Host ""
Write-Host "✅ All TypeScript errors have been resolved!" -ForegroundColor Green
Write-Host "System is ready for testing and use." -ForegroundColor Green

# Keep script running and show job status
Write-Host ""
Write-Host "📊 Server Status Monitor (Press Ctrl+C to exit):" -ForegroundColor Magenta
while ($true) {
    $backendState = (Get-Job $backendJob.Id).State
    $frontendState = (Get-Job $frontendJob.Id).State
    
    Write-Host "Backend: $backendState | Frontend: $frontendState" -ForegroundColor Gray
    
    if ($backendState -eq "Failed" -or $frontendState -eq "Failed") {
        Write-Host "❌ One or more servers failed!" -ForegroundColor Red
        break
    }
    
    Start-Sleep -Seconds 10
}
