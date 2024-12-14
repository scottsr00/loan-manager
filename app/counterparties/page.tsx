import { Suspense } from 'react'
import { getCounterparties } from '@/app/actions/getCounterparties'
import { getCounterpartyTypes } from '@/app/actions/getCounterpartyTypes'
import { CounterpartiesPageClient } from '@/components/CounterpartiesPageClient'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function CounterpartiesContent() {
  const [counterparties, counterpartyTypes] = await Promise.all([
    getCounterparties(),
    getCounterpartyTypes(),
  ])

  return <CounterpartiesPageClient counterparties={counterparties} counterpartyTypes={counterpartyTypes} />
}

export default function CounterpartiesPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        }
      >
        <CounterpartiesContent />
      </Suspense>
    </div>
  )
} 