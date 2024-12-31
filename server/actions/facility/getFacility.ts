'use server'

import { prisma } from '@/server/db/client'
import { type Prisma } from '@prisma/client'

export type FacilityWithRelations = Prisma.FacilityGetPayload<{
  include: {
    creditAgreement: {
      include: {
        borrower: true
        lender: true
      }
    }
    positions: {
      include: {
        lender: {
          include: {
            entity: true
          }
        }
      }
    }
    loans: {
      include: {
        transactions: true
      }
    }
    servicingActivities: true
    servicingAssignments: {
      include: {
        teamMember: {
          include: {
            role: true
          }
        }
      }
    }
    trades: {
      include: {
        counterparty: true
      }
    }
  }
}>

export async function getFacility(id: string): Promise<FacilityWithRelations | null> {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        creditAgreement: {
          include: {
            borrower: true,
            lender: true
          }
        },
        positions: {
          include: {
            lender: {
              include: {
                entity: true
              }
            }
          }
        },
        loans: {
          include: {
            transactions: true
          }
        },
        servicingActivities: true,
        servicingAssignments: {
          include: {
            teamMember: {
              include: {
                role: true
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
    })

    if (!facility) {
      return null
    }

    return facility
  } catch (error) {
    console.error('Error fetching facility:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to fetch facility: ${error.message}`)
    }
    throw new Error('Failed to fetch facility: Unknown error')
  }
} 