'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'
import { type CounterpartyInput } from '@/server/types/counterparty'

export async function updateCounterparty(id: string, data: Partial<CounterpartyInput>) {
  try {
    // First check if the counterparty exists
    const existingCounterparty = await prisma.counterparty.findUnique({
      where: { id },
      include: {
        entity: true
      }
    })

    if (!existingCounterparty) {
      throw new Error('Counterparty not found')
    }

    // Update both the entity and counterparty
    const updatedCounterparty = await prisma.counterparty.update({
      where: { id },
      data: {
        status: data.status,
        entity: {
          update: {
            legalName: data.name,
          }
        },
        // Update addresses if provided
        ...(data.addresses && {
          addresses: {
            deleteMany: {},
            createMany: {
              data: data.addresses.map(addr => ({
                type: addr.type,
                street1: addr.street1,
                street2: addr.street2,
                city: addr.city,
                state: addr.state,
                postalCode: addr.postalCode,
                country: addr.country,
                isPrimary: addr.isPrimary
              }))
            }
          }
        }),
        // Update contacts if provided
        ...(data.contacts && {
          contacts: {
            deleteMany: {},
            createMany: {
              data: data.contacts.map(contact => ({
                type: contact.type,
                firstName: contact.firstName,
                lastName: contact.lastName,
                title: contact.title,
                email: contact.email,
                phone: contact.phone,
                isPrimary: contact.isPrimary
              }))
            }
          }
        })
      },
      include: {
        entity: true,
        addresses: true,
        contacts: true
      }
    })

    revalidatePath('/counterparties')
    return updatedCounterparty
  } catch (error) {
    console.error('Error updating counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to update counterparty')
  }
} 