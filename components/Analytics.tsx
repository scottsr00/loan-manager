'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart,
  BarChart,
  DonutChart,
  Title,
  Subtitle,
} from '@tremor/react'

interface AnalyticsProps {
  data: {
    commitmentByMonth: { date: string; volume: number }[]
    facilitiesByType: { type: string; amount: number }[]
    commitmentsByBorrower: { borrowerName: string; commitment: number }[]
    creditMetrics: {
      borrowerName: string
      creditRating: string
      totalAssets: number
      totalLiabilities: number
      netWorth: number
      totalCommitment: number
    }[]
    interestProjection: { date: string; amount: number }[]
  }
}

export function Analytics({ data }: AnalyticsProps) {
  // Format data for charts
  const commitmentData = data.commitmentByMonth.map(item => ({
    date: item.date,
    'Total Commitment': item.volume,
  }))

  const facilityTypeData = data.facilitiesByType.map(item => ({
    name: item.type,
    amount: item.amount,
  }))

  const borrowerData = data.commitmentsByBorrower.map(item => ({
    name: item.borrowerName,
    commitment: item.commitment,
  }))

  const creditMetricsData = data.creditMetrics.map(item => ({
    name: item.borrowerName,
    'Credit Rating': item.creditRating,
    'Total Assets': item.totalAssets,
    'Net Worth': item.netWorth,
    'Total Commitment': item.totalCommitment,
  }))

  const interestData = data.interestProjection.map(item => ({
    date: item.date,
    'Projected Interest': item.amount,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Total Commitments Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={commitmentData}
            index="date"
            categories={['Total Commitment']}
            colors={['blue']}
            valueFormatter={formatCurrency}
            height="h-72"
          />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Facilities by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={facilityTypeData}
            category="amount"
            index="name"
            valueFormatter={formatCurrency}
            colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
          />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Commitments by Borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={borrowerData}
            index="name"
            categories={['commitment']}
            colors={['blue']}
            valueFormatter={formatCurrency}
          />
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Credit Metrics by Borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {creditMetricsData.map((borrower) => (
              <div key={borrower.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Title>{borrower.name}</Title>
                  <Subtitle className="text-tremor-content">
                    Rating: {borrower['Credit Rating']}
                  </Subtitle>
                </div>
                <BarChart
                  data={[borrower]}
                  index="name"
                  categories={['Total Assets', 'Net Worth', 'Total Commitment']}
                  colors={['emerald', 'violet', 'blue']}
                  valueFormatter={formatCurrency}
                  stack={false}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Projected Interest Income</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={interestData}
            index="date"
            categories={['Projected Interest']}
            colors={['green']}
            valueFormatter={formatCurrency}
            height="h-72"
          />
        </CardContent>
      </Card>
    </div>
  )
} 