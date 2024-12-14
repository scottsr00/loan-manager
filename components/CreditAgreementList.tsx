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
import { CreditAgreementWithRelations } from '@/app/actions/getCreditAgreements'
import { CreditAgreementDetailsModal } from '@/components/CreditAgreementDetailsModal'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface CreditAgreementListProps {
  creditAgreements: CreditAgreementWithRelations[]
}

export function CreditAgreementList({ creditAgreements: initialCreditAgreements }: CreditAgreementListProps) {
  const [creditAgreements, setCreditAgreements] = useState(initialCreditAgreements)
  const [selectedCreditAgreement, setSelectedCreditAgreement] = useState<CreditAgreementWithRelations | null>(null)
  const router = useRouter()

  const handleDelete = (deletedCreditAgreement: CreditAgreementWithRelations) => {
    setCreditAgreements(prev => prev.filter(ca => ca.id !== deletedCreditAgreement.id))
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'terminated':
        return 'bg-red-500'
      case 'defaulted':
        return 'bg-red-500'
      case 'matured':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement Name</TableHead>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Agent Bank</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Facilities</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditAgreements.map((creditAgreement) => (
            <TableRow
              key={creditAgreement.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setSelectedCreditAgreement(creditAgreement)}
            >
              <TableCell className="font-medium">{creditAgreement.agreementName}</TableCell>
              <TableCell>{creditAgreement.agreementNumber}</TableCell>
              <TableCell>{creditAgreement.borrower.legalName}</TableCell>
              <TableCell>{creditAgreement.agent.legalName}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(creditAgreement.status)}>
                  {creditAgreement.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatCurrency(creditAgreement.totalAmount, creditAgreement.currency)}
              </TableCell>
              <TableCell>
                {creditAgreement.facilities.length} facilities
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreditAgreementDetailsModal
        creditAgreement={selectedCreditAgreement}
        onClose={() => setSelectedCreditAgreement(null)}
        onDelete={handleDelete}
      />
    </div>
  )
} 