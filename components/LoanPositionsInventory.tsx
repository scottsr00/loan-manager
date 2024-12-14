'use client'

import { Fragment, useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight, Search, Shield, ShieldAlert } from 'lucide-react'
import { getInventory, type LoanPosition } from '@/app/actions/getInventory'
import { getTradeHistory, type Trade } from '@/app/actions/getTradeHistory'
import { NewLoanModal } from './NewLoanModal'

interface ExpandedState {
  [key: string]: boolean;
}

interface TradeBalance {
  completed: number;
  open: number;
  total: number;
}

interface LenderPositionWithTrades extends LenderPosition {
  openTrades: {
    buys: number;
    sells: number;
    net: number;
  };
  settledPosition: number;
  netPosition: number;
}

interface LoanPositionWithTrades extends LoanPosition {
  tradeBalance: TradeBalance;
}

export function LoanPositionsInventoryComponent() {
  const [positions, setPositions] = useState<LoanPosition[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({})
  const [filters, setFilters] = useState({
    id: '',
    dealName: '',
    currentBalance: '',
    currentPeriodTerms: '',
    priorPeriodPaymentStatus: ''
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [positionsData, tradesData] = await Promise.all([
        getInventory(),
        getTradeHistory()
      ])
      setPositions(positionsData)
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
    return positions.map(position => {
      const loanTrades = trades.filter(trade => trade.loanId === position.id)
      
      // Calculate overall trade balance
      const tradeBalance = loanTrades.reduce((acc, trade) => {
        const amount = trade.tradeType === 'Buy' ? trade.quantity : -trade.quantity
        if (trade.status === 'Completed') {
          acc.completed += amount
        } else {
          acc.open += amount
        }
        acc.total += amount
        return acc
      }, { completed: 0, open: 0, total: 0 } as TradeBalance)

      // Calculate lender positions with open trades
      const lenderPositionsWithTrades = position.lenderPositions.map(lenderPos => {
        const lenderTrades = loanTrades.filter(trade => 
          trade.status === 'Open' && 
          trade.counterparty === lenderPos.lenderName
        )

        const openTrades = lenderTrades.reduce((acc, trade) => {
          if (trade.tradeType === 'Buy') {
            acc.buys += trade.quantity
          } else {
            acc.sells += trade.quantity
          }
          acc.net = acc.buys - acc.sells
          return acc
        }, { buys: 0, sells: 0, net: 0 })

        const settledPosition = lenderPos.balance
        const netPosition = settledPosition + openTrades.net

        return {
          ...lenderPos,
          openTrades,
          settledPosition,
          netPosition
        }
      })

      return {
        ...position,
        tradeBalance,
        lenderPositions: lenderPositionsWithTrades
      }
    })
  }, [positions, trades])

  const totals = useMemo(() => {
    return positionsWithDetailedTrades.reduce((acc, position) => ({
      currentBalance: acc.currentBalance + position.currentBalance,
      completedTradeBalance: acc.completedTradeBalance + position.tradeBalance.completed,
      openTradeBalance: acc.openTradeBalance + position.tradeBalance.open,
      netPosition: acc.netPosition + position.tradeBalance.total
    }), {
      currentBalance: 0,
      completedTradeBalance: 0,
      openTradeBalance: 0,
      netPosition: 0
    })
  }, [positionsWithDetailedTrades])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusBadge = (status: LoanPosition['priorPeriodPaymentStatus']) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-500">Paid</Badge>
      case 'Overdue':
        return <Badge className="bg-red-500">Overdue</Badge>
      case 'Pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
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

  const getAgentBadge = (position: LoanPosition) => {
    const isAgent = position.agentBank === 'NxtBank'
    const isParticipant = position.lenderPositions.some(lp => lp.lenderName === 'NxtBank')

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
                <TableHead>Deal Name</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Completed Trade Balance</TableHead>
                <TableHead>Open Trade Balance</TableHead>
                <TableHead>Net Position</TableHead>
                <TableHead>Current Period Terms</TableHead>
                <TableHead>Prior Period Payment Status</TableHead>
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
                    <TableCell>{position.dealName}</TableCell>
                    <TableCell>{formatCurrency(position.currentBalance)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.completed)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.open)}</TableCell>
                    <TableCell>{formatCurrency(position.tradeBalance.total)}</TableCell>
                    <TableCell>{position.currentPeriodTerms}</TableCell>
                    <TableCell>{getStatusBadge(position.priorPeriodPaymentStatus)}</TableCell>
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
                            {position.lenderPositions.map((lender) => (
                              <TableRow key={lender.lenderId}>
                                <TableCell className="p-2">{lender.lenderId}</TableCell>
                                <TableCell className="p-2">{lender.lenderName}</TableCell>
                                <TableCell className="p-2">{formatCurrency(lender.settledPosition)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(lender.openTrades.buys)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(lender.openTrades.sells)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(lender.openTrades.net)}</TableCell>
                                <TableCell className="p-2">{formatCurrency(lender.netPosition)}</TableCell>
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
                <TableCell>{formatCurrency(totals.currentBalance)}</TableCell>
                <TableCell>{formatCurrency(totals.completedTradeBalance)}</TableCell>
                <TableCell>{formatCurrency(totals.openTradeBalance)}</TableCell>
                <TableCell>{formatCurrency(totals.netPosition)}</TableCell>
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