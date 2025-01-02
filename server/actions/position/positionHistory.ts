'use server'

import { prisma } from '@/server/db/client'
import type { LenderPositionHistory } from '@/server/types/position'
import type { FacilityPosition } from '@prisma/client'

interface CreatePositionHistoryInput {
  facilityId: string
  lenderId: string
  changeType: 'PAYDOWN' | 'ACCRUAL' | 'TRADE'
  previousOutstandingAmount: number
  newOutstandingAmount: number
  previousAccruedInterest: number
  newAccruedInterest: number
  changeAmount: number
  userId: string
  notes?: string
  activityType: 'SERVICING' | 'TRADE'
  servicingActivityId?: string
  tradeId?: string
}

export async function createPositionHistory(data: CreatePositionHistoryInput): Promise<LenderPositionHistory> {
  try {
    const { activityType, ...prismaData } = data

    const history = await prisma.lenderPositionHistory.create({
      data: {
        ...prismaData,
        changeDateTime: new Date()
      },
      include: {
        facility: {
          select: {
            facilityName: true,
            currency: true
          }
        },
        lender: {
          select: {
            legalName: true
          }
        }
      }
    })

    return history
  } catch (error) {
    console.error('Error in createPositionHistory:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create position history record')
  }
}

interface GetPositionHistoryParams {
  facilityId?: string
  lenderId?: string
  startDate?: Date
  endDate?: Date
  activityId?: string
  activityType?: 'SERVICING' | 'TRADE'
}

export async function getPositionHistory(params: GetPositionHistoryParams = {}) {
  try {
    const { facilityId, lenderId, startDate, endDate, activityId, activityType } = params

    // If we have an activity ID, get its timestamp to use as the reference point
    let referenceDate: Date | undefined
    if (activityId && activityType) {
      if (activityType === 'SERVICING') {
        const activity = await prisma.servicingActivity.findUnique({
          where: { id: activityId },
          select: { completedAt: true }
        })
        referenceDate = activity?.completedAt || undefined
      } else if (activityType === 'TRADE') {
        const trade = await prisma.trade.findUnique({
          where: { id: activityId },
          select: { settlementDate: true }
        })
        referenceDate = trade?.settlementDate || undefined
      }
    }

    // If we have a reference date, use it; otherwise use the provided date range
    const dateFilter = referenceDate ? {
      changeDateTime: {
        lte: referenceDate
      }
    } : (startDate && endDate ? {
      changeDateTime: {
        gte: startDate,
        lte: endDate
      }
    } : undefined)

    // Get all lenders for the facility
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        positions: {
          include: {
            lender: {
              include: {
                entity: true
              }
            }
          }
        }
      }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    // For each lender, get their position history
    const lenderIds = facility.positions.map((pos: FacilityPosition & { lender: { entity: { id: string } } }) => pos.lender.entity.id)
    const positionHistories = await Promise.all(lenderIds.map(async (lenderId: string) => {
      // Get the most recent position history record for this lender before or at the reference point
      const history = await prisma.lenderPositionHistory.findFirst({
        where: {
          facilityId,
          lenderId,
          ...dateFilter
        },
        include: {
          facility: true,
          lender: true,
          servicingActivity: true,
          trade: true
        },
        orderBy: {
          changeDateTime: 'desc'
        }
      })

      return history
    }))

    // Filter out null values and sort by changeDateTime
    return positionHistories
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => b.changeDateTime.getTime() - a.changeDateTime.getTime())

  } catch (error) {
    console.error('Error in getPositionHistory:', error)
    throw new Error('Failed to fetch position history')
  }
}

export async function getLatestPosition(facilityId: string, lenderId: string): Promise<LenderPositionHistory | null> {
  try {
    const latest = await prisma.lenderPositionHistory.findFirst({
      where: {
        facilityId,
        lenderId
      },
      include: {
        facility: {
          select: {
            facilityName: true,
            currency: true
          }
        },
        lender: {
          select: {
            legalName: true
          }
        }
      },
      orderBy: {
        changeDateTime: 'desc'
      }
    })

    return latest
  } catch (error) {
    console.error('Error in getLatestPosition:', error)
    throw new Error('Failed to fetch latest position')
  }
} 