"use client"

import { PageLayout, PageHeader } from '@/components/PageLayout'
import { BorrowerList } from '@/components/borrowers/BorrowerList'
import { useBorrowers } from '@/hooks/useBorrowers'

export function BorrowersPageClient() {
  const {
    borrowers,
    isLoading,
    isError: error,
    mutate
  } = useBorrowers()

  console.log('Borrowers data:', borrowers)
  console.log('Loading:', isLoading)
  console.log('Error:', error)

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
      retry={() => mutate()}
    >
      <BorrowerList borrowers={borrowers || []} />
    </PageLayout>
  )
} 