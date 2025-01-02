'use server'

import { prisma } from '@/server/db/client'
import { type LenderPositionHistoryInput, type LenderPositionHistory } from '@/server/types/position'

export async function createPositionHistory(data: LenderPositionHistoryInput): Promise<LenderPositionHistory> {
  try {
    const history = await prisma.lenderPositionHistory.create({
      data: {
        ...data,
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
    throw new Error('Failed to create position history record')
  }
}

export async function getPositionHistory(params: {
  facilityId?: string
  lenderId?: string
  startDate?: Date
  endDate?: Date
}): Promise<LenderPositionHistory[]> {
  try {
    const { facilityId, lenderId, startDate, endDate } = params

    const where = {
      ...(facilityId && { facilityId }),
      ...(lenderId && { lenderId }),
      ...(startDate && endDate && {
        changeDateTime: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const history = await prisma.lenderPositionHistory.findMany({
      where,
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

    return history
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