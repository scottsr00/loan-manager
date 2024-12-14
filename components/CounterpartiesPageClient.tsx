'use client'

import { useState } from 'react'
import { CounterpartyList } from '@/components/CounterpartyList'
import { NewCounterpartyModal } from '@/components/NewCounterpartyModal'
import { useRouter } from 'next/navigation'
import type { CounterpartyWithRelations } from '@/app/actions/getCounterparties'
import type { CounterpartyType } from '@/app/actions/getCounterpartyTypes'

interface CounterpartiesPageClientProps {
  counterparties: CounterpartyWithRelations[]
  counterpartyTypes: CounterpartyType[]
}

export function CounterpartiesPageClient({
  counterparties: initialCounterparties,
  counterpartyTypes,
}: CounterpartiesPageClientProps) {
  const router = useRouter()
  const [counterparties, setCounterparties] = useState(initialCounterparties)

  const handleCounterpartyCreated = (newCounterparty: CounterpartyWithRelations) => {
    setCounterparties(prev => [...prev, newCounterparty])
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Counterparties</h1>
        <NewCounterpartyModal
          counterpartyTypes={counterpartyTypes}
          onCounterpartyCreated={handleCounterpartyCreated}
        />
      </div>
      <CounterpartyList counterparties={counterparties} />
    </div>
  )
} 