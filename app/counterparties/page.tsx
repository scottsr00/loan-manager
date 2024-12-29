'use client'

import { useState } from 'react'
import { CounterpartyList } from '@/components/counterparties/CounterpartyList'
import { NewCounterpartyModal } from '@/components/counterparties/NewCounterpartyModal'
import { PageLayout } from '@/components/layout/PageLayout'
import { useCounterparties } from '@/hooks/useCounterparties'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CounterpartiesPage() {
  const { counterparties, isLoading, isError } = useCounterparties()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <PageLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Counterparties</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            New Counterparty
          </Button>
        </div>
        
        {isError ? (
          <div className="text-center text-red-500">
            Error loading counterparties
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CounterpartyList counterparties={counterparties || []} />
        )}

        <NewCounterpartyModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
        />
      </div>
    </PageLayout>
  )
} 