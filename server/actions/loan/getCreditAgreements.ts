'use server'

import { db } from '@/server/db'

export async function getCreditAgreements() {
  try {
    const creditAgreements = await db.creditAgreement.findMany({
      include: {
        borrower: {
          include: {
            entity: true
          }
        },
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return creditAgreements
  } catch (error) {
    console.error('Error fetching credit agreements:', error)
    throw error
  }
}

export async function getAvailableLoans() {
  try {
    const availableLoans = await db.creditAgreement.findMany({
      where: {
        status: 'ACTIVE',
        facilities: {
          some: {
            trades: {
              none: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return availableLoans
  } catch (error) {
    console.error('Error fetching available loans:', error)
    throw error
  }
} 