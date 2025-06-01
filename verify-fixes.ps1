Write-Host "🔍 EcoTrack Backend Verification" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$ecotrackPath = "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack"
Set-Location $ecotrackPath

Write-Host "`n📋 Checking project structure..." -ForegroundColor Yellow

# Check key files exist
$keyFiles = @(
    "src/server/server.ts",
    "src/api/api.ts", 
    "src/utils/enhancedNotifications.ts",
    "src/services/analyticsService.ts",
    "package.json",
    "tsconfig.json"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (MISSING)" -ForegroundColor Red
    }
}

Write-Host "`n🔧 Checking TypeScript compilation..." -ForegroundColor Yellow
try {
    $tscResult = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript compilation failed:" -ForegroundColor Red
        Write-Host $tscResult -ForegroundColor Red
    }
} catch {
    Write-Host "❌ TypeScript compiler not available" -ForegroundColor Red
}

Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Dependencies not installed - run 'npm install'" -ForegroundColor Yellow
}

Write-Host "`n🎯 Summary of fixes applied:" -ForegroundColor Cyan
Write-Host "• Created missing enhancedNotifications.ts module" -ForegroundColor White
Write-Host "• Created missing analyticsService.ts module" -ForegroundColor White  
Write-Host "• Fixed sendNotificationFromTemplate calls in api.ts" -ForegroundColor White
Write-Host "• Fixed getAdvancedAnalytics call in api.ts" -ForegroundColor White
Write-Host "• Fixed queueNotification call in api.ts" -ForegroundColor White
Write-Host "• Added await for async notification methods" -ForegroundColor White
Write-Host "• Fixed return types for notification IDs" -ForegroundColor White
Write-Host "• Added basic API endpoint /api in server.ts" -ForegroundColor White

Write-Host "`n🚀 Ready to start!" -ForegroundColor Green
Write-Host "Run: .\setup-and-start.ps1" -ForegroundColor Cyan
