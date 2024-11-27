'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getTradeHistory, type Trade } from '@/app/actions/getTradeHistory'
import { BookTradeModal } from './BookTradeModal'

interface ExpandedState {
  [key: number]: boolean;
}

export function TradeHistoryComponent() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [filters, setFilters] = useState({
    id: '',
    loanId: '',
    counterparty: '',
    status: '',
    tradeType: ''
  })

  const loadTradeHistory = async () => {
    try {
      setIsLoading(true)
      const data = await getTradeHistory()
      setTrades(data)
    } catch (err) {
      setError('Failed to load trade history')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTradeHistory()
  }, [])

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => 
      trade.id.toString().includes(filters.id) &&
      trade.loanId.toLowerCase().includes(filters.loanId.toLowerCase()) &&
      trade.counterparty.toLowerCase().includes(filters.counterparty.toLowerCase()) &&
      trade.status.toLowerCase().includes(filters.status.toLowerCase()) &&
      trade.tradeType.toLowerCase().includes(filters.tradeType.toLowerCase())
    )
  }, [trades, filters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: Trade['status']) => {
    const badgeClass = status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
    return <Badge className={`${badgeClass} justify-start`}>{status}</Badge>
  }

  const getTradeTypeBadge = (tradeType: Trade['tradeType']) => {
    const badgeClass = tradeType === 'Buy' ? 'bg-blue-500' : 'bg-red-500'
    return <Badge className={`${badgeClass} justify-start`}>{tradeType}</Badge>
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleRow = (id: number) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          Loading trade history...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-red-500">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Trade History</CardTitle>
            <CardDescription>Overview of completed and open trades. Click on a trade to view historical balances.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <BookTradeModal onTradeBooked={loadTradeHistory}>
              <span className="text-lg">+</span>
              <span>Add New Trade</span>
            </BookTradeModal>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              <Input 
                placeholder="Filter by ID"
                value={filters.id}
                onChange={(e) => handleFilterChange('id', e.target.value)}
              />
              {/* Add other filter inputs */}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Trade Date</TableHead>
                  <TableHead>Settlement Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => (
                  <React.Fragment key={trade.id}>
                    <TableRow 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(trade.id)}
                    >
                      <TableCell>
                        {expanded[trade.id] ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </TableCell>
                      <TableCell>{trade.id}</TableCell>
                      <TableCell>{trade.loanId}</TableCell>
                      <TableCell>{trade.dealName}</TableCell>
                      <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(trade.price)}</TableCell>
                      <TableCell>{trade.counterparty}</TableCell>
                      <TableCell>{formatDate(trade.tradeDate)}</TableCell>
                      <TableCell>{formatDate(trade.expectedSettlementDate)}</TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell>{getTradeTypeBadge(trade.tradeType)}</TableCell>
                    </TableRow>
                    {expanded[trade.id] && (
                      <TableRow>
                        <TableCell colSpan={10} className="p-0">
                          <div className="bg-muted/50 p-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Balance</TableHead>
                                  <TableHead>Accrued Interest</TableHead>
                                  <TableHead>Total Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {trade.historicalBalances.map((balance, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{formatDate(new Date(balance.date))}</TableCell>
                                    <TableCell>{balance.balance}</TableCell>
                                    <TableCell>{formatCurrency(trade.accruedInterest)}</TableCell>
                                    <TableCell>{formatCurrency(balance.balance + trade.accruedInterest)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}