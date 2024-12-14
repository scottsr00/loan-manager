'use server'

import { prisma } from '@/lib/prisma'

export type CounterpartyWithRelations = {
  id: string
  legalName: string
  parentName: string | null
  ultParentName: string | null
  kycStatus: string
  onboardingStatus: string
  registrationNumber: string | null
  taxId: string | null
  incorporationDate: Date | null
  website: string | null
  description: string | null
  counterpartyTypeId: string
  counterpartyType: {
    name: string
  }
  addresses: {
    type: string
    street1: string
    city: string
    state: string | null
    country: string
    isPrimary: boolean
  }[]
  contacts: {
    firstName: string
    lastName: string
    title: string | null
    email: string | null
    isPrimary: boolean
  }[]
  createdAt: Date
  updatedAt: Date
}

export async function getCounterparties(): Promise<CounterpartyWithRelations[]> {
  try {
    const counterparties = await prisma.counterparty.findMany({
      include: {
        counterpartyType: {
          select: {
            name: true,
          },
        },
        addresses: {
          where: {
            isPrimary: true,
          },
          select: {
            type: true,
            street1: true,
            city: true,
            state: true,
            country: true,
            isPrimary: true,
          },
        },
        contacts: {
          where: {
            isPrimary: true,
          },
          select: {
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            isPrimary: true,
          },
        },
      },
      orderBy: {
        legalName: 'asc',
      },
    })

    return counterparties as CounterpartyWithRelations[]
  } catch (error) {
    console.error('Error in getCounterparties:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch counterparties: ${error.message}`)
    }
    throw new Error('Failed to fetch counterparties: Unknown error')
  }
} 