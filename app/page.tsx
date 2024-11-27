import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoanCalculatorComponent } from '@/components/LoanCalculator'
import { LoanPositionsInventoryComponent } from '@/components/LoanPositionsInventory'
import { TradeHistoryComponent } from '@/components/TradeHistory'

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Corporate Loan Management Dashboard</CardTitle>
        <CardDescription>Calculate loans, manage positions, and view trade history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="calculator">Loan Calculator</TabsTrigger>
            <TabsTrigger value="inventory">Loan Positions Inventory</TabsTrigger>
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
  )
}