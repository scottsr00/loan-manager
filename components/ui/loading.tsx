import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'skeleton'
  className?: string
  count?: number
  children?: React.ReactNode
}

export function Loading({
  variant = 'spinner',
  className,
  count = 3,
  children
}: LoadingProps) {
  if (variant === 'skeleton' && children) {
    return (
      <div className={cn('animate-pulse', className)}>
        {children}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
} 