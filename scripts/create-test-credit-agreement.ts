import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function createTestCreditAgreement() {
  try {
    // Create a borrower entity and associated Borrower record
    const borrowerEntity = await prisma.entity.findFirst({
      where: {
        legalName: 'Test Company Inc.'
      }
    }) || await prisma.entity.create({
      data: {
        id: 'TEST-BORROWER-001', // Using a predictable ID for testing
        legalName: 'Test Company Inc.',
        dba: 'Test Co',
        taxId: 'TAX123',
        countryOfIncorporation: 'US',
        status: 'ACTIVE',
        borrower: {
          create: {
            status: 'ACTIVE',
            industrySegment: 'TECHNOLOGY',
            businessType: 'CORPORATION',
            onboardingStatus: 'COMPLETED',
            kycStatus: 'APPROVED'
          }
        }
      }
    })

    // Create a lender entity and associated Lender record
    const lenderEntity = await prisma.entity.create({
      data: {
        id: 'TEST-LENDER-001', // Using a predictable ID for testing
        legalName: 'Bank of Test',
        dba: 'Test Bank',
        taxId: 'BANK456',
        countryOfIncorporation: 'US',
        status: 'ACTIVE',
        lender: {
          create: {
            status: 'ACTIVE'
          }
        }
      }
    })

    // Create the credit agreement
    const creditAgreement = await prisma.creditAgreement.create({
      data: {
        agreementNumber: 'CA-2024-001',
        borrowerId: borrowerEntity.id,
        lenderId: lenderEntity.id,
        amount: 10000000,
        currency: 'USD',
        status: 'ACTIVE',
        startDate: new Date(),
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        interestRate: 5.5,
        facilities: {
          create: [
            {
              facilityName: 'Term Loan A',
              facilityType: 'TERM_LOAN',
              commitmentAmount: 6000000,
              availableAmount: 6000000,
              currency: 'USD',
              startDate: new Date(),
              maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              interestType: 'FLOATING',
              baseRate: 'SOFR',
              margin: 2.5
            },
            {
              facilityName: 'Revolving Credit Facility',
              facilityType: 'REVOLVING',
              commitmentAmount: 4000000,
              availableAmount: 4000000,
              currency: 'USD',
              startDate: new Date(),
              maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              interestType: 'FLOATING',
              baseRate: 'SOFR',
              margin: 3.0
            }
          ]
        }
      },
      include: {
        borrower: true,
        lender: true,
        facilities: true
      }
    })

    console.log('Created test credit agreement:', JSON.stringify(creditAgreement, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCreditAgreement() 