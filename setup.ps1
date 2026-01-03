# Setup Script for Clients Finder App

Write-Host "🚀 Setting up Clients Finder App..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL
Write-Host "🐘 Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database started on port 7001" -ForegroundColor Green
Write-Host ""

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ Database is ready" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update GEOAPIFY_API_KEY in .env file" -ForegroundColor Yellow
    Write-Host ""
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Push schema to database
Write-Host "📊 Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema pushed to database" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update GEOAPIFY_API_KEY in .env file (get free key at https://www.geoapify.com/)" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:7000 in your browser" -ForegroundColor White
Write-Host ""
