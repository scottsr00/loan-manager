export interface Position {
  id: string
  agreementNumber: string
  borrower: {
    name: string
    type: string
    status: string
  }
  agent: {
    name: string
    type: string
  }
  amount: number
  currency: string
  status: string
  startDate: Date
  maturityDate: Date
  interestRate: string
  facilities: Array<{
    id: string
    facilityName: string
    facilityType: string
    commitmentAmount: number
    availableAmount: number
    currency: string
    status: string
    interestType: string
    baseRate: string
    margin: number
    positions: Array<{
      lender: string
      commitment: number
      status: string
    }>
    trades: Array<{
      id: string
      counterparty: string
      amount: number
      price: number
      status: string
      tradeDate: Date
      settlementDate: Date
    }>
    loans: Array<{
      id: string
      amount: number
      outstandingAmount: number
      currency: string
      status: string
      interestPeriod: string
      drawDate: Date
      baseRate: string
      effectiveRate: string
    }>
    servicingActivities: Array<{
      id: string
      activityType: string
      dueDate: Date
      description: string | null
      amount: number
      status: string
      completedAt: Date | null
      completedBy: string | null
    }>
  }>
} 