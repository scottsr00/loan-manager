'use server'

import { prisma } from '@/server/db/client'
import { type CreditAgreementWithRelations } from '@/server/types/credit-agreement'

export async function getCreditAgreement(id: string): Promise<CreditAgreementWithRelations | null> {
  console.log('Server: Fetching credit agreement with ID:', id)
  try {
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id },
      include: {
        borrower: true,
        lender: {
          include: {
            lender: true
          }
        },
        facilities: {
          include: {
            trades: {
              include: {
                counterparty: true
              }
            }
          }
        },
        transactions: true
      }
    })

    console.log('Server: Found credit agreement:', creditAgreement ? 'yes' : 'no')

    if (!creditAgreement) {
      return null
    }

    return creditAgreement as unknown as CreditAgreementWithRelations
  } catch (error) {
    console.error('Server: Error fetching credit agreement:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch credit agreement: ${error.message}`)
    }
    throw new Error('Failed to fetch credit agreement: Unknown error')
  }
} 