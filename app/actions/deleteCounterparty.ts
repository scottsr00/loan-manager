'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteCounterparty(id: string) {
  try {
    // Delete related records first
    await prisma.counterpartyAddress.deleteMany({
      where: { counterpartyId: id }
    })
    
    await prisma.counterpartyContact.deleteMany({
      where: { counterpartyId: id }
    })

    // Then delete the counterparty
    await prisma.counterparty.delete({
      where: { id }
    })

    revalidatePath('/counterparties')
    return { success: true }
  } catch (error) {
    console.error('Error deleting counterparty:', error)
    return { success: false, error: 'Failed to delete counterparty' }
  }
} 