"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/borrowers/columns"
import { NewBorrowerModal } from "@/components/borrowers/NewBorrowerModal"
import { useBorrowers } from "@/hooks/useBorrowers"

export function BorrowersPageClient() {
  const [isNewBorrowerModalOpen, setIsNewBorrowerModalOpen] = useState(false)
  const { data: borrowers, isLoading, error } = useBorrowers()

  if (error) {
    return <div>Error loading borrowers</div>
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsNewBorrowerModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Borrower
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={borrowers || []}
        isLoading={isLoading}
      />

      <NewBorrowerModal
        open={isNewBorrowerModalOpen}
        onOpenChange={setIsNewBorrowerModalOpen}
      />
    </>
  )
} 