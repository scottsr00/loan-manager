'use server'

import { prisma } from '@/server/db/client'

export async function getAvailableLoans() {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        facility: {
          include: {
            creditAgreement: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return loans.map(loan => ({
      id: loan.id,
      name: `${loan.facility.creditAgreement.agreementName} - ${loan.amount}`
    }))
  } catch (error) {
    console.error('Error in getAvailableLoans:', error)
    throw new Error('Failed to fetch available loans')
  }
} 