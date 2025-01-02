'use client'

import { TradeHistory } from '@/components/trades/TradeHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { getTrades } from '@/server/actions/trade/getTrades'
import { Loader2 } from 'lucide-react'
import { type TradeWithRelations } from '@/server/types/trade'

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTrades = async () => {
      try {
        const data = await getTrades()
        setTrades(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trades')
      } finally {
        setIsLoading(false)
      }
    }
    loadTrades()
  }, [])

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
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>View and manage your trade history</CardDescription>
      </CardHeader>
      <CardContent>
        <TradeHistory trades={trades} />
      </CardContent>
    </Card>
  )
} 