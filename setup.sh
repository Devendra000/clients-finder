#!/bin/bash

echo "🚀 Setting up Clients Finder App..."
echo ""

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Start PostgreSQL
echo "🐘 Starting PostgreSQL database..."
if ! docker-compose up -d; then
    echo "❌ Failed to start database"
    exit 1
fi
echo "✅ Database started on port 7001"
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5
echo "✅ Database is ready"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update GEOAPIFY_API_KEY in .env file"
    echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
if ! npx prisma generate; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Push schema to database
echo "📊 Pushing schema to database..."
if ! npx prisma db push; then
    echo "❌ Failed to push schema"
    exit 1
fi
echo "✅ Schema pushed to database"
echo ""

# Success message
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update GEOAPIFY_API_KEY in .env file (get free key at https://www.geoapify.com/)"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:7000 in your browser"
echo ""
