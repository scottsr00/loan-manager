'use server'

import { prisma } from '@/server/db/client'

export async function getPositions() {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            facilityPositions: {
              include: {
                lender: true
              }
            },
            loans: {
              include: {
                loanPositions: {
                  include: {
                    lender: true
                  }
                },
                repaymentSchedule: {
                  orderBy: {
                    dueDate: 'asc'
                  },
                  take: 1
                }
              }
            },
            trades: {
              include: {
                counterparty: true
              }
            }
          }
        }
      },
      orderBy: {
        agreementName: 'asc'
      }
    })

    if (!creditAgreements) {
      throw new Error('No credit agreements found')
    }

    return creditAgreements.map(agreement => ({
      id: agreement.id,
      agreementName: agreement.agreementName || 'Unnamed Agreement',
      agreementNumber: agreement.agreementNumber || 'No Number',
      borrower: {
        name: agreement.borrower.name,
        type: agreement.borrower.type,
        status: agreement.borrower.status
      },
      agent: {
        name: agreement.lender.name,
        type: agreement.lender.type
      },
      amount: agreement.amount,
      currency: agreement.currency,
      status: agreement.status,
      startDate: agreement.startDate,
      maturityDate: agreement.maturityDate,
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
        positions: facility.facilityPositions.map(pos => ({
          lender: pos.lender.name,
          commitment: pos.commitment,
          share: pos.share,
          status: pos.status
        })),
        trades: facility.trades.map(trade => ({
          id: trade.id,
          counterparty: trade.counterparty.name,
          amount: trade.amount,
          price: trade.price,
          status: trade.status,
          tradeDate: trade.tradeDate,
          settlementDate: trade.settlementDate
        })),
        loans: facility.loans.map(loan => ({
          id: loan.id,
          drawdownNumber: loan.drawdownNumber,
          amount: loan.amount,
          outstandingAmount: loan.outstandingAmount,
          currency: loan.currency,
          status: loan.status,
          drawdownDate: loan.drawdownDate,
          maturityDate: loan.maturityDate,
          interestRate: loan.interestRate,
          interestAccrued: loan.interestAccrued,
          nextPayment: loan.repaymentSchedule[0] ? {
            dueDate: loan.repaymentSchedule[0].dueDate,
            principalAmount: loan.repaymentSchedule[0].principalAmount,
            interestAmount: loan.repaymentSchedule[0].interestAmount,
            status: loan.repaymentSchedule[0].status
          } : null,
          positions: loan.loanPositions.map(pos => ({
            lender: pos.lender.name,
            amount: pos.amount,
            share: pos.share,
            status: pos.status
          }))
        }))
      }))
    }))
  } catch (error) {
    console.error('Error in getPositions:', error)
    throw new Error('Failed to fetch positions')
  }
} 