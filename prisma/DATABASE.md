# Database Management

This document explains how to manage database migrations, backups, and restoration in this project.

## Migrations

Migrations are stored in `/prisma/migrations/` and are timestamped folders containing SQL changes. Each migration corresponds to schema changes and should be committed with related code changes.

### View Migration History
```bash
npx prisma migrate status
```

### Create New Migration
```bash
npx prisma migrate dev --name descriptive_name
```

## Backups

We use a custom backup script that creates timestamped SQLite database copies.

### Create Backup
```bash
npm run backup-db
```

This creates:
- Timestamped backup: `./backups/YYYYMMDD_HHMMSS.db`
- Latest backup: `./backups/latest.db`

## Database Reset/Restore

### Reset to Latest Migration
```bash
npm run reset-db  # Creates backup first
```

### Reset to Specific Migration/Commit
1. Find the commit hash and migration you want to restore to
2. Create backup of current state:
   ```bash
   npm run backup-db
   ```
3. Checkout the specific commit:
   ```bash
   git checkout <commit-hash>
   ```
4. Reset database:
   ```bash
   npx prisma migrate reset
   ```

### Restore from Backup
```bash
cp ./backups/[backup-file].db ./prisma/dev.db
```

## Best Practices
1. Always backup before migrations or resets
2. Commit migrations with corresponding code changes
3. Document significant schema changes in commit messages
4. Test migrations and rollbacks in development first 