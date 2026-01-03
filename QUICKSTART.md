# Quick Start Guide

## Prerequisites Check
- [ ] Docker installed and running
- [ ] Node.js 18+ installed
- [ ] Geoapify API key (get free at https://www.geoapify.com/)

## 3-Minute Setup

### Option 1: Automated Setup (Recommended)

**Windows**:
```powershell
# Run setup script
.\setup.ps1
```

**Linux/Mac**:
```bash
# Make executable and run
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
# 1. Start database
docker-compose up -d

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and add your Geoapify API key
# GEOAPIFY_API_KEY="your_key_here"

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Start development server
npm run dev
```

## Verify Setup

1. **Check database**: `docker ps` should show `clients-finder-db`
2. **Check Prisma**: `npx prisma studio` should open GUI
3. **Check server**: Visit http://localhost:7000

## Test the API

### 1. Search for places:
```bash
curl "http://localhost:7000/api/clients/search?query=restaurant&lat=40.7128&lon=-74.006"
```

### 2. Get all clients:
```bash
curl "http://localhost:7000/api/clients"
```

### 3. Update client status:
```bash
curl -X PATCH "http://localhost:7000/api/clients/CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "LEAD"}'
```

## Common Issues

### "Can't reach database server"
```bash
docker-compose up -d
```

### "Geoapify API key not configured"
Edit `.env` and add your API key:
```env
GEOAPIFY_API_KEY="your_actual_key_here"
```

### Port already in use
Update port in `package.json` or stop conflicting service

## What's Running

- **Next.js**: http://localhost:7000
- **PostgreSQL**: localhost:7001
- **Prisma Studio**: Run `npm run db:studio`

## Next Steps

1. Update your frontend components to use the new API endpoints
2. Test search functionality with real locations
3. Implement client status management in UI
4. Add filters for status, category, and location

## File Structure

```
✅ prisma/schema/schema.prisma   (config only)
✅ prisma/schema/client.prisma   (models)
✅ prisma/prisma-adapter.ts      (PostgreSQL adapter)
✅ lib/prisma.ts                 (client with adapter)
✅ app/api/clients/              (API routes)
✅ .env                          (your config)
✅ docker-compose.yml            (database)
```

## Need Help?

- Read [README.md](README.md) for detailed documentation
- Check [SETUP_COMPLETE.md](SETUP_COMPLETE.md) for what was configured
- See [prisma/README.md](prisma/README.md) for Prisma docs

**You're ready to go! 🚀**
