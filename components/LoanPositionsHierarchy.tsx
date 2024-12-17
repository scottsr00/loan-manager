'use client'

import { Fragment, useState } from 'react'
import { usePositions } from '@/hooks/usePositions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ExpandedState {
  [key: string]: {
    isExpanded: boolean;
    facilities: {
      [key: string]: {
        isExpanded: boolean;
        loans: {
          [key: string]: boolean;
        };
      };
    };
  };
}

export function LoanPositionsHierarchy() {
  const { positions, isLoading, error } = usePositions()
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const toggleAgreement = (agreementId: string) => {
    setExpanded(prev => ({
      ...prev,
      [agreementId]: {
        isExpanded: !prev[agreementId]?.isExpanded,
        facilities: prev[agreementId]?.facilities || {}
      }
    }))
  }

  const toggleFacility = (agreementId: string, facilityId: string) => {
    setExpanded(prev => ({
      ...prev,
      [agreementId]: {
        ...prev[agreementId],
        facilities: {
          ...prev[agreementId]?.facilities,
          [facilityId]: {
            isExpanded: !prev[agreementId]?.facilities[facilityId]?.isExpanded,
            loans: prev[agreementId]?.facilities[facilityId]?.loans || {}
          }
        }
      }
    }))
  }

  const toggleLoan = (agreementId: string, facilityId: string, loanId: string) => {
    setExpanded(prev => ({
      ...prev,
      [agreementId]: {
        ...prev[agreementId],
        facilities: {
          ...prev[agreementId]?.facilities,
          [facilityId]: {
            ...prev[agreementId]?.facilities[facilityId],
            loans: {
              ...prev[agreementId]?.facilities[facilityId]?.loans,
              [loanId]: !prev[agreementId]?.facilities[facilityId]?.loans[loanId]
            }
          }
        }
      }
    }))
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
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center p-8 text-destructive">{error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Loan Positions</CardTitle>
              <CardDescription>Hierarchical view of credit agreements, facilities, and loans</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Maturity Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map(agreement => (
                <Fragment key={agreement.id}>
                  {/* Credit Agreement Row */}
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleAgreement(agreement.id)}
                  >
                    <TableCell>
                      {expanded[agreement.id]?.isExpanded ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{agreement.agreementName}</TableCell>
                    <TableCell>Credit Agreement</TableCell>
                    <TableCell>{formatCurrency(agreement.amount)}</TableCell>
                    <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                    <TableCell>{new Date(agreement.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(agreement.maturityDate).toLocaleDateString()}</TableCell>
                  </TableRow>

                  {/* Facility Rows */}
                  {expanded[agreement.id]?.isExpanded && agreement.facilities.map(facility => (
                    <Fragment key={facility.id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50 bg-muted/30"
                        onClick={() => toggleFacility(agreement.id, facility.id)}
                      >
                        <TableCell className="pl-8">
                          {expanded[agreement.id]?.facilities[facility.id]?.isExpanded ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </TableCell>
                        <TableCell className="font-medium">{facility.facilityName}</TableCell>
                        <TableCell>{facility.facilityType}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{formatCurrency(facility.commitmentAmount)} (Committed)</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(facility.availableAmount)} (Available)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(facility.status)}</TableCell>
                        <TableCell colSpan={2}>
                          <div className="space-y-1">
                            <div>{facility.interestType}</div>
                            <div className="text-sm text-muted-foreground">
                              {facility.baseRate} + {facility.margin}%
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Loan Rows */}
                      {expanded[agreement.id]?.facilities[facility.id]?.isExpanded && facility.loans.map(loan => (
                        <Fragment key={loan.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50 bg-muted/20"
                            onClick={() => toggleLoan(agreement.id, facility.id, loan.id)}
                          >
                            <TableCell className="pl-12">
                              {expanded[agreement.id]?.facilities[facility.id]?.loans[loan.id] ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </TableCell>
                            <TableCell className="font-medium">Drawdown #{loan.drawdownNumber}</TableCell>
                            <TableCell>Loan</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div>{formatCurrency(loan.amount)} (Original)</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(loan.outstandingAmount)} (Outstanding)
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(loan.status)}</TableCell>
                            <TableCell>{new Date(loan.drawdownDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(loan.maturityDate).toLocaleDateString()}</TableCell>
                          </TableRow>

                          {/* Loan Details */}
                          {expanded[agreement.id]?.facilities[facility.id]?.loans[loan.id] && (
                            <TableRow className="bg-muted/10">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Loan Positions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Lender</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Share</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {loan.positions.map((position, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{position.lender}</TableCell>
                                              <TableCell>{formatCurrency(position.amount)}</TableCell>
                                              <TableCell>{position.share}%</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Next Payment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {loan.nextPayment ? (
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span>Due Date:</span>
                                            <span>{new Date(loan.nextPayment.dueDate).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Principal:</span>
                                            <span>{formatCurrency(loan.nextPayment.principalAmount)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Interest:</span>
                                            <span>{formatCurrency(loan.nextPayment.interestAmount)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span>{getStatusBadge(loan.nextPayment.status)}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center text-muted-foreground">
                                          No upcoming payments
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
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