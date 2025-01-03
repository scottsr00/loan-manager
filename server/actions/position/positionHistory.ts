'use server'

import { prisma } from '@/server/db/client'
import type { LenderPositionHistory } from '@/server/types/position'
import type { FacilityPosition } from '@prisma/client'

interface CreatePositionHistoryInput {
  facilityId: string
  lenderId: string
  changeType: 'PAYDOWN' | 'ACCRUAL' | 'TRADE'
  previousCommitmentAmount: number
  newCommitmentAmount: number
  previousUndrawnAmount: number
  newUndrawnAmount: number
  previousDrawnAmount: number
  newDrawnAmount: number
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
            currency: true,
            outstandingAmount: true,
            commitmentAmount: true
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

    if (!facilityId) {
      throw new Error('Facility ID is required')
    }

    // If we have an activity ID, get positions directly related to that activity
    if (activityId && activityType) {
      const where: any = {
        facilityId,
        ...(lenderId ? { lenderId } : {})
      }

      // Add the specific activity relation
      if (activityType === 'SERVICING') {
        where.servicingActivityId = activityId
      } else if (activityType === 'TRADE') {
        where.tradeId = activityId
      }

      const histories = await prisma.lenderPositionHistory.findMany({
        where,
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

      return histories
    }

    // For date range queries, get positions within the date range
    const dateFilter = startDate && endDate ? {
      changeDateTime: {
        gte: startDate,
        lte: endDate
      }
    } : undefined

    const where = {
      facilityId,
      ...(lenderId ? { lenderId } : {}),
      ...dateFilter
    }

    const histories = await prisma.lenderPositionHistory.findMany({
      where,
      include: {
        facility: {
          select: {
            facilityName: true,
            currency: true,
            outstandingAmount: true,
            commitmentAmount: true
          }
        },
        lender: true,
        servicingActivity: true,
        trade: true
      },
      orderBy: {
        changeDateTime: 'desc'
      }
    })

    return histories
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