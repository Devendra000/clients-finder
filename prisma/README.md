# Prisma Multi-File Schema Setup

This project uses Prisma's **multi-file schema** architecture for better organization.

## Structure

```
prisma/
├── schema/
│   ├── schema.prisma  # Generator + datasource ONLY
│   └── client.prisma  # Client models
├── prisma-adapter.ts  # PostgreSQL adapter
└── migrations/        # Database migrations
```

## Configuration

**Generator & Datasource** (`schema/schema.prisma`):
- Contains ONLY generator and datasource configuration
- Uses `prismaSchemaFolder` and `driverAdapters` preview features

**Models** (`schema/client.prisma`):
- Contains all Client-related models and enums
- Organized by domain

## Setup

1. **Install dependencies**:
   ```bash
   npm install @prisma/client @prisma/adapter-pg pg
   npm install -D prisma
   ```

2. **Configure DATABASE_URL** in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:7001/clients_finder?schema=public"
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Push schema to database**:
   ```bash
   npx prisma db push
   ```

   Or create migration:
   ```bash
   npx prisma migrate dev --name init
   ```

## Common Commands

```bash
# Generate Prisma Client (reads all schema/*.prisma files)
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Push schema without migration (development)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Format all schema files
npx prisma format

# Validate all schema files
npx prisma validate
```

## Usage in Code

The Prisma client is configured with the PostgreSQL adapter in `lib/prisma.ts`:

```typescript
import { prisma } from '@/lib/prisma'

// Example query
const clients = await prisma.client.findMany({
  where: { status: 'LEAD' },
  orderBy: { createdAt: 'desc' }
})
```

## Adding New Models

1. Create a new file in `prisma/schema/` (e.g., `user.prisma`)
2. Define your models
3. Run `npx prisma generate`
4. Create migration: `npx prisma migrate dev --name add_user_model`

Prisma automatically reads all `.prisma` files in the `schema/` directory!
