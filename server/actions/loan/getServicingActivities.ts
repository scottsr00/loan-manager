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
      facilityId
    } = params

    const where = {
      ...(status && status !== 'all' && { status }),
      ...(activityType && activityType !== 'all' && { activityType }),
      ...(facilityId && facilityId !== 'all' && { facilityId }),
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
          facility: {
            select: {
              facilityName: true,
              facilityType: true,
              creditAgreement: {
                select: {
                  agreementName: true
                }
              }
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