'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'

interface UpdateServicingActivityParams {
  id: string
  status: string
  completedBy?: string
}

async function processPositionUpdates(activityId: string) {
  const activity = await prisma.servicingActivity.findUnique({
    where: { id: activityId },
    include: {
      facility: {
        include: {
          positions: {
            include: {
              lender: {
                include: {
                  entity: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!activity || !activity.facility) {
    throw new Error('Activity or facility not found')
  }

  // Calculate total facility amount for share calculations
  const totalAmount = activity.facility.positions.reduce((sum: number, pos: { amount: number }) => sum + pos.amount, 0)

  // Update positions and create history records
  await Promise.all(activity.facility.positions.map(async (position: { 
    id: string, 
    amount: number, 
    lender: { 
      entity: { 
        id: string 
      } 
    } 
  }) => {
    const share = position.amount / totalAmount
    const changeAmount = activity.amount * share
    const newAmount = position.amount - changeAmount // For paydown, subtract the amount

    // Update position
    await prisma.facilityPosition.update({
      where: { id: position.id },
      data: { amount: newAmount }
    })

    // Create position history record
    await prisma.lenderPositionHistory.create({
      data: {
        facilityId: activity.facility.id,
        lenderId: position.lender.entity.id,
        changeType: 'PAYDOWN',
        previousOutstandingAmount: position.amount,
        newOutstandingAmount: newAmount,
        previousAccruedInterest: 0, // TODO: Track accrued interest
        newAccruedInterest: 0,
        changeAmount: changeAmount,
        userId: 'SYSTEM',
        notes: `Principal payment of ${formatAmount(changeAmount)} (${(share * 100).toFixed(2)}% of ${formatAmount(activity.amount)})`,
        servicingActivityId: activity.id
      }
    })
  }))
}

export async function updateServicingActivity(params: UpdateServicingActivityParams) {
  try {
    // First check if the servicing activity exists
    const existingActivity = await prisma.servicingActivity.findUnique({
      where: { id: params.id },
      include: {
        facility: true
      }
    })

    if (!existingActivity) {
      throw new Error(`Servicing activity with ID ${params.id} not found`)
    }

    // If status is changing to COMPLETED, process the position updates
    if (params.status === 'COMPLETED' && existingActivity.status !== 'COMPLETED') {
      await processPositionUpdates(params.id)
    }

    const activity = await prisma.servicingActivity.update({
      where: { id: params.id },
      data: {
        status: params.status,
        completedAt: params.status === 'COMPLETED' ? new Date() : null,
        completedBy: params.status === 'COMPLETED' ? params.completedBy : null,
        facilityOutstandingAmount: params.status === 'COMPLETED' ? existingActivity.facility.outstandingAmount : null,
        transactions: params.status === 'COMPLETED' ? {
          create: {
            activityType: existingActivity.activityType,
            amount: existingActivity.amount,
            status: 'COMPLETED',
            description: existingActivity.description || 'Servicing activity completed',
            effectiveDate: new Date(),
            processedBy: params.completedBy || 'SYSTEM',
            facilityOutstandingAmount: existingActivity.facility.outstandingAmount
          }
        } : undefined
      }
    })

    revalidatePath('/servicing')
    return activity
  } catch (error) {
    console.error('Error updating servicing activity:', error)
    throw error instanceof Error ? error : new Error('Failed to update servicing activity')
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
} 