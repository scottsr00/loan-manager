import { TradeHistory } from '@/components/TradeHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TradeHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>View and manage your trade history</CardDescription>
      </CardHeader>
      <CardContent>
        <TradeHistory />
      </CardContent>
    </Card>
  )
} 