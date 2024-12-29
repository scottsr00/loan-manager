#!/bin/bash

# Create backups directory with proper permissions
mkdir -p ./prisma/backups
chmod 755 ./prisma/backups

# Ensure source database exists
if [ ! -f "./prisma/dev.db" ]; then
    echo "Error: Database file not found at ./prisma/dev.db"
    exit 1
fi

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup with timestamp
sqlite3 "./prisma/dev.db" ".backup './prisma/backups/$TIMESTAMP.db'"
chmod 644 "./prisma/backups/$TIMESTAMP.db" 2>/dev/null

# Create/update 'latest' backup
sqlite3 "./prisma/dev.db" ".backup './prisma/backups/latest.db'"
chmod 644 "./prisma/backups/latest.db" 2>/dev/null

echo "Backup created: ./prisma/backups/$TIMESTAMP.db"