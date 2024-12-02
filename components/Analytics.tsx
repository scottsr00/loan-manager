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
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  Scatter
} from 'recharts'
import { ArrowUpRight, ArrowDownRight, TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react'

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

const COLORS = {
  primary: '#94a3b8',
  secondary: '#93c5fd',
  accent: '#fcd34d',
  warning: '#fca5a5',
  info: '#a5b4fc',
  chart: [
    '#94a3b8',
    '#93c5fd',
    '#fcd34d',
    '#fca5a5',
    '#a5b4fc',
    '#f9a8d4',
    '#c4b5fd',
    '#99f6e4',
  ]
}

const CHART_CONFIG = {
  gridColor: '#e2e8f0',
  tooltipStyle: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px'
  }
}

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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Calculate summary metrics
  const totalTradeVolume = tradeVolume.reduce((sum, day) => sum + day.volume, 0)
  const averageTradeSize = totalTradeVolume / tradeVolume.length
  const totalBuys = buysSells.find(t => t.type === 'Buy')?.amount || 0
  const totalSells = buysSells.find(t => t.type === 'Sell')?.amount || 0
  const netPosition = totalBuys - totalSells
  const totalPositions = positionsByDeal.reduce((sum, deal) => sum + deal.position, 0)

  // Calculate 7-day moving average for trade volume
  const movingAverage = tradeVolume.map((day, index, array) => {
    const start = Math.max(0, index - 6)
    const subset = array.slice(start, index + 1)
    const average = subset.reduce((sum, d) => sum + d.volume, 0) / subset.length
    return {
      ...day,
      ma7: average
    }
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-blue-900">Total Volume</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalTradeVolume)}</div>
            <p className="text-xs text-blue-700">
              Avg. {formatCurrency(averageTradeSize)} per trade
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-green-900">Net Position</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              {netPosition >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-green-900">{formatCurrency(netPosition)}</div>
            <p className="text-xs text-green-700">
              {formatPercentage((netPosition / totalTradeVolume) * 100)} of total volume
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fefce8] to-[#fef9c3] opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-yellow-900">Total Positions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <PieChartIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-yellow-900">{formatCurrency(totalPositions)}</div>
            <p className="text-xs text-yellow-700">
              Across {positionsByDeal.length} deals
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] opacity-50" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-purple-900">Projected Accrual</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(accrualProjection[accrualProjection.length - 1]?.amount || 0)}
            </div>
            <p className="text-xs text-purple-700">
              End of period estimate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enhanced Trade Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trading Activity Analysis
            </CardTitle>
            <CardDescription>Volume and 7-day moving average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={movingAverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_CONFIG.gridColor} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: CHART_CONFIG.gridColor }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: CHART_CONFIG.gridColor }}
                  />
                  <Tooltip 
                    formatter={formatCurrency}
                    contentStyle={CHART_CONFIG.tooltipStyle}
                  />
                  <Legend />
                  <Bar 
                    dataKey="volume" 
                    fill={COLORS.primary} 
                    name="Daily Volume"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma7"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    name="7-day MA"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Buy/Sell Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Trading Direction Analysis
            </CardTitle>
            <CardDescription>Buy/Sell distribution with volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buysSells}
                    dataKey="amount"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={{ stroke: CHART_CONFIG.gridColor }}
                  >
                    {buysSells.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS.chart[index % COLORS.chart.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={formatCurrency}
                    contentStyle={CHART_CONFIG.tooltipStyle}
                  />
                  <Legend 
                    formatter={(value) => `${value} Volume`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Position Analysis
          </CardTitle>
          <CardDescription>Current position size and distribution by deal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={positionsByDeal} 
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={CHART_CONFIG.gridColor}
                  horizontal={false}
                />
                <XAxis 
                  type="number" 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: CHART_CONFIG.gridColor }}
                />
                <YAxis 
                  type="category" 
                  dataKey="dealName" 
                  width={120}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: CHART_CONFIG.gridColor }}
                />
                <Tooltip 
                  formatter={formatCurrency}
                  contentStyle={CHART_CONFIG.tooltipStyle}
                />
                <Bar 
                  dataKey="position" 
                  fill={COLORS.chart[0]}
                  radius={[0, 4, 4, 0]}
                >
                  {positionsByDeal.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.chart[index % COLORS.chart.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Lender Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Lender Participation Analysis
          </CardTitle>
          <CardDescription>Distribution of lender shares by deal</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={lenderShares[0]?.dealName} className="w-full">
            <TabsList className="w-full h-auto flex-wrap">
              {lenderShares.map((deal) => (
                <TabsTrigger 
                  key={deal.dealName} 
                  value={deal.dealName}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {deal.dealName}
                </TabsTrigger>
              ))}
            </TabsList>
            {lenderShares.map((deal) => (
              <TabsContent key={deal.dealName} value={deal.dealName}>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deal.shares}
                        dataKey="share"
                        nameKey="lenderName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        labelLine={{ stroke: CHART_CONFIG.gridColor }}
                      >
                        {deal.shares.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS.chart[index % COLORS.chart.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => {
                          if (typeof value === 'number') {
                            return `${formatCurrency(value)} (${formatPercentage(value)})`
                          }
                          return value
                        }}
                        contentStyle={CHART_CONFIG.tooltipStyle}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Accrual Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Accrual Projection Analysis
          </CardTitle>
          <CardDescription>Projected accruals with trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accrualProjection}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={CHART_CONFIG.gridColor}
                />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: CHART_CONFIG.gridColor }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: CHART_CONFIG.gridColor }}
                />
                <Tooltip 
                  formatter={formatCurrency}
                  contentStyle={CHART_CONFIG.tooltipStyle}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 