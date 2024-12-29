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
import { NewLoanModal } from './NewLoanModal'
import { Button } from '@/components/ui/button'
import { Info, Loader2 } from 'lucide-react'
import { type Loan, type Trade, type FacilityPosition } from '@prisma/client'

interface ExpandedState {
  [key: string]: boolean;
}

interface TradeBalance {
  completed: number;
  open: number;
  total: number;
}

interface FacilityPositionWithTrades extends FacilityPosition {
  openTrades: {
    buys: number;
    sells: number;
    net: number;
  };
  settledPosition: number;
  netPosition: number;
  lender: {
    entity: {
      legalName: string;
    };
  };
}

interface LoanWithTrades extends Loan {
  tradeBalance: TradeBalance;
  facilityPositions: FacilityPositionWithTrades[];
  trades: Trade[];
  facility: {
    creditAgreement: {
      borrower: {
        legalName: string;
      };
      lender: {
        legalName: string;
      };
    };
  };
}

export function LoanPositionsInventoryComponent() {
  const [loans, setLoans] = useState<LoanWithTrades[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({})
  const [filters, setFilters] = useState({
    id: '',
    facilityId: '',
    amount: '',
    outstandingAmount: '',
    status: ''
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [positionsData, tradesData] = await Promise.all([
        getInventory(),
        getTradeHistory()
      ])
      setLoans(positionsData)
      setTrades(tradesData)
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
      const loanTrades = trades.filter(trade => trade.facilityId === position.facilityId)
      
      // Calculate overall trade balance
      const tradeBalance = loanTrades.reduce((acc, trade) => {
        const amount = trade.status === 'Buy' ? trade.amount : -trade.amount
        if (trade.status === 'COMPLETED') {
          acc.completed += amount
        } else {
          acc.open += amount
        }
        acc.total += amount
        return acc
      }, { completed: 0, open: 0, total: 0 } as TradeBalance)

      // Calculate facility positions with open trades
      const facilityPositionsWithTrades = position.facilityPositions.map(facilityPos => {
        const lenderTrades = loanTrades.filter(trade => 
          trade.status === 'PENDING' && 
          trade.counterpartyId === facilityPos.lenderId
        )

        const openTrades = lenderTrades.reduce((acc, trade) => {
          if (trade.status === 'Buy') {
            acc.buys += trade.amount
          } else {
            acc.sells += trade.amount
          }
          acc.net = acc.buys - acc.sells
          return acc
        }, { buys: 0, sells: 0, net: 0 })

        const settledPosition = facilityPos.amount
        const netPosition = settledPosition + openTrades.net

        return {
          ...facilityPos,
          openTrades,
          settledPosition,
          netPosition
        }
      })

      return {
        ...position,
        tradeBalance,
        facilityPositions: facilityPositionsWithTrades
      }
    })
  }, [loans, trades])

  const totals = useMemo(() => {
    return positionsWithDetailedTrades.reduce((acc, position) => ({
      amount: acc.amount + position.amount,
      completedTradeBalance: acc.completedTradeBalance + position.tradeBalance.completed,
      openTradeBalance: acc.openTradeBalance + position.tradeBalance.open,
      netPosition: acc.netPosition + position.tradeBalance.total
    }), {
      amount: 0,
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

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getAgentBadge = (position: LoanWithTrades) => {
    const isAgent = position.facility.creditAgreement.lender.legalName === 'NxtBank'
    const isParticipant = position.facilityPositions.some(fp => 
      fp.lender.entity.legalName === 'NxtBank'
    )

    if (isAgent) {
      return (
        <span className="text-sm font-medium text-green-600">Agent</span>
      )
    }
    if (isParticipant) {
      return (
        <span className="text-sm font-medium text-gray-500">Participant</span>
      )
    }
    return null
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
              <NewLoanModal onLoanCreated={loadData} />
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
                <TableHead>ID</TableHead>
                <TableHead>Facility ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Outstanding Amount</TableHead>
                <TableHead>Completed Trade Balance</TableHead>
                <TableHead>Open Trade Balance</TableHead>
                <TableHead>Net Position</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionsWithDetailedTrades.map((position) => (
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
                    <TableCell>{position.id}</TableCell>
                    <TableCell>{position.facilityId}</TableCell>
                    <TableCell>{formatCurrency(position.amount)}</TableCell>
                    <TableCell>{formatCurrency(position.outstandingAmount)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.completed)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.open)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.total)}</TableCell>
                    <TableCell>{getStatusBadge(position.status)}</TableCell>
                  </TableRow>
                  {expandedRows[position.id] && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="p-2">Lender ID</TableHead>
                              <TableHead className="p-2">Lender Name</TableHead>
                              <TableHead className="p-2">Settled Position</TableHead>
                              <TableHead className="p-2">Open Buys</TableHead>
                              <TableHead className="p-2">Open Sells</TableHead>
                              <TableHead className="p-2">Net Open Position</TableHead>
                              <TableHead className="p-2">Total Position</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {position.facilityPositions.map((facilityPos) => (
                              <TableRow key={facilityPos.id}>
                                <TableCell className="p-2">{facilityPos.lenderId}</TableCell>
                                <TableCell className="p-2">{facilityPos.lender.entity.legalName}</TableCell>
                                <TableCell className="p-2">{formatCurrency(facilityPos.settledPosition)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(facilityPos.openTrades.buys)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(facilityPos.openTrades.sells)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(facilityPos.openTrades.net)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(facilityPos.netPosition)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              <TableRow className="font-medium bg-muted/50">
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>{formatCurrency(totals.amount)}</TableCell>
                <TableCell></TableCell>
                <TableCell>{formatCurrency(totals.completedTradeBalance)}</TableCell>
                <TableCell>{formatCurrency(totals.openTradeBalance)}</TableCell>
                <TableCell>{formatCurrency(totals.netPosition)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}