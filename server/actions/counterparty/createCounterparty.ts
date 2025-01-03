'use server'

import { prisma } from '@/server/db/client'
import { type CounterpartyInput } from '@/server/types/counterparty'
import { revalidatePath } from 'next/cache'

export async function createCounterparty(data: CounterpartyInput) {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error('Name is required')
    }

    // Create the entity first
    const entity = await prisma.entity.create({
      data: {
        id: `CP-${Date.now()}`, // Temporary ID generation - you might want to use a proper LEI generator
        legalName: data.name,
        status: 'ACTIVE',
        // Create the counterparty relationship
        counterparty: {
          create: {
            status: data.status || 'ACTIVE',
            // Create addresses
            addresses: {
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
            },
            // Create contacts
            contacts: {
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
          }
        }
      },
      include: {
        counterparty: {
          include: {
            addresses: true,
            contacts: true
          }
        }
      }
    })

    // Revalidate the counterparties page
    revalidatePath('/counterparties')
    
    return entity.counterparty
  } catch (error) {
    console.error('Error creating counterparty:', error)
    throw error instanceof Error ? error : new Error('Failed to create counterparty')
  }
} 