"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Borrower } from "@/types/borrower"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Borrower>[] = [
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
  }
] 