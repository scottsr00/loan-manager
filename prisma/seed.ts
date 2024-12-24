import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data in the correct order
  await prisma.transactionHistory.deleteMany()
  await prisma.loanPosition.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.facilityPosition.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.creditAgreement.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.borrower.deleteMany()
  await prisma.lender.deleteMany()
  await prisma.beneficialOwner.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.address.deleteMany()
  await prisma.entity.deleteMany()

  // Create entities
  const borrowerEntity = await prisma.entity.create({
    data: {
      legalName: 'Acme Corporation',
      dba: 'Acme Corp',
      registrationNumber: 'REG123456',
      taxId: '123-45-6789',
      dateOfIncorporation: new Date('2010-01-01'),
      governmentId: 'GOV-ID-123',
      governmentIdType: 'EIN',
      governmentIdExpiry: new Date('2025-01-01'),
      primaryContactName: 'John Smith',
      primaryContactEmail: 'john.smith@acme.com',
      primaryContactPhone: '+1-555-0123',
      status: 'ACTIVE',
      addresses: {
        create: [{
          type: 'LEGAL',
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          isPrimary: true
        }]
      },
      contacts: {
        create: [{
          type: 'PRIMARY',
          firstName: 'John',
          lastName: 'Smith',
          title: 'CEO',
          email: 'john.smith@acme.com',
          phone: '+1-555-0123',
          isPrimary: true
        }]
      },
      beneficialOwners: {
        create: [{
          name: 'John Smith',
          dateOfBirth: new Date('1970-01-01'),
          nationality: 'USA',
          ownershipPercentage: 100,
          controlType: 'DIRECT',
          verificationStatus: 'VERIFIED'
        }]
      }
    }
  })

  const lenderEntity = await prisma.entity.create({
    data: {
      legalName: 'Sample Bank',
      dba: 'SBank',
      registrationNumber: 'REG789012',
      taxId: '987-65-4321',
      dateOfIncorporation: new Date('1990-01-01'),
      governmentId: 'GOV-ID-456',
      governmentIdType: 'EIN',
      governmentIdExpiry: new Date('2025-01-01'),
      primaryContactName: 'Jane Doe',
      primaryContactEmail: 'jane.doe@sbank.com',
      primaryContactPhone: '+1-555-4567',
      status: 'ACTIVE',
      addresses: {
        create: [{
          type: 'LEGAL',
          street1: '456 Wall St',
          city: 'New York',
          state: 'NY',
          postalCode: '10005',
          country: 'USA',
          isPrimary: true
        }]
      },
      contacts: {
        create: [{
          type: 'PRIMARY',
          firstName: 'Jane',
          lastName: 'Doe',
          title: 'Managing Director',
          email: 'jane.doe@sbank.com',
          phone: '+1-555-4567',
          isPrimary: true
        }]
      }
    }
  })

  // Create borrower
  const borrower = await prisma.borrower.create({
    data: {
      entityId: borrowerEntity.id,
      industrySegment: 'Technology',
      businessType: 'CORPORATE',
      creditRating: 'BBB+',
      ratingAgency: 'S&P',
      riskRating: 'Medium',
      onboardingStatus: 'COMPLETED',
      kycStatus: 'APPROVED'
    }
  })

  // Create lender
  const lender = await prisma.lender.create({
    data: {
      entityId: lenderEntity.id,
      status: 'ACTIVE',
      onboardingDate: new Date()
    }
  })

  // Create credit agreement
  await prisma.creditAgreement.create({
    data: {
      agreementNumber: 'CA-2024-001',
      borrowerId: borrower.entityId,
      lenderId: lender.entityId,
      status: 'ACTIVE',
      amount: 10000000,
      currency: 'USD',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2029-01-01'),
      interestRate: 5.5,
      description: 'Five-year term loan facility for working capital',
      facilities: {
        create: [
          {
            facilityName: 'Term Loan A',
            facilityType: 'TERM_LOAN',
            commitmentAmount: 6000000,
            availableAmount: 3000000,
            currency: 'USD',
            startDate: new Date('2024-01-01'),
            maturityDate: new Date('2029-01-01'),
            interestType: 'FLOATING',
            baseRate: 'SOFR',
            margin: 3.5,
            description: 'Senior secured term loan',
            loans: {
              create: [
                {
                  amount: 3000000,
                  outstandingAmount: 3000000,
                  currency: 'USD',
                  status: 'ACTIVE',
                  positions: {
                    create: [
                      {
                        lenderId: lender.id,
                        amount: 3000000,
                        status: 'ACTIVE'
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            facilityName: 'Revolving Credit Facility',
            facilityType: 'REVOLVER',
            commitmentAmount: 4000000,
            availableAmount: 3000000,
            currency: 'USD',
            startDate: new Date('2024-01-01'),
            maturityDate: new Date('2029-01-01'),
            interestType: 'FLOATING',
            baseRate: 'SOFR',
            margin: 4.0,
            description: 'Working capital revolving facility',
            loans: {
              create: [
                {
                  amount: 1000000,
                  outstandingAmount: 1000000,
                  currency: 'USD',
                  status: 'ACTIVE',
                  positions: {
                    create: [
                      {
                        lenderId: lender.id,
                        amount: 1000000,
                        status: 'ACTIVE'
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 