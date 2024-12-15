import { toast } from 'sonner'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown, context: string): AppError {
  console.error(`Error in ${context}:`, error)

  if (error instanceof AppError) {
    toast.error(error.message)
    return error
  }

  if (error instanceof Error) {
    const appError = new AppError(
      error.message || `An error occurred in ${context}`,
      'UNKNOWN_ERROR'
    )
    toast.error(appError.message)
    return appError
  }

  const appError = new AppError(
    `An unexpected error occurred in ${context}`,
    'UNKNOWN_ERROR'
  )
  toast.error(appError.message)
  return appError
}

export async function withErrorHandling<T>(
  context: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw handleError(error, context)
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
} 