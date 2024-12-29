#!/bin/bash

# Create backups directory with proper permissions
mkdir -p ./prisma/backups
chmod 755 ./prisma/backups

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="./prisma/backups/loans_v2_$TIMESTAMP.sql"

# Create backup
echo "📦 Creating backup of loans_v2 database..."
pg_dump -h localhost -U stephenscott -d loans_v2 > "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Create/update 'latest' backup
echo "📦 Creating latest backup..."
pg_dump -h localhost -U stephenscott -d loans_v2 > "./prisma/backups/latest.sql"

echo "✅ Backup completed!"
echo "📂 Backup files:"
echo "  - ${BACKUP_FILE}.gz"
echo "  - ./prisma/backups/latest.sql"
echo "📊 Backup size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"