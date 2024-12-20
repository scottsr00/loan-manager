'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'

interface UpdateServicingActivityParams {
  id: string
  status: string
  completedBy?: string
}

export async function updateServicingActivity(params: UpdateServicingActivityParams) {
  try {
    const activity = await prisma.servicingActivity.update({
      where: { id: params.id },
      data: {
        status: params.status,
        completedAt: params.status === 'COMPLETED' ? new Date() : null,
        completedBy: params.status === 'COMPLETED' ? params.completedBy : null,
      }
    })

    revalidatePath('/servicing')
    return activity
  } catch (error) {
    console.error('Error updating servicing activity:', error)
    throw new Error('Failed to update servicing activity')
  }
} 