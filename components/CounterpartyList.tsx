'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CounterpartyWithRelations } from '@/app/actions/getCounterparties'
import { CounterpartyDetailsModal } from '@/components/CounterpartyDetailsModal'
import { useRouter } from 'next/navigation'

interface CounterpartyListProps {
  counterparties: CounterpartyWithRelations[]
}

export function CounterpartyList({ counterparties: initialCounterparties }: CounterpartyListProps) {
  const [counterparties, setCounterparties] = useState(initialCounterparties)
  const [selectedCounterparty, setSelectedCounterparty] = useState<CounterpartyWithRelations | null>(null)
  const router = useRouter()

  const handleDelete = (deletedCounterparty: CounterpartyWithRelations) => {
    setCounterparties(prev => prev.filter(c => c.id !== deletedCounterparty.id))
    router.refresh()
  }

  const getKycStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getOnboardingStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'new':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legal Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Parent Name</TableHead>
            <TableHead>KYC Status</TableHead>
            <TableHead>Onboarding Status</TableHead>
            <TableHead>Primary Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {counterparties.map((counterparty) => (
            <TableRow
              key={counterparty.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedCounterparty(counterparty)}
            >
              <TableCell className="font-medium">{counterparty.legalName}</TableCell>
              <TableCell>{counterparty.counterpartyType.name}</TableCell>
              <TableCell>{counterparty.parentName || '-'}</TableCell>
              <TableCell>
                <Badge className={getKycStatusColor(counterparty.kycStatus)}>
                  {counterparty.kycStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getOnboardingStatusColor(counterparty.onboardingStatus)}>
                  {counterparty.onboardingStatus}
                </Badge>
              </TableCell>
              <TableCell>
                {counterparty.contacts.find(c => c.isPrimary)
                  ? `${counterparty.contacts[0].firstName} ${counterparty.contacts[0].lastName}`
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CounterpartyDetailsModal
        counterparty={selectedCounterparty}
        onClose={() => setSelectedCounterparty(null)}
        onDelete={handleDelete}
      />
    </div>
  )
} 