'use server'

import { type Position } from '../../../server/types/position'
import { prisma } from '@/lib/prisma'
import { type Prisma, type CreditAgreement, type Facility, type FacilityPosition, type Trade, type Loan, type ServicingActivity } from '@prisma/client'

type ServicingActivityWithRelations = {
  id: string
  activityType: string
  dueDate: Date
  description: string | null
  amount: number
  status: string
  completedAt: Date | null
  completedBy: string | null
}

type CreditAgreementWithRelations = {
  id: string
  agreementNumber: string
  borrowerId: string
  lenderId: string
  status: string
  amount: number
  currency: string
  startDate: Date
  maturityDate: Date
  interestRate: number
  description: string | null
  createdAt: Date
  updatedAt: Date
  borrower: {
    name: string
    businessType: string | null
    onboardingStatus: string
  }
  lender: {
    legalName: string
    lender: {
      status: string
    } | null
  }
  facilities: FacilityWithRelations[]
}

type FacilityPositionWithRelations = {
  id: string
  facilityId: string
  lenderId: string
  amount: number
  share: number
  status: string
  createdAt: Date
  updatedAt: Date
  lender: {
    entity: {
      legalName: string
    }
  }
}

type LoanWithRelations = {
  id: string
  facilityId: string
  amount: number
  outstandingAmount: number
  currency: string
  status: string
  interestPeriod: string
  drawDate: Date
  baseRate: Prisma.Decimal
  effectiveRate: Prisma.Decimal
  createdAt: Date
  updatedAt: Date
}

type TradeWithRelations = {
  id: string
  facilityId: string
  sellerCounterpartyId: string
  buyerCounterpartyId: string
  tradeDate: Date
  settlementDate: Date
  parAmount: number
  price: number
  settlementAmount: number
  status: string
  createdAt: Date
  updatedAt: Date
  sellerCounterparty: {
    entity: {
      legalName: string
    }
  }
  buyerCounterparty: {
    entity: {
      legalName: string
    }
  }
}

type FacilityWithRelations = {
  id: string
  facilityName: string
  facilityType: string
  creditAgreementId: string
  commitmentAmount: number
  availableAmount: number
  currency: string
  startDate: Date
  maturityDate: Date
  interestType: string
  baseRate: string
  margin: number
  status: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  positions: FacilityPositionWithRelations[]
  trades: TradeWithRelations[]
  loans: LoanWithRelations[]
  servicingActivities: ServicingActivityWithRelations[]
}

export async function getPositions(): Promise<Position[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
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
            trades: {
              include: {
                sellerCounterparty: {
                  include: {
                    entity: true
                  }
                },
                buyerCounterparty: {
                  include: {
                    entity: true
                  }
                }
              }
            },
            loans: true,
            servicingActivities: {
              select: {
                id: true,
                activityType: true,
                dueDate: true,
                description: true,
                amount: true,
                status: true,
                completedAt: true,
                completedBy: true
              }
            }
          }
        }
      }
    })

    const positions = creditAgreements.map((agreement: CreditAgreementWithRelations) => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      borrower: {
        name: agreement.borrower.name,
        type: agreement.borrower.businessType || 'Unknown',
        status: agreement.borrower.onboardingStatus
      },
      agent: {
        name: agreement.lender.legalName,
        type: agreement.lender.lender?.status || 'Unknown'
      },
      amount: agreement.amount,
      currency: agreement.currency,
      status: agreement.status,
      startDate: agreement.startDate,
      maturityDate: agreement.maturityDate,
      interestRate: agreement.interestRate.toString(),
      facilities: agreement.facilities.map(facility => ({
        id: facility.id,
        facilityName: facility.facilityName,
        facilityType: facility.facilityType,
        commitmentAmount: facility.commitmentAmount,
        availableAmount: facility.availableAmount,
        currency: facility.currency,
        status: facility.status,
        interestType: facility.interestType,
        baseRate: facility.baseRate,
        margin: facility.margin,
        positions: facility.positions.map(position => ({
          lender: position.lender.entity.legalName,
          commitment: position.amount,
          status: position.status
        })),
        trades: facility.trades.map(trade => ({
          id: trade.id,
          counterparty: trade.sellerCounterparty.entity.legalName,
          amount: trade.parAmount,
          price: trade.price,
          status: trade.status,
          tradeDate: trade.tradeDate,
          settlementDate: trade.settlementDate
        })),
        loans: facility.loans.map(loan => ({
          id: loan.id,
          amount: loan.amount,
          outstandingAmount: loan.outstandingAmount,
          currency: loan.currency,
          status: loan.status,
          interestPeriod: loan.interestPeriod,
          drawDate: loan.drawDate,
          baseRate: loan.baseRate.toString(),
          effectiveRate: loan.effectiveRate.toString()
        })),
        servicingActivities: facility.servicingActivities.map(activity => ({
          id: activity.id,
          activityType: activity.activityType,
          dueDate: activity.dueDate,
          description: activity.description,
          amount: activity.amount,
          status: activity.status,
          completedAt: activity.completedAt,
          completedBy: activity.completedBy
        }))
      }))
    }))

    return positions
  } catch (error) {
    console.error('Error fetching positions:', error)
    throw error
  }
} 