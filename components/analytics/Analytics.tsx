'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart,
  BarChart,
  DonutChart,
  Title,
  Subtitle,
  Text,
  Grid,
  Col,
  Flex,
  Metric,
  ProgressBar,
} from '@tremor/react'

type FacilityType = {
  commitment: number
  available: number
}

type LoanStatus = {
  total: number
  outstanding: number
}

type BorrowerRisk = {
  borrowerName: string
  creditRating: string
  totalExposure: number
  utilization: number
}

interface AnalyticsData {
  portfolio: {
    totalCommitment: number
    facilitiesByType: { [key: string]: FacilityType }
    totalFacilities: number
  }
  loans: {
    byStatus: { [key: string]: LoanStatus }
  }
  risk: {
    borrowerConcentration: BorrowerRisk[]
  }
  payments: {
    byType: { [key: string]: { [key: string]: number } }
  }
}

interface AnalyticsProps {
  data: AnalyticsData
}

export function Analytics({ data }: AnalyticsProps) {
  if (!data || !data.portfolio || !data.loans || !data.risk || !data.payments) {
    return (
      <div className="p-4">
        <Text>Loading analytics data...</Text>
      </div>
    )
  }

  // Format data for charts
  const facilityTypeData = Object.entries(data.portfolio.facilitiesByType || {}).map(([type, amounts]) => ({
    name: type,
    'Total Commitment': amounts.commitment,
    'Available Amount': amounts.available,
    'Utilization': ((amounts.commitment - amounts.available) / amounts.commitment * 100).toFixed(1) + '%'
  }))

  const loanStatusData = Object.entries(data.loans.byStatus || {}).map(([status, amounts]) => ({
    name: status,
    'Total Amount': amounts.total,
    'Outstanding': amounts.outstanding,
  }))

  const borrowerRiskData = (data.risk.borrowerConcentration || []).map(borrower => ({
    name: borrower.borrowerName,
    'Total Exposure': borrower.totalExposure,
    'Utilization': borrower.utilization,
    'Credit Rating': borrower.creditRating,
  }))

  const paymentData = Object.entries(data.payments.byType || {}).flatMap(([type, statusAmounts]) =>
    Object.entries(statusAmounts || {}).map(([status, amount]) => ({
      type,
      status,
      amount,
    }))
  )

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card>
          <CardContent className="pt-6">
            <Text>Total Commitment</Text>
            <Metric>{formatCurrency(data.portfolio.totalCommitment || 0)}</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Text>Active Facilities</Text>
            <Metric>{data.portfolio.totalFacilities || 0}</Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Text>Total Outstanding</Text>
            <Metric>
              {formatCurrency(
                Object.values(data.loans.byStatus || {}).reduce(
                  (sum, status) => sum + (status.outstanding || 0),
                  0
                )
              )}
            </Metric>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Text>Portfolio Utilization</Text>
            <Metric>
              {(
                (Object.values(data.loans.byStatus || {}).reduce(
                  (sum, status) => sum + (status.outstanding || 0),
                  0
                ) / (data.portfolio.totalCommitment || 1)) * 100
              ).toFixed(1)}%
            </Metric>
          </CardContent>
        </Card>
      </Grid>

      {/* Facility Analysis */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Facilities by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {facilityTypeData.length > 0 ? (
              <DonutChart
                data={facilityTypeData}
                category="Total Commitment"
                index="name"
                valueFormatter={formatCurrency}
                colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
              />
            ) : (
              <Text>No facility data available</Text>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Facility Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facilityTypeData.map((facility) => (
                <div key={facility.name} className="space-y-2">
                  <Flex>
                    <Text>{facility.name}</Text>
                    <Text>{facility.Utilization}</Text>
                  </Flex>
                  <ProgressBar value={parseFloat(facility.Utilization)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Borrower Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {borrowerRiskData.map((borrower) => (
              <div key={borrower.name} className="space-y-2">
                <Flex>
                  <div>
                    <Title>{borrower.name}</Title>
                    <Text>Rating: {borrower['Credit Rating']}</Text>
                  </div>
                  <div className="text-right">
                    <Text>Exposure</Text>
                    <Text>{formatCurrency(borrower['Total Exposure'])}</Text>
                  </div>
                </Flex>
                <ProgressBar
                  value={(borrower.Utilization / (borrower['Total Exposure'] || 1)) * 100}
                  label="Utilization"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Activity (Last 90 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentData.length > 0 ? (
            <BarChart
              data={paymentData}
              categories={['amount']}
              index="type"
              valueFormatter={formatCurrency}
              colors={['emerald']}
              stack
            />
          ) : (
            <Text>No payment data available</Text>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 