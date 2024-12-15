'use client'

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorProps {
  title?: string
  error: Error | string
  retry?: () => void
}

export function ErrorDisplay({
  title = 'Error',
  error,
  retry
}: ErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <Alert variant="destructive" className="flex gap-2">
      <AlertTriangle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{errorMessage}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
} 