# Чистый запуск EcoTrack приложения
Write-Host "🧹 Очистка процессов..." -ForegroundColor Yellow

# Останавливаем все Node.js процессы
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "🚀 Запуск Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack'; `$env:PORT='3001'; npm run dev"

Start-Sleep 5

Write-Host "🌐 Запуск Frontend..." -ForegroundColor Green  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack-frontend'; npm start"

Start-Sleep 3

Write-Host "✅ Приложение запущено!" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001/api" -ForegroundColor Cyan
