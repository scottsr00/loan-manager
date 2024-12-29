import { LoanPositionsHierarchy } from '@/components/positions/LoanPositionsHierarchy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PositionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Positions</CardTitle>
        <CardDescription>View and manage your loan positions</CardDescription>
      </CardHeader>
      <CardContent>
        <LoanPositionsHierarchy />
      </CardContent>
    </Card>
  )
} 