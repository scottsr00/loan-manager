'use client'

import { Analytics } from '@/components/Analytics'
import { getAnalytics } from '@/app/actions/getAnalytics'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

async function AnalyticsContent() {
  const data = await getAnalytics()
  return <Analytics data={data} />
}

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="col-span-4 h-[300px]" />
      <Skeleton className="col-span-2 h-[300px]" />
      <Skeleton className="col-span-2 h-[300px]" />
      <Skeleton className="col-span-4 h-[400px]" />
      <Skeleton className="col-span-4 h-[300px]" />
    </div>
  )
} 