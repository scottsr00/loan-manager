'use server'

import { prisma } from '@/lib/prisma'
import { type Counterparty } from '@prisma/client'

interface CounterpartyWithEntity extends Counterparty {
  entityId: string
  entity: {
    id: string
    legalName: string
    contacts: Array<{
      id: string
      firstName: string
      lastName: string
      isPrimary: boolean
      type: string
      title: string | null
      email: string | null
      phone: string | null
    }>
    addresses: Array<{
      id: string
      type: string
      street1: string
      street2: string | null
      city: string
      state: string | null
      postalCode: string
      country: string
      isPrimary: boolean
    }>
    kyc?: {
      verificationStatus: string
      counterpartyVerified: boolean
      lastVerificationDate: Date | null
    } | null
  } | null
  type: {
    id: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

export async function getCounterparties() {
  const counterparties = await prisma.counterparty.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      entity: {
        select: {
          id: true,
          legalName: true,
          contacts: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isPrimary: true,
              type: true,
              title: true,
              email: true,
              phone: true
            }
          },
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
          kyc: {
            select: {
              verificationStatus: true,
              counterpartyVerified: true,
              lastVerificationDate: true
            }
          }
        }
      },
      type: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      entity: {
        legalName: 'asc'
      }
    }
  })

  return counterparties
    .filter((counterparty: CounterpartyWithEntity) => counterparty.entity !== null && counterparty.entity.legalName !== null)
    .map((counterparty: CounterpartyWithEntity) => ({
      id: counterparty.id,
      name: counterparty.entity!.legalName,
      entityId: counterparty.entity!.id,
      createdAt: counterparty.createdAt.toISOString(),
      updatedAt: counterparty.updatedAt.toISOString(),
      type: counterparty.type,
      status: counterparty.status,
      contacts: counterparty.entity!.contacts,
      addresses: counterparty.entity!.addresses,
      kyc: counterparty.entity!.kyc || {
        verificationStatus: 'PENDING',
        counterpartyVerified: false,
        lastVerificationDate: null
      }
    }))
} 