'use client'

import { CounterpartyList } from '@/components/CounterpartyList'
import { NewCounterpartyModal } from '@/components/NewCounterpartyModal'
import { PageLayout } from '@/components/PageLayout'

export default function CounterpartiesPage() {
  return (
    <PageLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Counterparties</h1>
          <NewCounterpartyModal onCounterpartyCreated={() => window.location.reload()} />
        </div>
        <CounterpartyList />
      </div>
    </PageLayout>
  )
} 