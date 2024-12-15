import { Suspense } from 'react'
import { BorrowersPageClient } from '@/components/BorrowersPageClient'
import { PageLayout } from '@/components/PageLayout'
import { Loading } from '@/components/ui/loading'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function BorrowersPage() {
  return (
    <Suspense fallback={<Loading variant="skeleton" count={5} />}>
      <BorrowersPageClient />
    </Suspense>
  )
} 