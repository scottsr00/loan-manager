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

    // First, get all servicing activities with their facilities
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
              select: {
                id: true,
                status: true,
                outstandingAmount: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    return {
      activities: activities.map(activity => {
        const { facility, ...rest } = activity
        const activeLoans = facility?.loans || []
        const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0)

        // For payment activities, include all active loans with their proportional amounts
        if (['PRINCIPAL_PAYMENT', 'INTEREST_PAYMENT', 'UNSCHEDULED_PAYMENT'].includes(activity.activityType)) {
          return {
            ...rest,
            facility,
            loans: activeLoans.map(loan => ({
              id: loan.id,
              status: loan.status,
              outstandingAmount: loan.outstandingAmount,
              // Calculate the proportional share of the payment for each loan
              paymentShare: totalOutstanding > 0 
                ? (loan.outstandingAmount / totalOutstanding) * activity.amount 
                : 0
            }))
          }
        }

        return {
          ...rest,
          facility
        }
      })
    }
  } catch (error) {
    console.error('Error in getServicingActivities:', error)
    throw new Error('Failed to fetch servicing activities')
  }
} 