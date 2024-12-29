import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function createTestCreditAgreement() {
  try {
    // Create a borrower entity if it doesn't exist
    const borrower = await prisma.entity.findFirst({
      where: {
        legalName: 'Test Company Inc.'
      }
    }) || await prisma.entity.create({
      data: {
        legalName: 'Test Company Inc.',
        dba: 'Test Co',
        registrationNumber: 'REG123',
        taxId: 'TAX123',
        countryOfIncorporation: 'US',
        status: 'ACTIVE'
      }
    })

    // Create a lender entity and associated Lender record
    const lenderEntity = await prisma.entity.create({
      data: {
        legalName: 'Bank of Test',
        dba: 'Test Bank',
        registrationNumber: 'BANK123',
        taxId: 'BANK456',
        countryOfIncorporation: 'US',
        status: 'ACTIVE'
      }
    })

    const lender = await prisma.lender.create({
      data: {
        entityId: lenderEntity.id,
        status: 'ACTIVE'
      }
    })

    // Create the credit agreement
    const creditAgreement = await prisma.creditAgreement.create({
      data: {
        agreementNumber: 'CA-2024-001',
        borrowerId: borrower.id,
        lenderId: lenderEntity.id,
        amount: 10000000,
        currency: 'USD',
        status: 'ACTIVE',
        startDate: new Date(),
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
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
              margin: 2.5,
              positions: {
                create: [
                  {
                    lenderId: lender.id,
                    amount: 6000000,
                    share: 100,
                    status: 'ACTIVE'
                  }
                ]
              }
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
              margin: 3.0,
              positions: {
                create: [
                  {
                    lenderId: lender.id,
                    amount: 4000000,
                    share: 100,
                    status: 'ACTIVE'
                  }
                ]
              }
            }
          ]
        }
      },
      include: {
        borrower: true,
        lender: true,
        facilities: {
          include: {
            positions: {
              include: {
                lender: true
              }
            }
          }
        }
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