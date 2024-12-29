import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function createTestBorrower() {
  try {
    const entity = await prisma.entity.create({
      data: {
        legalName: 'Test Company Inc.',
        dba: 'Test Co',
        registrationNumber: 'REG123',
        taxId: 'TAX123',
        countryOfIncorporation: 'US',
        status: 'ACTIVE',
        addresses: {
          create: {
            type: 'BUSINESS',
            street1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'US',
            isPrimary: true
          }
        },
        contacts: {
          create: {
            type: 'PRIMARY',
            firstName: 'John',
            lastName: 'Doe',
            title: 'CEO',
            email: 'john@testco.com',
            phone: '555-0123',
            isPrimary: true
          }
        }
      }
    })

    const borrower = await prisma.borrower.create({
      data: {
        entityId: entity.id,
        industrySegment: 'Technology',
        businessType: 'Corporation',
        creditRating: 'BBB',
        ratingAgency: 'S&P',
        riskRating: 'Medium',
        onboardingStatus: 'PENDING',
        kycStatus: 'PENDING'
      },
      include: {
        entity: {
          include: {
            addresses: true,
            contacts: true
          }
        }
      }
    })

    console.log('Created test borrower:', borrower)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestBorrower() 