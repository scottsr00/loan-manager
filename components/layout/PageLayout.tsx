import { Suspense } from 'react'
import { Loading } from '@/components/ui/loading'
import { ErrorDisplay } from '@/components/ui/error'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface PageLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  isLoading?: boolean
  error?: Error | string | null
  retry?: () => void
}

export function PageLayout({
  children,
  header,
  isLoading,
  error,
  retry
}: PageLayoutProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      {header}
      
      {error ? (
        <ErrorDisplay error={error} retry={retry} />
      ) : isLoading ? (
        <Loading variant="skeleton" count={5} />
      ) : (
        <Suspense fallback={<Loading variant="skeleton" count={5} />}>
          {children}
        </Suspense>
      )}
    </div>
  )
} 