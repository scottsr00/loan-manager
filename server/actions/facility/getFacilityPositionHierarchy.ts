'use server'

import { prisma } from '@/lib/prisma'
import { type FacilityPositionHierarchyView, type FacilityPositionView, type FacilityPositionStatus } from '@/server/types/facility-position'
import { type Prisma, type CreditAgreement, type Facility, type FacilityPosition, type Trade, type Loan, type Borrower, type Lender, type Entity } from '@prisma/client'

type CreditAgreementWithRelations = CreditAgreement & {
  borrower: Entity
  lender: Entity & {
    lender: Lender
  }
  facilities: (Facility & {
    positions: (FacilityPosition & {
      lender: Lender & {
        entity: Entity
      }
    })[]
    trades: (Trade & {
      sellerCounterparty: Entity
    })[]
    loans: Loan[]
    servicingActivities: {
      id: string
      activityType: string
      dueDate: Date
      description: string | null
      amount: number
      status: string
      completedAt: Date | null
      completedBy: string | null
    }[]
  })[]
}

interface ServicingActivity {
  id: string;
  type?: string;
  activityType?: string;
  dueDate: Date;
  description: string | null;
  amount: number;
  status: string;
  completedAt: Date | null;
  completedBy: string | null;
}

export async function getFacilityPositionHierarchy(): Promise<FacilityPositionHierarchyView[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      where: {
        status: 'ACTIVE'
      },
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
                sellerCounterparty: true
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
    }) as CreditAgreementWithRelations[]

    // Debug logging
    console.log('Credit Agreements:', JSON.stringify(creditAgreements, null, 2))

    return creditAgreements.map((agreement: CreditAgreementWithRelations) => {
      // Debug logging for each facility's positions
      agreement.facilities.forEach(facility => {
        console.log('Facility Positions:', JSON.stringify(facility.positions, null, 2))
      })

      return ({
        id: agreement.id,
        agreementNumber: agreement.agreementNumber,
        borrower: {
          name: agreement.borrower.legalName,
          type: undefined, // We'll need to fetch this from the Borrower model if needed
          status: 'ACTIVE' // We'll need to fetch this from the Borrower model if needed
        },
        agent: {
          name: agreement.lender.legalName,
          isAgent: true
        },
        amount: agreement.amount,
        currency: agreement.currency,
        status: agreement.status,
        interestRate: Number(agreement.interestRate),
        facilities: agreement.facilities.map(facility => ({
          id: facility.id,
          facilityName: facility.facilityName,
          facilityType: facility.facilityType,
          commitmentAmount: facility.commitmentAmount,
          currency: facility.currency,
          status: facility.status,
          interestType: facility.interestType,
          baseRate: facility.baseRate,
          margin: Number(facility.margin),
          positions: facility.positions.map(position => ({
            id: position.id,
            lenderName: position.lender.entity.legalName,
            lenderId: position.lender.id,
            facilityName: facility.facilityName,
            facilityId: facility.id,
            commitmentAmount: position.commitmentAmount,
            drawnAmount: position.drawnAmount,
            undrawnAmount: position.undrawnAmount,
            share: position.share,
            status: position.status as FacilityPositionStatus,
            hierarchyInfo: {
              agreementNumber: agreement.agreementNumber,
              borrowerName: agreement.borrower.legalName,
              borrowerType: undefined,
              borrowerStatus: 'ACTIVE',
              agentName: agreement.lender.legalName,
              isAgent: true
            }
          })),
          trades: facility.trades.map(trade => ({
            id: trade.id,
            counterparty: trade.sellerCounterparty.id,
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
          servicingActivities: facility.servicingActivities.map((activity: ServicingActivity) => ({
            id: activity.id,
            activityType: activity.activityType || 'UNKNOWN',
            dueDate: activity.dueDate,
            description: activity.description,
            amount: activity.amount,
            status: activity.status,
            completedAt: activity.completedAt,
            completedBy: activity.completedBy
          }))
        }))
      })
    })
  } catch (error) {
    console.error('Error fetching facility position hierarchy:', error)
    throw new Error('Failed to fetch facility position hierarchy')
  }
} 