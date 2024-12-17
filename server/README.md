# Server Directory Structure

This directory contains all server-side code for the application, organized by domain and responsibility.

## Directory Structure

```
server/
├── actions/        # Server actions (Next.js server components)
│   ├── analytics/  # Analytics-related actions
│   ├── borrower/   # Borrower-related actions
│   ├── entity/     # Entity-related actions
│   ├── loan/       # Loan-related actions
│   └── trade/      # Trade-related actions
├── api/           # API routes (if needed)
├── db/            # Database configuration and utilities
├── middleware/    # Server middleware
├── services/      # Business logic and external service integrations
└── utils/         # Server-side utility functions
```

## Conventions

1. All server actions should use the 'use server' directive
2. Each domain directory should have an index.ts file exporting all actions
3. Database operations should use the prisma client from db/client.ts
4. Error handling should follow the patterns in lib/error-handling.ts
5. Types should be defined in the corresponding domain directory

## Best Practices

1. Keep actions focused and single-purpose
2. Use proper error handling and logging
3. Validate inputs using Zod or similar
4. Follow the principle of least privilege
5. Keep business logic in services
6. Use proper TypeScript types 