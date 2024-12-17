'use server'

import { prisma } from '@/server/db/client'
import { type ServicingActivity, type ServicingActivityParams } from '@/server/types'

export async function getServicingActivities(params: ServicingActivityParams = {}): Promise<{
  activities: ServicingActivity[]
  total: number
  page: number
  pageSize: number
}> {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      activityType,
      startDate,
      endDate,
      assignedTo
    } = params

    const where = {
      ...(status && { status }),
      ...(activityType && { activityType }),
      ...(assignedTo && { assignedTo }),
      ...(startDate && endDate && {
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const [activities, total] = await Promise.all([
      prisma.servicingActivity.findMany({
        where,
        include: {
          loan: {
            select: {
              dealName: true,
              currentBalance: true,
              agentBank: true
            }
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.servicingActivity.count({ where })
    ])

    return {
      activities,
      total,
      page,
      pageSize
    }
  } catch (error) {
    console.error('Error in getServicingActivities:', error)
    throw new Error('Failed to fetch servicing activities')
  }
} 