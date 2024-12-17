"use client"

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/components/borrowers/columns'
import { NewBorrowerModal } from '@/components/borrowers/NewBorrowerModal'
import { BorrowerDetailsModal } from '@/components/borrowers/BorrowerDetailsModal'
import { useBorrowers } from '@/hooks/useBorrowers'
import { PageLayout, PageHeader } from '@/components/PageLayout'
import type { Borrower } from '@/types/borrower'
import { useState } from 'react'

export function BorrowersPageClient() {
  const {
    borrowers,
    isLoading,
    isError: error,
    mutate
  } = useBorrowers()

  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleBorrowerCreated = async () => {
    await mutate()
  }

  const handleRowClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower)
    setDetailsOpen(true)
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
      <DataTable
        columns={columns}
        data={borrowers || []}
        onRowClick={handleRowClick}
      />

      <BorrowerDetailsModal
        borrower={selectedBorrower}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </PageLayout>
  )
} 