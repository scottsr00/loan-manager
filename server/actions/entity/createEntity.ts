'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'
import { type EntityInput, entityInputSchema } from '@/server/types/entity'

export async function createEntity(data: EntityInput) {
  try {
    // Validate input data
    const validatedData = entityInputSchema.parse(data)

    // Create the entity with its relationships
    const entity = await prisma.entity.create({
      data: {
        legalName: validatedData.legalName,
        dba: validatedData.dba,
        taxId: validatedData.taxId,
        countryOfIncorporation: validatedData.countryOfIncorporation,
        status: validatedData.status,
        addresses: {
          create: validatedData.addresses
        },
        contacts: {
          create: validatedData.contacts
        }
      },
      include: {
        addresses: true,
        contacts: true,
        beneficialOwners: true,
        lender: true,
        borrower: true,
        kyc: true
      }
    })

    revalidatePath('/entities')
    return entity
  } catch (error) {
    console.error('Error creating entity:', error)
    throw error
  }
} 