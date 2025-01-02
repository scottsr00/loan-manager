'use server'

import { prisma } from '@/server/db/client'
import { revalidatePath } from 'next/cache'
import { type EntityInput, entityInputSchema } from '@/server/types/entity'

export async function updateEntity(id: string, data: EntityInput) {
  try {
    // Validate input data
    const validatedData = entityInputSchema.parse(data)

    // Update the entity
    const entity = await prisma.entity.update({
      where: { id },
      data: {
        legalName: validatedData.legalName,
        dba: validatedData.dba,
        taxId: validatedData.taxId,
        countryOfIncorporation: validatedData.countryOfIncorporation,
        status: validatedData.status,
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
    console.error('Error updating entity:', error)
    throw error
  }
} 