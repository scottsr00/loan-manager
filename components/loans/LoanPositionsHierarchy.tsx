'use client'

import { usePositions } from '@/hooks/usePositions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Fragment, useState } from 'react'

interface ExpandedState {
  [key: string]: {
    isExpanded: boolean;
    facilities: {
      [key: string]: {
        isExpanded: boolean;
      };
    };
  };
}

export function LoanPositionsHierarchy() {
  const { positions, isLoading, error } = usePositions()
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const toggleAgreement = (agreementId: string) => {
    setExpanded(prev => {
      const isCurrentlyExpanded = prev[agreementId]?.isExpanded;
      return {
        ...prev,
        [agreementId]: {
          isExpanded: !isCurrentlyExpanded,
          facilities: prev[agreementId]?.facilities || {}
        }
      };
    });
  }

  const toggleFacility = (agreementId: string, facilityId: string) => {
    setExpanded(prev => {
      const currentAgreement = prev[agreementId] || { isExpanded: true, facilities: {} };
      const currentFacility = currentAgreement.facilities[facilityId] || { isExpanded: false };

      return {
        ...prev,
        [agreementId]: {
          ...currentAgreement,
          facilities: {
            ...currentAgreement.facilities,
            [facilityId]: {
              ...currentFacility,
              isExpanded: !currentFacility.isExpanded
            }
          }
        }
      };
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'TERMINATED':
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Positions</CardTitle>
        <CardDescription>View all credit agreements and their facilities</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Agreement Number</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <Fragment key={position.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleAgreement(position.id)}
                  >
                    <TableCell>
                      {expanded[position.id]?.isExpanded ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell>{position.agreementNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div>{position.borrower.name}</div>
                        {position.borrower.type && (
                          <Badge variant="outline">{position.borrower.type}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(position.amount)} {position.currency}</TableCell>
                    <TableCell>{getStatusBadge(position.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div>{position.agent.name}</div>
                        {position.agent.isAgent && (
                          <Badge variant="outline">Agent</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {expanded[position.id]?.isExpanded && position.facilities.map((facility) => (
                    <Fragment key={facility.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50 bg-muted/30"
                        onClick={() => toggleFacility(position.id, facility.id)}
                      >
                        <TableCell className="pl-8">
                          {expanded[position.id]?.facilities[facility.id]?.isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </TableCell>
                        <TableCell>{facility.facilityName}</TableCell>
                        <TableCell>{facility.facilityType}</TableCell>
                        <TableCell>
                          <div>
                            <div>{formatCurrency(facility.commitmentAmount)} {facility.currency}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(facility.commitmentAmount - (facility.loans?.reduce((sum, loan) => sum + loan.outstandingAmount, 0) || 0))} (Available)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 