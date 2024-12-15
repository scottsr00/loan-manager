# Data Fetching Patterns

This document outlines the standard data fetching patterns used in the application.

## Core Principles

1. Use SWR with Server Actions for real-time data
2. Use direct Server Actions for one-off operations
3. Standardized error handling
4. Type-safe data fetching

## When to Use Each Pattern

### SWR with Server Actions

Use this pattern for:
- Lists of entities (borrowers, counterparties, etc.)
- Data that needs real-time updates
- Data that benefits from caching and revalidation

Example:
```typescript
export function useEntities() {
  const { data, error, isLoading, mutate } = useSWR<Entity[]>(
    'entities',
    () => getEntities()
  )
  // ... CRUD operations
}
```

### Direct Server Actions

Use this pattern for:
- One-off operations (calculations, analytics)
- Infrequently updated data
- Complex operations that don't need caching

Example:
```typescript
export async function calculateAnalytics() {
  'use server'
  // ... calculation logic
}
```

### Error Handling

Always use the standardized error handling utilities:
```typescript
import { withErrorHandling } from '@/lib/error-handling'

const result = await withErrorHandling(
  'fetch entities',
  async () => await getEntities()
)
```

## Best Practices

1. **Type Safety**
   - Always define TypeScript interfaces for your data
   - Use zod for runtime validation when needed

2. **Error Handling**
   - Use the `AppError` class for custom errors
   - Always show user-friendly error messages
   - Log errors appropriately

3. **Performance**
   - Use SWR's built-in caching
   - Implement proper revalidation strategies
   - Consider using optimistic updates for better UX

4. **Testing**
   - Mock SWR hooks in tests
   - Test error cases
   - Verify loading states

## Examples

### Creating a New Data Hook

1. Define your types:
```typescript
interface MyEntity {
  id: string
  name: string
  // ... other fields
}
```

2. Create the hook:
```typescript
export function useMyEntities() {
  const { data, error, isLoading, mutate } = useSWR<MyEntity[]>(
    'my-entities',
    () => getMyEntities()
  )

  const create = useCallback(async (data: Partial<MyEntity>) => {
    await createMyEntity(data)
    mutate()
  }, [mutate])

  // ... other CRUD operations

  return {
    entities: data,
    isLoading,
    isError: error,
    create,
    // ... other operations
  }
}
```

3. Use in components:
```typescript
function MyComponent() {
  const { entities, isLoading, create } = useMyEntities()

  if (isLoading) return <Loading />
  
  return (
    // ... render component
  )
}
``` 