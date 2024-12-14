'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export type CreditAgreementWithRelations = Prisma.CreditAgreementGetPayload<{
  include: {
    bank: true
    borrower: true
    facilities: true
  }
}>

export async function getCreditAgreements() {
  try {
    const creditAgreements = await prisma.creditAgreement.findMany({
      include: {
        bank: true,
        borrower: true,
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
        bank: true,
        borrower: true,
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