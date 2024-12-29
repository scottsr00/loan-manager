'use client'

import { Fragment, useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Search, Shield, ShieldAlert } from 'lucide-react'
import { getInventory } from '@/server/actions/loan/getInventory'
import { getTradeHistory } from '@/server/actions/trade/getTradeHistory'
import { NewLoanModal } from '@/components/loans/NewLoanModal'
import { Button } from '@/components/ui/button'
import { Info, Loader2 } from 'lucide-react'
import { type Loan, type Trade, type FacilityPosition, type Prisma } from '@prisma/client'

interface ExpandedState {
  [key: string]: boolean;
}

interface TradeBalance {
  completed: number;
  open: number;
  total: number;
}

type LoanWithTrades = Prisma.LoanGetPayload<{
  include: {
    facility: {
      include: {
        creditAgreement: {
          include: {
            borrower: true
            lender: true
          }
        }
        positions: {
          include: {
            lender: {
              include: {
                entity: true
              }
            }
          }
        }
      }
    }
    transactions: true
  }
}>

export function LoanPositionsInventoryComponent() {
  const [loans, setLoans] = useState<LoanWithTrades[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({})

  const loadData = async () => {
    try {
      setIsLoading(true)
      const positionsData = await getInventory()
      setLoans(positionsData)
    } catch (err) {
      setError('Failed to load inventory positions')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const positionsWithDetailedTrades = useMemo(() => {
    return loans.map(position => {
      const pendingTransactions = position.transactions.filter(t => t.status === 'PENDING')
      
      const tradeBalance = pendingTransactions.reduce((acc, transaction) => {
        if (transaction.activityType === 'BUY') {
          acc.open += transaction.amount
        } else if (transaction.activityType === 'SELL') {
          acc.open -= transaction.amount
        }
        acc.total = acc.completed + acc.open
        return acc
      }, { completed: 0, open: 0, total: 0 } as TradeBalance)

      return {
        ...position,
        tradeBalance
      }
    })
  }, [loans])

  const totals = useMemo(() => {
    return positionsWithDetailedTrades.reduce((acc, position) => ({
      amount: acc.amount + position.amount,
      outstandingAmount: acc.outstandingAmount + position.outstandingAmount,
      completedTradeBalance: acc.completedTradeBalance + position.tradeBalance.completed,
      openTradeBalance: acc.openTradeBalance + position.tradeBalance.open,
      netPosition: acc.netPosition + position.tradeBalance.total
    }), {
      amount: 0,
      outstandingAmount: 0,
      completedTradeBalance: 0,
      openTradeBalance: 0,
      netPosition: 0
    })
  }, [positionsWithDetailedTrades])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>
      case 'CLOSED':
        return <Badge className="bg-red-500">Closed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const toggleRowExpansion = (loanId: string) => {
    setExpandedRows((prevExpandedRows) => {
      const newExpandedRows = { ...prevExpandedRows }
      newExpandedRows[loanId] = !newExpandedRows[loanId]
      return newExpandedRows
    })
  }

  const getAgentBadge = (position: LoanWithTrades) => {
    const isAgent = position.facility.creditAgreement.lender.isAgent
    return isAgent ? (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-green-600">Agent</span>
        <span className="text-xs text-gray-500">Full visibility</span>
      </div>
    ) : (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">Participant</span>
        <span className="text-xs text-gray-500">Limited visibility</span>
      </div>
    )
  }

  const getExpandedView = (position: LoanWithTrades) => {
    const isAgent = position.facility.creditAgreement.lender.isAgent
    const totalFacilityAmount = position.facility.positions.reduce((sum, pos) => sum + pos.amount, 0)

    if (isAgent) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2">Lender</TableHead>
              <TableHead className="p-2">Share %</TableHead>
              <TableHead className="p-2">Amount</TableHead>
              <TableHead className="p-2">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {position.facility.positions.map((pos) => (
              <TableRow key={pos.id}>
                <TableCell className="p-2">{pos.lender.entity.legalName}</TableCell>
                <TableCell className="p-2">{pos.share.toFixed(2)}%</TableCell>
                <TableCell className="p-2">{formatCurrency(pos.amount)}</TableCell>
                <TableCell className="p-2">{getStatusBadge(pos.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    } else {
      const ourPosition = position.facility.positions.find(
        pos => pos.lender.entity.isAgent
      )
      
      return (
        <div className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Facility Amount:</span>
              <span>{formatCurrency(totalFacilityAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">NxtBank Share:</span>
              <span>{ourPosition ? `${ourPosition.share.toFixed(2)}%` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Our Position:</span>
              <span>{ourPosition ? formatCurrency(ourPosition.amount) : 'N/A'}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              * As a participant, we only have visibility into our share of the facility
            </div>
          </div>
        </div>
      )
    }
  }

  if (isLoading) {
    return <div>Loading inventory positions...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Loan Positions</CardTitle>
              <CardDescription>Overview of agent and participant positions</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Agent Facilities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                <span className="text-sm">Participant Facilities</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Facility ID</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Our Share</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionsWithDetailedTrades.map((position) => {
                const totalFacilityAmount = position.facility.positions.reduce((sum, pos) => sum + pos.amount, 0)
                const ourPosition = position.facility.positions.find(
                  pos => pos.lender.entity.isAgent
                )

                return (
                  <Fragment key={position.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRowExpansion(position.id)}
                    >
                      <TableCell>
                        {expandedRows[position.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </TableCell>
                      <TableCell>{getAgentBadge(position)}</TableCell>
                      <TableCell>{position.facility.creditAgreement.borrower.legalName}</TableCell>
                      <TableCell>{position.facilityId}</TableCell>
                      <TableCell>{formatCurrency(totalFacilityAmount)}</TableCell>
                      <TableCell>{ourPosition ? formatCurrency(ourPosition.amount) : 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(position.outstandingAmount)}</TableCell>
                      <TableCell>{getStatusBadge(position.status)}</TableCell>
                    </TableRow>
                    {expandedRows[position.id] && (
                      <TableRow>
                        <TableCell colSpan={8} className="p-0">
                          {getExpandedView(position)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
              <TableRow className="font-medium bg-muted/50">
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>{formatCurrency(totals.amount)}</TableCell>
                <TableCell>{formatCurrency(totals.outstandingAmount)}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}