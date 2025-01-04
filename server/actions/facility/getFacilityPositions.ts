'use server'

import { prisma } from '@/lib/prisma'
import { type FacilityPositionWithRelations, type FacilityPositionView } from '@/server/types/facility-position'

export async function getFacilityPositions(facilityId: string): Promise<FacilityPositionView[]> {
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
              select: {
                id: true,
                entityId: true,
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
    const positions = facility.positions.map((position: FacilityPositionWithRelations) => {
      console.log('Position lender:', position.lender)
      return {
        id: position.id,
        lenderId: position.lender.entityId,  // Use the lender's entityId
        lenderName: position.lender.entity.legalName,
        facilityId: facility.id,
        facilityName: facility.facilityName,
        commitmentAmount: position.commitmentAmount,
        drawnAmount: position.drawnAmount,
        undrawnAmount: position.undrawnAmount,
        share: position.share,
        status: position.status
      }
    })

    console.log('Mapped facility positions:', positions)
    return positions
  } catch (error) {
    console.error('Error fetching facility positions:', error)
    throw new Error('Failed to fetch facility positions')
  }
} 