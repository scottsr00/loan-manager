'use server'

import { prisma } from '@/server/db/client'
import { type Borrower, type Lender, type CreditAgreement, type Facility, type Loan, type Trade, type FacilityPosition } from '@prisma/client'

interface PositionResponse {
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
  facilities: {
    id: string
    facilityName: string
    facilityType: string
    commitmentAmount: number
    currency: string
    status: string
    interestType: string
    baseRate: string
    margin: number
    positions: {
      lender: string
      commitment: number
      status: string
    }[]
    trades: {
      id: string
      counterparty: string
      amount: number
      price: number
      status: string
      tradeDate: Date
      settlementDate: Date
    }[]
    loans: {
      id: string
      amount: number
      outstandingAmount: number
      currency: string
      status: string
      interestPeriod: string
      drawDate: Date
      baseRate: number
      effectiveRate: number
      positions: {
        lender: string
        amount: number
        status: string
      }[]
    }[]
  }[]
}

interface PrismaQueryResult extends CreditAgreement {
  borrower?: Borrower & {
    entity: {
      legalName: string
    }
  }
  lender?: Lender & {
    entity: {
      legalName: string
    }
  }
  facilities: Array<Facility & {
    positions: Array<FacilityPosition & {
      lender: Lender & {
        entity: {
          legalName: string
        }
      }
    }>
    trades: Array<Trade & {
      counterparty: {
        id: string
        name: string
        status: string
      }
    }>
    loans: Array<{
      id: string
      amount: number
      outstandingAmount: number
      currency: string
      status: string
      interestPeriod: string
      drawDate: Date
      baseRate: number
      effectiveRate: number
    }>
  }>
}

export async function getPositions(): Promise<PositionResponse[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            positions: {
              include: {
                lender: true
              }
            },
            loans: true,
            trades: {
              include: {
                counterparty: {
                  select: {
                    id: true,
                    name: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        agreementNumber: 'asc'
      }
    }) as unknown as Array<CreditAgreement & {
      borrower?: Borrower & {
        entity: {
          legalName: string
        }
      }
      lender?: Lender & {
        entity: {
          legalName: string
        }
      }
      facilities: Array<Facility & {
        positions: Array<FacilityPosition & {
          lender: Lender & {
            entity: {
              legalName: string
            }
          }
        }>
        trades: Array<Trade & {
          counterparty: {
            id: string
            name: string
            status: string
          }
        }>
        loans: Array<{
          id: string
          amount: number
          outstandingAmount: number
          currency: string
          status: string
          interestPeriod: string
          drawDate: Date
          baseRate: number
          effectiveRate: number
        }>
      }>
    }>

    if (!creditAgreements) {
      throw new Error('No credit agreements found')
    }

    console.log('Credit Agreements found:', creditAgreements.length)
    creditAgreements.forEach(agreement => {
      console.log(`Agreement ${agreement.agreementNumber}:`)
      if (agreement.facilities) {
        agreement.facilities.forEach(facility => {
          console.log(`  Facility ${facility.facilityName}:`)
          console.log(`    Loans: ${facility.loans.length}`)
          if (facility.loans.length > 0) {
            facility.loans.forEach(loan => {
              console.log(`      Loan ${loan.id}:`)
              console.log(`        Amount: ${loan.amount}`)
              console.log(`        Outstanding: ${loan.outstandingAmount}`)
              console.log(`        Interest Period: ${loan.interestPeriod}`)
              console.log(`        Draw Date: ${loan.drawDate}`)
              console.log(`        Base Rate: ${loan.baseRate}`)
              console.log(`        Effective Rate: ${loan.effectiveRate}`)
            })
          }
        })
      }
    })

    return creditAgreements.map(agreement => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      borrower: {
        name: agreement.borrower?.entity?.legalName || 'Unknown',
        type: 'BORROWER',
        status: agreement.borrower?.onboardingStatus || 'UNKNOWN'
      },
      agent: {
        name: agreement.lender?.entity?.legalName || 'Unknown',
        type: 'LENDER'
      },
      amount: agreement.amount,
      currency: agreement.currency,
      status: agreement.status,
      startDate: agreement.startDate,
      maturityDate: agreement.maturityDate,
      facilities: (agreement.facilities || []).map(facility => {
        const totalFacilityCommitment = facility.positions.reduce((sum, pos) => sum + pos.amount, 0)
        
        return {
          id: facility.id,
          facilityName: facility.facilityName,
          facilityType: facility.facilityType,
          commitmentAmount: facility.commitmentAmount,
          currency: facility.currency,
          status: 'ACTIVE',
          interestType: facility.interestType,
          baseRate: facility.baseRate,
          margin: facility.margin,
          positions: facility.positions.map(pos => ({
            lender: pos.lender?.entity?.legalName || 'Unknown',
            commitment: pos.amount,
            status: pos.status
          })),
          trades: (facility.trades || []).map(trade => ({
            id: trade.id,
            counterparty: trade.counterparty?.name || 'Unknown',
            amount: trade.amount,
            price: trade.price,
            status: trade.status,
            tradeDate: trade.tradeDate,
            settlementDate: trade.settlementDate
          })),
          loans: (facility.loans || []).map(loan => {
            const loanPositions = facility.positions.map(pos => ({
              lender: pos.lender?.entity?.legalName || 'Unknown',
              amount: totalFacilityCommitment > 0 
                ? (loan.outstandingAmount * (pos.amount / totalFacilityCommitment))
                : 0,
              status: pos.status
            }))

            return {
              id: loan.id,
              amount: loan.amount,
              outstandingAmount: loan.outstandingAmount,
              currency: loan.currency,
              status: loan.status,
              interestPeriod: loan.interestPeriod,
              drawDate: loan.drawDate,
              baseRate: loan.baseRate,
              effectiveRate: loan.effectiveRate,
              positions: loanPositions
            }
          })
        }
      })
    }))
  } catch (error) {
    console.error('Error in getPositions:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get positions: ${error.message}`)
    }
    throw new Error('Failed to get positions')
  }
} 