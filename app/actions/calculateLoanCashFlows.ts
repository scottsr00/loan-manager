'use client'


interface LoanTerms {
  principalAmount: number
  interestRate: number
  loanTerm: number
  paymentFrequency: number
  syndicatedShares: { [lender: string]: number }
  prepayments: { period: number; amount: number }[]
}

interface CashFlow {
  period: number
  balance: number
  payment: number
  principal: number
  interest: number
  prepayment: number
  syndicatedPayments: { [lender: string]: number }
}

export async function calculateLoanCashFlows(loanTerms: LoanTerms): Promise<CashFlow[]> {
  const {
    principalAmount,
    interestRate,
    loanTerm,
    paymentFrequency,
    syndicatedShares,
    prepayments
  } = loanTerms

  const totalPayments = loanTerm * paymentFrequency
  const periodicInterestRate = interestRate / 100 / paymentFrequency
  const scheduledPayment = (principalAmount * periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments)) /
                 (Math.pow(1 + periodicInterestRate, totalPayments) - 1)

  let balance = principalAmount
  const cashFlows: CashFlow[] = []

  for (let period = 1; period <= totalPayments; period++) {
    const interest = balance * periodicInterestRate
    let principal = scheduledPayment - interest
    let payment = scheduledPayment
    let prepayment = 0

    // Check for prepayment in this period
    const prepaymentForPeriod = prepayments.find(p => p.period === period)
    if (prepaymentForPeriod) {
      prepayment = Math.min(prepaymentForPeriod.amount, balance)
      principal += prepayment
      payment += prepayment
    }

    balance -= principal

    const syndicatedPayments: { [lender: string]: number } = {}
    for (const [lender, share] of Object.entries(syndicatedShares)) {
      syndicatedPayments[lender] = (payment * share) / 100
    }

    cashFlows.push({
      period,
      balance,
      payment,
      principal,
      interest,
      prepayment,
      syndicatedPayments
    })

    // If the loan is fully paid off, stop calculating
    if (balance <= 0) {
      break
    }
  }

  return cashFlows
}