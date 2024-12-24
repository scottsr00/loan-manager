'use server'

import { prisma } from '@/server/db/client'

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
      currency: string
      status: string
      positions: {
        lender: string
        amount: number
        status: string
      }[]
    }[]
  }[]
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
            loans: {
              include: {
                positions: {
                  include: {
                    lender: true
                  }
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
        agreementNumber: 'asc'
      }
    })

    if (!creditAgreements) {
      throw new Error('No credit agreements found')
    }

    return creditAgreements.map(agreement => ({
      id: agreement.id,
      agreementNumber: agreement.agreementNumber,
      borrower: {
        name: agreement.borrower?.legalName || 'Unknown',
        type: 'BORROWER',
        status: agreement.borrower?.status || 'UNKNOWN'
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
      facilities: agreement.facilities.map(facility => ({
        id: facility.id,
        facilityName: facility.facilityName,
        facilityType: facility.facilityType,
        commitmentAmount: facility.commitmentAmount,
        currency: facility.currency,
        status: facility.status,
        interestType: facility.interestType,
        baseRate: facility.baseRate,
        margin: facility.margin,
        positions: facility.positions.map(pos => ({
          lender: pos.lender?.legalName || 'Unknown',
          commitment: pos.amount,
          status: pos.status
        })),
        trades: facility.trades.map(trade => ({
          id: trade.id,
          counterparty: trade.counterparty?.legalName || 'Unknown',
          amount: trade.amount,
          price: trade.price,
          status: trade.status,
          tradeDate: trade.tradeDate,
          settlementDate: trade.settlementDate
        })),
        loans: facility.loans.map(loan => ({
          id: loan.id,
          amount: loan.amount,
          currency: loan.currency,
          status: loan.status,
          positions: loan.positions.map(pos => ({
            lender: pos.lender?.legalName || 'Unknown',
            amount: pos.amount,
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