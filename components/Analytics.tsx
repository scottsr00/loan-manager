'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface AnalyticsProps {
  tradeVolume: {
    date: string
    volume: number
  }[]
  buysSells: {
    type: string
    amount: number
  }[]
  positionsByDeal: {
    dealName: string
    position: number
  }[]
  lenderShares: {
    dealName: string
    shares: {
      lenderName: string
      share: number
    }[]
  }[]
  accrualProjection: {
    date: string
    amount: number
  }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AnalyticsComponent({
  tradeVolume,
  buysSells,
  positionsByDeal,
  lenderShares,
  accrualProjection
}: AnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Trade Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Volume</CardTitle>
            <CardDescription>Daily trading volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tradeVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={formatCurrency} />
                  <Bar dataKey="volume" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Buys vs Sells Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Buys vs Sells</CardTitle>
            <CardDescription>Distribution of trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buysSells}
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {buysSells.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatCurrency} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions by Deal */}
      <Card>
        <CardHeader>
          <CardTitle>Positions by Deal</CardTitle>
          <CardDescription>Current position size for each deal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionsByDeal} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="dealName" width={150} />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="position" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lender Shares by Deal */}
      <Card>
        <CardHeader>
          <CardTitle>Lender Shares by Deal</CardTitle>
          <CardDescription>Distribution of lender participation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={lenderShares[0]?.dealName}>
            <TabsList className="w-full">
              {lenderShares.map((deal) => (
                <TabsTrigger key={deal.dealName} value={deal.dealName}>
                  {deal.dealName}
                </TabsTrigger>
              ))}
            </TabsList>
            {lenderShares.map((deal) => (
              <TabsContent key={deal.dealName} value={deal.dealName}>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deal.shares}
                        dataKey="share"
                        nameKey="lenderName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {deal.shares.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Accrual Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Accrual Projection</CardTitle>
          <CardDescription>Projected accruals for current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accrualProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={formatCurrency} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 