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
        registrationNumber: validatedData.registrationNumber,
        taxId: validatedData.taxId,
        status: validatedData.status,
        isAgent: validatedData.isAgent || false,
        dateOfIncorporation: validatedData.dateOfIncorporation,
        countryOfIncorporation: validatedData.countryOfIncorporation,
        governmentId: validatedData.governmentId,
        governmentIdType: validatedData.governmentIdType,
        governmentIdExpiry: validatedData.governmentIdExpiry,
        primaryContactName: validatedData.primaryContactName,
        primaryContactEmail: validatedData.primaryContactEmail,
        primaryContactPhone: validatedData.primaryContactPhone,
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
        borrower: true
      }
    })

    revalidatePath('/entities')
    return entity
  } catch (error) {
    console.error('Error creating entity:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      throw new Error(`Failed to create entity: ${error.message}`)
    }
    throw new Error('Failed to create entity: Unknown error')
  }
} 