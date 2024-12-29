# Database Management

## Current Configuration
- **Database**: PostgreSQL
- **Database Name**: loans_v2
- **Connection**: `postgresql://stephenscott@localhost:5432/loans_v2?schema=public`

## Backup

The application includes an automated backup script that creates both timestamped and latest backups.

### Running a Backup
```bash
npm run backup-db
```

This will create:
1. A timestamped, compressed backup: `prisma/backups/loans_v2_[TIMESTAMP].sql.gz`
2. An uncompressed latest backup: `prisma/backups/latest.sql`

### Backup Locations
- All backups are stored in `prisma/backups/`
- Timestamped backups are compressed with gzip
- A 'latest' uncompressed backup is always available

## Restore

### Restoring from Latest Backup
```bash
psql -h localhost -U stephenscott -d loans_v2 < prisma/backups/latest.sql
```

### Restoring from Timestamped Backup
```bash
# Replace [TIMESTAMP] with the actual timestamp of the backup you want to restore
gunzip -c prisma/backups/loans_v2_[TIMESTAMP].sql.gz | psql -h localhost -U stephenscott -d loans_v2
```

### Creating a Fresh Database
If you need to create a fresh database:
```bash
# Create the database
createdb -h localhost -U stephenscott loans_v2

# Run migrations
npx prisma migrate deploy

# Seed the database (if needed)
npx prisma db seed
```

## Development Workflow

1. **Making Schema Changes**
   ```bash
   # After modifying schema.prisma
   npx prisma migrate dev --name [description_of_change]
   ```

2. **Updating Client**
   ```bash
   npx prisma generate
   ```

3. **Reset Database**
   ```bash
   # This will backup the database first
   npm run reset-db
   ```

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Ensure PostgreSQL is running: `brew services list | grep postgresql`
   - Check connection string in `.env`
   - Verify user permissions: `psql -h localhost -U stephenscott -d loans_v2`

2. **Backup/Restore Issues**
   - Ensure you have proper permissions
   - Check disk space for backups
   - Verify PostgreSQL client tools are installed (`pg_dump`, `psql`) 