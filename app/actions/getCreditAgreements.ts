'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type CreditAgreementWithRelations = Prisma.CreditAgreementGetPayload<{
  include: {
    agent: true
    borrower: {
      include: {
        entity: true
        requiredDocuments: true
        financialStatements: true
        covenants: true
      }
    }
    facilities: true
  }
}>

export async function getCreditAgreements() {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        agent: true,
        borrower: {
          include: {
            entity: true,
            requiredDocuments: true,
            financialStatements: true,
            covenants: true
          }
        },
        facilities: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { creditAgreements }
  } catch (error) {
    console.error('Error fetching credit agreements:', error)
    return { error: 'Failed to fetch credit agreements' }
  }
}

export async function getCreditAgreement(id: string) {
  try {
    const creditAgreement = await prisma.creditAgreement.findUnique({
      where: { id },
      include: {
        agent: true,
        borrower: {
          include: {
            entity: true,
            requiredDocuments: true,
            financialStatements: true,
            covenants: true
          }
        },
        facilities: true
      }
    })

    if (!creditAgreement) {
      return { error: 'Credit agreement not found' }
    }

    return { creditAgreement }
  } catch (error) {
    console.error('Error fetching credit agreement:', error)
    return { error: 'Failed to fetch credit agreement' }
  }
} 