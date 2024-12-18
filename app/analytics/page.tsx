import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Analytics } from '@/components/Analytics'
import { getAnalytics } from '@/server/actions/analytics'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>Overview of loan portfolio and trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Analytics data={analytics as any} />
      </CardContent>
    </Card>
  )
} 