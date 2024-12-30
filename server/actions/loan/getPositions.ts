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
                lender: {
                  include: {
                    entity: true
                  }
                }
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
    })

    if (!creditAgreements) {
      throw new Error('No credit agreements found')
    }

    return creditAgreements.map((agreement: any) => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      borrower: {
        name: agreement.borrower?.name || 'Unknown',
        type: 'BORROWER',
        status: agreement.borrower?.onboardingStatus || 'UNKNOWN'
      },
      agent: {
        name: agreement.lender?.legalName || 'Unknown',
        type: 'LENDER'
      },
      amount: agreement.amount,
      currency: agreement.currency,
      status: agreement.status,
      startDate: agreement.startDate,
      maturityDate: agreement.maturityDate,
      facilities: (agreement.facilities || []).map((facility: any) => ({
        id: facility.id,
        facilityName: facility.facilityName,
        facilityType: facility.facilityType,
        commitmentAmount: facility.commitmentAmount,
        currency: facility.currency,
        status: 'ACTIVE',
        interestType: facility.interestType,
        baseRate: facility.baseRate,
        margin: facility.margin,
        positions: facility.positions.map((pos: any) => ({
          lender: pos.lender?.entity?.legalName || 'Unknown',
          commitment: pos.amount,
          status: pos.status
        })),
        trades: (facility.trades || []).map((trade: any) => ({
          id: trade.id,
          counterparty: trade.counterparty?.name || 'Unknown',
          amount: trade.amount,
          price: trade.price,
          status: trade.status,
          tradeDate: trade.tradeDate,
          settlementDate: trade.settlementDate
        })),
        loans: (facility.loans || []).map((loan: any) => ({
          id: loan.id,
          amount: loan.amount,
          outstandingAmount: loan.outstandingAmount,
          currency: loan.currency,
          status: loan.status,
          interestPeriod: loan.interestPeriod,
          drawDate: loan.drawDate,
          baseRate: loan.baseRate,
          effectiveRate: loan.effectiveRate,
          positions: facility.positions.map((pos: any) => ({
            lender: pos.lender?.entity?.legalName || 'Unknown',
            amount: (loan.amount * pos.share),
            status: pos.status
          }))
        }))
      }))
    }))
  } catch (error) {
    console.error('Error in getPositions:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to get positions: ${error.message}`)
    }
    throw new Error('Failed to get positions')
  }
} 