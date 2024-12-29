import { ServicingDashboard } from '@/components/servicing/ServicingDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServicingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Servicing</CardTitle>
        <CardDescription>Manage loan servicing activities and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <ServicingDashboard />
      </CardContent>
    </Card>
  )
} 