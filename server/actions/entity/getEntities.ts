'use server'

import { prisma } from '@/lib/prisma'
import { type EntityWithRelations } from '@/server/types/entity'

export async function getEntities(): Promise<EntityWithRelations[]> {
  const entities = await prisma.entity.findMany({
    include: {
      addresses: {
        select: {
          id: true,
          type: true,
          street1: true,
          street2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isPrimary: true
        }
      },
      contacts: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          email: true,
          phone: true,
          isPrimary: true
        }
      },
      kyc: {
        select: {
          verificationStatus: true,
          counterpartyVerified: true,
          lastVerificationDate: true
        }
      },
      lender: true,
      borrower: true,
      counterparty: true
    },
    orderBy: {
      legalName: 'asc'
    }
  })

  return entities.map((entity: {
    id: string
    legalName: string
    dba: string | null
    status: string
    jurisdiction: string | null
    createdAt: Date
    updatedAt: Date
    addresses: Array<{
      id: string
      type: string
      street1: string
      street2: string | null
      city: string
      state: string | null
      postalCode: string | null
      country: string
      isPrimary: boolean
    }>
    contacts: Array<{
      id: string
      firstName: string
      lastName: string
      title: string | null
      email: string | null
      phone: string | null
      isPrimary: boolean
    }>
    kyc: {
      verificationStatus: string
      counterpartyVerified: boolean
      lastVerificationDate: Date | null
    } | null
    lender: any | null
    borrower: any | null
    counterparty: any | null
  }) => ({
    id: entity.id,
    legalName: entity.legalName,
    dba: entity.dba,
    status: entity.status,
    jurisdiction: entity.jurisdiction,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    addresses: entity.addresses,
    contacts: entity.contacts,
    kyc: entity.kyc,
    isLender: !!entity.lender,
    isBorrower: !!entity.borrower,
    isCounterparty: !!entity.counterparty,
    isAgent: false
  }))
} 