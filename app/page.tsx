import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanCalculatorComponent } from '@/components/LoanCalculator'
import { LoanPositionsInventoryComponent } from '@/components/LoanPositionsInventory'
import { TradeHistoryComponent } from '@/components/TradeHistory'
import { Analytics } from '@/components/Analytics'
import { getAnalytics } from '@/app/actions/getAnalytics'

export default async function DashboardPage() {
  const analyticsData = await getAnalytics()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>NxtBank Dashboard</CardTitle>
          <CardDescription>Comprehensive view of your loan portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <Analytics data={analyticsData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key features and tools</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="calculator">Loan Calculator</TabsTrigger>
              <TabsTrigger value="inventory">Loan Positions</TabsTrigger>
              <TabsTrigger value="tradeHistory">Trade History</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator">
              <LoanCalculatorComponent />
            </TabsContent>
            <TabsContent value="inventory">
              <LoanPositionsInventoryComponent />
            </TabsContent>
            <TabsContent value="tradeHistory">
              <TradeHistoryComponent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}