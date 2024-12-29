#!/bin/bash

# Exit on error
set -e

# Create backups directory if it doesn't exist
BACKUP_DIR="prisma/backups"
mkdir -p $BACKUP_DIR

# Generate timestamp for the backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/loans_v2_$TIMESTAMP.sql"

# Create the backup
echo "📦 Creating backup of loans_v2 database..."
pg_dump -h localhost -U stephenscott -d loans_v2 > "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

echo "✅ Backup completed: ${BACKUP_FILE}.gz"
echo "Backup size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)" 