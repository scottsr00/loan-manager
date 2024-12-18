"use client"

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { NewBorrowerModal } from '@/components/borrowers/NewBorrowerModal'
import { useBorrowers } from '@/hooks/useBorrowers'
import { PageLayout, PageHeader } from '@/components/PageLayout'
import { BorrowerList } from '@/components/borrowers/BorrowerList'

export function BorrowersPageClient() {
  const {
    borrowers,
    isLoading,
    isError: error,
    mutate
  } = useBorrowers()

  const handleBorrowerCreated = async () => {
    await mutate()
  }

  const action = (
    <NewBorrowerModal onBorrowerCreated={handleBorrowerCreated}>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Borrower
      </Button>
    </NewBorrowerModal>
  )

  return (
    <PageLayout
      header={
        <PageHeader
          title="Borrowers"
          description="Manage your borrower relationships"
          action={action}
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