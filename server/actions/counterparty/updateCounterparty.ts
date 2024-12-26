'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'
import { type CreateCounterpartyInput } from '@/types/counterparty'

export async function updateCounterparty(id: string, data: Partial<CreateCounterpartyInput>) {
  try {
    // First check if the counterparty exists
    const existingCounterparty = await prisma.counterparty.findUnique({
      where: { id },
      include: {
        type: true,
      },
    })

    if (!existingCounterparty) {
      throw new Error('Counterparty not found')
    }

    // Update the counterparty
    const updatedCounterparty = await prisma.counterparty.update({
      where: { id },
      data: {
        name: data.legalName,
        typeId: data.typeId,
        status: data.status,
      },
      include: {
        type: true,
      },
    })

    revalidatePath('/counterparties')
    return updatedCounterparty
  } catch (error) {
    console.error('Error updating counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to update counterparty')
  }
} 