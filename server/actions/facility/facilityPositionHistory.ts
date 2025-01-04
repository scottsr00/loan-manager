'use server'

import { prisma } from '@/lib/prisma'
import type { FacilityPositionHistory, FacilityPositionHistoryView } from '@/server/types/facility-position-history'
import type { FacilityPositionStatus } from '@/server/types/facility-position'
import type { Prisma } from '@prisma/client'
import { PositionChangeType } from '@prisma/client'

type FacilityPositionHistoryWithRelations = {
  id: string
  facilityId: string
  lenderId: string
  changeDateTime: Date
  changeType: PositionChangeType
  previousCommitmentAmount: number
  newCommitmentAmount: number
  previousUndrawnAmount: number
  newUndrawnAmount: number
  previousDrawnAmount: number
  newDrawnAmount: number
  previousShare: number
  newShare: number
  previousStatus: string
  newStatus: string
  changeAmount: number
  userId: string
  notes?: string | null
  servicingActivityId?: string | null
  tradeId?: string | null
  createdAt: Date
  updatedAt: Date
  facility: {
    facilityName: string
    currency: string
    commitmentAmount: number
  }
  lender: {
    entityId: string
  }
  servicingActivity?: {
    id: string
    activityType: string
    dueDate: Date
    amount: number
    status: string
  } | null
  trade?: {
    id: string
    sellerCounterparty: {
      entityId: string
    }
    parAmount: number
    price: number
    status: string
    tradeDate: Date
    settlementDate: Date
  } | null
}

interface CreateFacilityPositionHistoryInput {
  facilityId: string
  lenderId: string
  changeType: PositionChangeType
  previousCommitmentAmount: number
  newCommitmentAmount: number
  previousUndrawnAmount: number
  newUndrawnAmount: number
  previousDrawnAmount: number
  newDrawnAmount: number
  previousShare: number
  newShare: number
  previousStatus: FacilityPositionStatus
  newStatus: FacilityPositionStatus
  changeAmount: number
  userId: string
  notes?: string
  activityType?: 'SERVICING' | 'TRADE'
  servicingActivityId?: string
  tradeId?: string
}

export async function createFacilityPositionHistory(data: CreateFacilityPositionHistoryInput): Promise<FacilityPositionHistory> {
  try {
    const { activityType, ...prismaData } = data

    const history = await prisma.facilityPositionHistory.create({
      data: {
        ...prismaData,
        changeDateTime: new Date()
      },
      include: {
        facility: {
          select: {
            facilityName: true,
            currency: true,
            commitmentAmount: true
          }
        },
        lender: true
      }
    })

    return history
  } catch (error) {
    console.error('Error in createFacilityPositionHistory:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create facility position history record')
  }
}

interface GetFacilityPositionHistoryParams {
  facilityId?: string
  lenderId?: string
  startDate?: Date
  endDate?: Date
  activityId?: string
  activityType?: 'SERVICING' | 'TRADE'
}

export async function getFacilityPositionHistory(params: GetFacilityPositionHistoryParams = {}): Promise<FacilityPositionHistoryView[]> {
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

      const histories = await prisma.facilityPositionHistory.findMany({
        where,
        include: {
          facility: true,
          lender: true,
          servicingActivity: true,
          trade: {
            include: {
              sellerCounterparty: true
            }
          }
        },
        orderBy: {
          changeDateTime: 'desc'
        }
      })

      return histories.map((history: FacilityPositionHistoryWithRelations) => ({
        id: history.id,
        facilityName: history.facility.facilityName,
        lenderName: history.lender.entityId,
        changeDateTime: history.changeDateTime,
        changeType: history.changeType,
        previousAmount: history.previousCommitmentAmount,
        newAmount: history.newCommitmentAmount,
        previousShare: history.previousShare,
        newShare: history.newShare,
        previousStatus: history.previousStatus as FacilityPositionStatus,
        newStatus: history.newStatus as FacilityPositionStatus,
        changeAmount: history.changeAmount,
        notes: history.notes,
        ...(history.servicingActivity ? {
          servicingActivity: {
            id: history.servicingActivity.id,
            activityType: history.servicingActivity.activityType,
            dueDate: history.servicingActivity.dueDate,
            amount: history.servicingActivity.amount,
            status: history.servicingActivity.status
          }
        } : {}),
        ...(history.trade ? {
          trade: {
            id: history.trade.id,
            counterparty: history.trade.sellerCounterparty.entityId,
            amount: history.trade.parAmount,
            price: history.trade.price,
            status: history.trade.status,
            tradeDate: history.trade.tradeDate,
            settlementDate: history.trade.settlementDate
          }
        } : {})
      }))
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

    const histories = await prisma.facilityPositionHistory.findMany({
      where,
      include: {
        facility: true,
        lender: true,
        servicingActivity: true,
        trade: {
          include: {
            sellerCounterparty: true
          }
        }
      },
      orderBy: {
        changeDateTime: 'desc'
      }
    })

    return histories.map((history: FacilityPositionHistoryWithRelations) => ({
      id: history.id,
      facilityName: history.facility.facilityName,
      lenderName: history.lender.entityId,
      changeDateTime: history.changeDateTime,
      changeType: history.changeType,
      previousAmount: history.previousCommitmentAmount,
      newAmount: history.newCommitmentAmount,
      previousShare: history.previousShare,
      newShare: history.newShare,
      previousStatus: history.previousStatus as FacilityPositionStatus,
      newStatus: history.newStatus as FacilityPositionStatus,
      changeAmount: history.changeAmount,
      notes: history.notes,
      ...(history.servicingActivity ? {
        servicingActivity: {
          id: history.servicingActivity.id,
          activityType: history.servicingActivity.activityType,
          dueDate: history.servicingActivity.dueDate,
          amount: history.servicingActivity.amount,
          status: history.servicingActivity.status
        }
      } : {}),
      ...(history.trade ? {
        trade: {
          id: history.trade.id,
          counterparty: history.trade.sellerCounterparty.entityId,
          amount: history.trade.parAmount,
          price: history.trade.price,
          status: history.trade.status,
          tradeDate: history.trade.tradeDate,
          settlementDate: history.trade.settlementDate
        }
      } : {})
    }))
  } catch (error) {
    console.error('Error in getFacilityPositionHistory:', error)
    throw new Error('Failed to fetch facility position history')
  }
}

export async function getLatestFacilityPosition(facilityId: string, lenderId: string): Promise<FacilityPositionHistory | null> {
  try {
    const latest = await prisma.facilityPositionHistory.findFirst({
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
        lender: true
      },
      orderBy: {
        changeDateTime: 'desc'
      }
    })

    return latest
  } catch (error) {
    console.error('Error in getLatestFacilityPosition:', error)
    throw new Error('Failed to fetch latest facility position')
  }
} 