"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BorrowerDetailsModal } from "./BorrowerDetailsModal"
import { useState } from "react"
import type { Borrower } from "@/types/borrower"
import { Badge } from "@/components/ui/badge"

const BorrowerActions = ({ borrower }: { borrower: Borrower }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BorrowerDetailsModal
        borrower={borrower}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  )
}

export const borrowerDetailsColumns: ColumnDef<Borrower>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "taxId",
    header: "Tax ID",
  },
  {
    accessorKey: "jurisdiction",
    header: "Jurisdiction",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "onboardingStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.onboardingStatus
      return (
        <Badge variant={status === 'COMPLETED' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <BorrowerActions borrower={row.original} />,
  },
] 