#!/bin/bash

# Exit on error
set -e

# Check if backup directory exists, if not create it
if [ ! -d "prisma/backups" ]; then
  mkdir -p prisma/backups
fi

# Backup current .env
if [ -f ".env" ]; then
  cp .env .env.backup
  echo "✅ Backed up .env to .env.backup"
fi

# Backup current database
if [ -f "prisma/dev.db" ]; then
  timestamp=$(date +%Y%m%d_%H%M%S)
  cp prisma/dev.db "prisma/backups/dev.db.backup_$timestamp"
  echo "✅ Backed up SQLite database to prisma/backups/dev.db.backup_$timestamp"
fi

# Backup current migrations
if [ -d "prisma/migrations" ]; then
  timestamp=$(date +%Y%m%d_%H%M%S)
  cp -r prisma/migrations "prisma/backups/migrations_backup_$timestamp"
  echo "✅ Backed up migrations to prisma/backups/migrations_backup_$timestamp"
fi

# Remove current migrations
rm -rf prisma/migrations
echo "✅ Removed existing migrations"

# Update .env for PostgreSQL
echo "DATABASE_URL=\"postgresql://stephenscott@localhost:5432/loans_v2?schema=public\"" > .env
echo "✅ Created new .env with PostgreSQL configuration"

# Generate fresh Prisma client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Create fresh migration
echo "🔄 Creating fresh migration..."
npx prisma migrate dev --name init

echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running and accessible"
echo "2. Update DATABASE_URL in .env with your PostgreSQL credentials if needed"
echo "3. Run 'npx prisma migrate deploy' to apply migrations"
echo ""
echo "To revert to SQLite backup:"
echo "1. Copy .env.backup to .env"
echo "2. Restore the backed up database and migrations from prisma/backups" 