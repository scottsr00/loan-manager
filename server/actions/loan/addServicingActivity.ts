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
  if (!params) {
    throw new Error('Servicing activity parameters are required')
  }

  // Validate required fields
  if (!params.facilityId) {
    throw new Error('Facility ID is required')
  }
  if (!params.activityType) {
    throw new Error('Activity type is required')
  }
  if (!params.dueDate) {
    throw new Error('Due date is required')
  }
  if (typeof params.amount !== 'number' || params.amount <= 0) {
    throw new Error('Amount must be a positive number')
  }
  if (!params.status) {
    throw new Error('Status is required')
  }

  try {
    // First check if the facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: params.facilityId }
    })

    if (!facility) {
      throw new Error(`Facility with ID ${params.facilityId} not found`)
    }

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
    console.error('Error in addServicingActivity:', error instanceof Error ? error.message : 'Unknown error')
    throw error instanceof Error ? error : new Error('Failed to create servicing activity')
  }
} 