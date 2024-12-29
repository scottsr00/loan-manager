# Loan Management System

A comprehensive loan management and servicing platform built with Next.js, TypeScript, and Prisma.

## Core Features

### Loan Management
- Create and manage credit agreements
- Track multiple facilities per agreement
- Monitor loan drawdowns and repayments
- Handle syndicated loans with multiple lenders

### Servicing
- Track lender positions and shares
- Manage servicing activities and assignments
- Process loan payments and interest calculations
- Monitor covenant compliance

### Analytics
- View portfolio performance metrics
- Track facility utilization
- Monitor loan exposure by borrower/lender
- Generate financial reports

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Development Setup

1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Initialize database
```bash
npx prisma migrate dev
```

5. Start development server
```bash
npm run dev
```

## Database Management

See [DATABASE.md](./prisma/DATABASE.md) for detailed information about:
- Database migrations
- Backup procedures
- Restoration process

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy using Vercel's PostgreSQL integration

### Manual Deployment
1. Build the application
```bash
npm run build
```

2. Set production environment variables
3. Start the production server
```bash
npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
```bash
npm test
```
4. Submit a pull request

## License

[Your chosen license]
