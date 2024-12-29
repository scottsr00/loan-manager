import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Analytics } from '@/components/analytics/Analytics'
import { getAnalytics } from '@/server/actions/analytics/getAnalytics'

export default async function AnalyticsPage() {
  const data = await getAnalytics()

  return (
    <div className="container space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive overview of portfolio performance, risk metrics, and payment activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Analytics data={data} />
        </CardContent>
      </Card>
    </div>
  )
} 