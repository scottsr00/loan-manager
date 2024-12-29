import { TransactionHistory } from '@/components/transactions/TransactionHistory'

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction History</h1>
      </div>
      <TransactionHistory />
    </div>
  )
} 