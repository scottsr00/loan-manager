import { LoanCalculatorComponent } from '@/components/loans/LoanCalculator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalculatorPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Calculator</CardTitle>
        <CardDescription>Calculate loan terms and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <LoanCalculatorComponent />
      </CardContent>
    </Card>
  )
} 