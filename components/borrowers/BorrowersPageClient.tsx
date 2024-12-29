"use client"

import '@/lib/ag-grid-init'
import { PageLayout, PageHeader } from '@/components/layout/PageLayout'
import { BorrowerList } from './BorrowerList'
import { useBorrowers } from '@/hooks/useBorrowers'

export function BorrowersPageClient() {
  const {
    borrowers,
    isLoading,
    error,
    refresh
  } = useBorrowers()

  return (
    <PageLayout
      header={
        <PageHeader
          title="Borrowers"
          description="Manage your borrower relationships"
        />
      }
      isLoading={isLoading}
      error={error}
      retry={refresh}
    >
      <BorrowerList borrowers={borrowers || []} onUpdate={refresh} />
    </PageLayout>
  )
} 