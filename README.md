# Clients Finder App

A Next.js application for finding and managing potential clients using the Geoapify Places API, with PostgreSQL database storage.

## Features

- 🔍 Search for places using Geoapify Places API
- 💾 Store client data in PostgreSQL database
- 📊 Manage client status (Pending, Lead, Rejected, Contacted, Closed)
- 🗺️ Location-based search with map integration
- 🎯 Filter clients by status, category, and city

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL with Prisma ORM (Multi-file schema)
- **API Integration**: Geoapify Places API
- **UI**: Radix UI components, Tailwind CSS

## Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL database)
- Geoapify API Key (get free at https://www.geoapify.com/)

## Setup Instructions

### 1. Clone and Install

```bash
cd clients-finder-app
npm install
```

### 2. Start PostgreSQL Database

Using Docker:

```bash
docker-compose up -d
```

This starts PostgreSQL on port **7001**.

Or use your existing PostgreSQL instance and update the `DATABASE_URL` in `.env`.

### 3. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database (adjust if not using docker-compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:7001/clients_finder?schema=public"

# Get your free API key at https://www.geoapify.com/
GEOAPIFY_API_KEY="your_api_key_here"

# Next.js port
PORT=7000
```

### 4. Initialize Database

Push the Prisma schema to your database:

```bash
npm run db:push
```

Or create a migration:

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Start Development Server

```bash
npm run dev
```

The app will run on **http://localhost:7000**

## Prisma Multi-File Schema

This project uses Prisma's multi-file schema architecture:

```
prisma/
├── schema/
│   ├── schema.prisma  # Generator + datasource config only
│   └── client.prisma  # Client models
├── prisma-adapter.ts  # PostgreSQL adapter with connection pooling
└── migrations/        # Database migrations
```

See [prisma/README.md](prisma/README.md) for detailed Prisma documentation.

## Available Scripts

```bash
# Development
npm run dev              # Start Next.js on port 7000
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio

# Prisma commands
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create migration
npx prisma studio        # Database GUI
npx prisma format        # Format schema files
npx prisma validate      # Validate schema files
```

## API Endpoints

### Search Places (Geoapify)

```
GET /api/clients/search?query=restaurant&lat=40.7128&lon=-74.006&radius=5000
```

**Query Parameters**:
- `query` - Search term
- `category` - Geoapify category filter
- `lat`, `lon` - Center coordinates for proximity search
- `radius` - Search radius in meters (default: 5000)
- `limit` - Max results (default: 20)

**Response**: Stores found places in database and returns client list.

### Get All Clients

```
GET /api/clients?status=PENDING&category=restaurant&limit=50
```

**Query Parameters**:
- `status` - Filter by status (PENDING, LEAD, REJECTED, CONTACTED, CLOSED)
- `category` - Filter by category
- `city` - Filter by city
- `limit` - Max results
- `offset` - Pagination offset

### Get Single Client

```
GET /api/clients/[id]
```

### Update Client Status

```
PATCH /api/clients/[id]
Content-Type: application/json

{
  "status": "LEAD"
}
```

**Valid statuses**: PENDING, LEAD, REJECTED, CONTACTED, CLOSED

### Delete Client

```
DELETE /api/clients/[id]
```

## Database Schema

### Client Model

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (cuid) |
| placeId | String | Geoapify place_id (unique) |
| name | String | Business name |
| category | String? | Business category |
| address | String | Full address |
| latitude | Float | Latitude coordinate |
| longitude | Float | Longitude coordinate |
| status | ClientStatus | Lead status (enum) |
| createdAt | DateTime | Created timestamp |
| updatedAt | DateTime | Updated timestamp |

### ClientStatus Enum

- `PENDING` - New potential client
- `LEAD` - Qualified lead
- `REJECTED` - Not a good fit
- `CONTACTED` - Outreach initiated
- `CLOSED` - Deal closed or lost

## Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Check status
docker-compose ps
```

## Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server at localhost:7001`

**Solutions**:
1. Check if Docker is running: `docker ps`
2. Start database: `docker-compose up -d`
3. Verify DATABASE_URL in `.env`

### Prisma Client Not Generated

**Solution**:
```bash
npx prisma generate
```

## License

MIT

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
