'use server'

import { db } from '@/server/db'
import { type CounterpartyWithRelations } from '@/server/types/counterparty'
import { revalidatePath } from 'next/cache'

export async function deleteCounterparty(id: string): Promise<void> {
  try {
    // First check if the counterparty exists
    const counterparty = await db.counterparty.findUnique({
      where: { id },
      include: {
        type: true,
        addresses: true,
        contacts: true,
      }
    }) as CounterpartyWithRelations | null

    if (!counterparty) {
      throw new Error('Counterparty not found')
    }

    // Check for trades associated with this counterparty
    const trades = await db.trade.findFirst({
      where: { counterpartyId: id }
    })

    if (trades) {
      throw new Error('Cannot delete counterparty with associated trades')
    }

    // Delete all related records in a transaction
    await db.$transaction([
      // Delete all addresses
      db.counterpartyAddress.deleteMany({
        where: { counterpartyId: id }
      }),
      // Delete all contacts
      db.counterpartyContact.deleteMany({
        where: { counterpartyId: id }
      }),
      // Delete the counterparty record
      db.counterparty.delete({
        where: { id }
      })
    ])

    revalidatePath('/counterparties')
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'P2003') {
        throw new Error('Cannot delete counterparty due to existing relationships')
      }
      throw error
    }
    throw new Error('Failed to delete counterparty')
  }
} 