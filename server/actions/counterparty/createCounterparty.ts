'use server'

import { db } from '@/server/db'
import { type Counterparty } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { type CounterpartyInput } from '@/server/types/counterparty'

export async function createCounterparty(data: CounterpartyInput): Promise<Counterparty> {
  try {
    // Validate counterparty type exists
    const counterpartyType = await db.counterpartyType.findUnique({
      where: { id: data.typeId },
    })

    if (!counterpartyType) {
      throw new Error('Invalid counterparty type')
    }

    // Create counterparty with nested relations in a transaction
    const counterparty = await db.$transaction(async (tx) => {
      // Create the counterparty
      const newCounterparty = await tx.counterparty.create({
        data: {
          legalName: data.legalName,
          dba: data.dba,
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,
          typeId: data.typeId,
          status: data.status,
          incorporationDate: data.incorporationDate,
          website: data.website,
          description: data.description,
          addresses: {
            create: data.addresses.map(address => ({
              type: address.type,
              street1: address.street1,
              street2: address.street2,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
              isPrimary: address.isPrimary,
            }))
          },
          contacts: {
            create: data.contacts.map(contact => ({
              type: contact.type,
              firstName: contact.firstName,
              lastName: contact.lastName,
              title: contact.title,
              email: contact.email,
              phone: contact.phone,
              isPrimary: contact.isPrimary,
            }))
          }
        },
      })

      return newCounterparty
    })

    revalidatePath('/counterparties')
    return counterparty
  } catch (error) {
    console.error('Error creating counterparty:', error)
    throw error
  }
} 