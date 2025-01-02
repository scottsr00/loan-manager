'use server'

import { prisma } from '@/lib/prisma'
import { type FacilityPosition } from '@prisma/client'

interface PositionWithRelations extends FacilityPosition {
  lender: {
    entity: {
      legalName: string
      id: string
    }
  }
}

interface FacilityPositionInfo {
  id: string
  name: string
  amount: number
  share: number
}

export async function getFacilityPositions(facilityId: string): Promise<FacilityPositionInfo[]> {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        positions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            lender: {
              include: {
                entity: {
                  select: {
                    id: true,
                    legalName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // Map positions to include entity information
    return facility.positions.map((position: PositionWithRelations) => ({
      id: position.lender.entity.id,
      name: position.lender.entity.legalName,
      amount: position.amount,
      share: position.share
    }))
  } catch (error) {
    console.error('Error fetching facility positions:', error)
    throw new Error('Failed to fetch facility positions')
  }
} 