# EcoTrack Complete Setup and Start Script
Write-Host "🚀 Setting up and starting EcoTrack application..." -ForegroundColor Green

# Navigate to backend directory
Write-Host "📦 Setting up backend dependencies..." -ForegroundColor Yellow
Set-Location "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack"

# Install backend dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Blue
    npm install
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

# Start backend server in background
Write-Host "🖥️ Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd 'c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack'; npm run dev" -WindowStyle Normal

# Navigate to frontend directory
Write-Host "📦 Setting up frontend dependencies..." -ForegroundColor Yellow
Set-Location "c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack-frontend"

# Install frontend dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
    npm install
}

# Start frontend server in background
Write-Host "🌐 Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd 'c:\Users\Admin\Desktop\HimkaPlastic (adaptive)\ecotrack-frontend'; npm start" -WindowStyle Normal

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "📡 Backend server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend server: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nBoth servers are starting in separate windows..." -ForegroundColor White

# Wait a moment for servers to start
Start-Sleep -Seconds 3

# Test backend API
Write-Host "`n🔍 Testing backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend API is responding!" -ForegroundColor Green
    Write-Host "Response: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Backend may still be starting up. Please wait a moment and try accessing http://localhost:3001/api" -ForegroundColor Yellow
}

Write-Host "`n🎉 EcoTrack application is ready!" -ForegroundColor Green
Write-Host "You can now access the application at http://localhost:3000" -ForegroundColor Cyan
