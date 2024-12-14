import { BorrowersPageClient } from "@/components/BorrowersPageClient"

export default async function BorrowersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Borrowers</h2>
          <p className="text-muted-foreground">
            Manage your borrower relationships
          </p>
        </div>
      </div>
      <BorrowersPageClient />
    </div>
  )
} 