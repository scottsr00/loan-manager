'use server'

import { prisma } from '@/server/db/client'

interface AddServicingActivityParams {
  facilityId: string
  activityType: string
  dueDate: Date
  description?: string
  amount: number
  status: string
}

export async function addServicingActivity(params: AddServicingActivityParams) {
  try {
    const activity = await prisma.servicingActivity.create({
      data: {
        facilityId: params.facilityId,
        activityType: params.activityType,
        dueDate: params.dueDate,
        description: params.description,
        amount: params.amount,
        status: params.status
      }
    })

    return activity
  } catch (error) {
    console.error('Error in addServicingActivity:', error)
    throw new Error('Failed to create servicing activity')
  }
} 