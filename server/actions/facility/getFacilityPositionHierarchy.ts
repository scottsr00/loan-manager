'use server'

import { prisma } from '@/lib/prisma'
import { type FacilityPositionHierarchyView, type FacilityPositionView, type FacilityPositionStatus } from '@/server/types/facility-position'
import { type Prisma, type CreditAgreement, type Facility, type FacilityPosition, type Trade, type Loan, type Borrower, type Lender } from '@prisma/client'

type CreditAgreementWithRelations = CreditAgreement & {
  borrower: Borrower
  lender: Lender
  facilities: (Facility & {
    positions: (FacilityPosition & {
      lender: Lender
    })[]
    trades: (Trade & {
      sellerCounterparty: Lender
    })[]
    loans: Loan[]
  })[]
}

export async function getFacilityPositionHierarchy(): Promise<FacilityPositionHierarchyView[]> {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      where: {
        status: 'ACTIVE'
      },
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
            trades: {
              include: {
                sellerCounterparty: true
              }
            },
            loans: true
          }
        }
      }
    }) as CreditAgreementWithRelations[]

    return creditAgreements.map((agreement: CreditAgreementWithRelations) => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      borrower: {
        name: agreement.borrower.entityId,
        type: agreement.borrower.businessType || undefined,
        status: agreement.borrower.onboardingStatus
      },
      agent: {
        name: agreement.lender.entityId,
        isAgent: true // Since this is the agent record
      },
      amount: agreement.amount,
      currency: agreement.currency,
      status: agreement.status,
      facilities: agreement.facilities.map(facility => ({
        id: facility.id,
        facilityName: facility.facilityName,
        facilityType: facility.description || 'Term Loan',
        commitmentAmount: facility.commitmentAmount,
        currency: facility.currency,
        positions: facility.positions.map(position => ({
          id: position.id,
          lenderName: position.lender.entityId,
          lenderId: position.lenderId,
          facilityName: facility.facilityName,
          facilityId: facility.id,
          commitmentAmount: position.commitmentAmount,
          drawnAmount: position.drawnAmount,
          undrawnAmount: position.undrawnAmount,
          share: position.share,
          status: position.status as FacilityPositionStatus,
          hierarchyInfo: {
            agreementNumber: agreement.agreementNumber,
            borrowerName: agreement.borrower.entityId,
            borrowerType: agreement.borrower.businessType || undefined,
            borrowerStatus: agreement.borrower.onboardingStatus,
            agentName: agreement.lender.entityId,
            isAgent: true
          }
        })),
        trades: facility.trades.map(trade => ({
          id: trade.id,
          counterparty: trade.sellerCounterparty.entityId,
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
        }))
      }))
    }))
  } catch (error) {
    console.error('Error fetching facility position hierarchy:', error)
    throw new Error('Failed to fetch facility position hierarchy')
  }
} 