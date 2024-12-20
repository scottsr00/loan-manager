'use server'

import { prisma } from '@/server/db/client'

interface GetServicingActivitiesParams {
  status?: string
  activityType?: string
  facilityId?: string
  startDate?: Date
  endDate?: Date
}

export async function getServicingActivities(params: GetServicingActivitiesParams = {}) {
  try {
    const { status, activityType, facilityId, startDate, endDate } = params

    const where = {
      ...(status && { status }),
      ...(activityType && { activityType }),
      ...(facilityId && { facilityId }),
      ...(startDate && endDate && {
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const activities = await prisma.servicingActivity.findMany({
      where,
      include: {
        facility: {
          include: {
            creditAgreement: true,
            loans: {
              where: {
                status: 'ACTIVE'
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    return {
      activities: activities.map(activity => ({
        ...activity,
        loan: activity.facility.loans[0] || null
      }))
    }
  } catch (error) {
    console.error('Error in getServicingActivities:', error)
    throw new Error('Failed to fetch servicing activities')
  }
} 