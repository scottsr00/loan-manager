'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type CreateCounterpartyInput = {
  legalName: string
  parentName?: string
  ultParentName?: string
  counterpartyTypeId: string
  kycStatus: string
  onboardingStatus: string
  registrationNumber?: string
  taxId?: string
  incorporationDate?: Date
  website?: string
  description?: string
  address: {
    type: string
    street1: string
    street2?: string
    city: string
    state?: string
    postalCode?: string
    country: string
    isPrimary: boolean
  }
  contact: {
    type: string
    firstName: string
    lastName: string
    title?: string
    email?: string
    phone?: string
    isPrimary: boolean
  }
}

export async function createCounterparty(data: CreateCounterpartyInput) {
  console.log('Creating counterparty with data:', data)
  
  try {
    // Validate required fields
    if (!data.legalName) throw new Error('Legal name is required')
    if (!data.counterpartyTypeId) throw new Error('Counterparty type is required')
    if (!data.kycStatus) throw new Error('KYC status is required')
    if (!data.onboardingStatus) throw new Error('Onboarding status is required')
    
    // Validate address
    if (!data.address?.street1) throw new Error('Street address is required')
    if (!data.address?.city) throw new Error('City is required')
    if (!data.address?.country) throw new Error('Country is required')
    
    // Validate contact
    if (!data.contact?.firstName) throw new Error('Contact first name is required')
    if (!data.contact?.lastName) throw new Error('Contact last name is required')

    const counterparty = await prisma.counterparty.create({
      data: {
        legalName: data.legalName,
        parentName: data.parentName || null,
        ultParentName: data.ultParentName || null,
        counterpartyTypeId: data.counterpartyTypeId,
        kycStatus: data.kycStatus,
        onboardingStatus: data.onboardingStatus,
        registrationNumber: data.registrationNumber || null,
        taxId: data.taxId || null,
        incorporationDate: data.incorporationDate || null,
        website: data.website || null,
        description: data.description || null,
        addresses: {
          create: [{
            type: data.address.type,
            street1: data.address.street1,
            street2: data.address.street2 || null,
            city: data.address.city,
            state: data.address.state || null,
            postalCode: data.address.postalCode || null,
            country: data.address.country,
            isPrimary: true,
          }],
        },
        contacts: {
          create: [{
            type: data.contact.type,
            firstName: data.contact.firstName,
            lastName: data.contact.lastName,
            title: data.contact.title || null,
            email: data.contact.email || null,
            phone: data.contact.phone || null,
            isPrimary: true,
          }],
        },
      },
      include: {
        counterpartyType: true,
        addresses: true,
        contacts: true,
      },
    })

    console.log('Created counterparty:', counterparty)
    revalidatePath('/counterparties')
    return counterparty
  } catch (error) {
    console.error('Error in createCounterparty:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create counterparty: ${error.message}`)
    }
    throw new Error('Failed to create counterparty: Unknown error')
  }
} 