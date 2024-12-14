import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.borrowerCovenant.deleteMany()
  await prisma.borrowerFinancialStatement.deleteMany()
  await prisma.borrowerRequiredDocument.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.creditAgreement.deleteMany()
  await prisma.borrower.deleteMany()
  await prisma.entityDocument.deleteMany()
  await prisma.entityContact.deleteMany()
  await prisma.entityAddress.deleteMany()
  await prisma.entityRelationship.deleteMany()
  await prisma.entity.deleteMany()
  await prisma.entityType.deleteMany()

  // Create entity types
  const corporationType = await prisma.entityType.create({
    data: {
      name: 'Corporation',
      description: 'A corporate entity',
    },
  })

  const bankType = await prisma.entityType.create({
    data: {
      name: 'Bank',
      description: 'A banking institution',
    },
  })

  // Create bank entities
  const jpMorgan = await prisma.entity.create({
    data: {
      legalName: 'JPMorgan Chase Bank, N.A.',
      entityType: { connect: { id: bankType.id } },
      registrationNumber: '123456789',
      taxId: '12-3456789',
      status: 'ACTIVE',
      website: 'https://www.jpmorgan.com',
      addresses: {
        create: {
          type: 'REGISTERED',
          street1: '383 Madison Avenue',
          city: 'New York',
          state: 'NY',
          postalCode: '10179',
          country: 'USA',
          isPrimary: true,
        },
      },
      contacts: {
        create: {
          type: 'OFFICER',
          firstName: 'John',
          lastName: 'Smith',
          title: 'Managing Director',
          email: 'john.smith@jpmorgan.com',
          isPrimary: true,
        },
      },
    },
  })

  // Create borrower entities
  const acmeCorp = await prisma.entity.create({
    data: {
      legalName: 'Acme Corporation',
      entityType: { connect: { id: corporationType.id } },
      registrationNumber: '987654321',
      taxId: '98-7654321',
      status: 'ACTIVE',
      website: 'https://www.acmecorp.com',
      addresses: {
        create: {
          type: 'REGISTERED',
          street1: '100 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA',
          isPrimary: true,
        },
      },
      contacts: {
        create: {
          type: 'OFFICER',
          firstName: 'Jane',
          lastName: 'Doe',
          title: 'CFO',
          email: 'jane.doe@acmecorp.com',
          isPrimary: true,
        },
      },
    },
  })

  // Create borrower profile
  const acmeBorrower = await prisma.borrower.create({
    data: {
      entity: { connect: { id: acmeCorp.id } },
      onboardingStatus: 'COMPLETED',
      onboardingDate: new Date(),
      approvalDate: new Date(),
      creditRating: 'BBB+',
      ratingAgency: 'S&P',
      ratingDate: new Date(),
      watchStatus: 'NONE',
      annualRevenue: 500000000,
      totalAssets: 1000000000,
      totalLiabilities: 400000000,
      netWorth: 600000000,
      documentationStatus: 'COMPLETE',
      riskRating: 'MEDIUM',
      amlStatus: 'CLEARED',
      kycStatus: 'APPROVED',
      sanctionsScreening: 'CLEARED',
      relationshipManager: 'Michael Wilson',
      customerSince: new Date('2020-01-01'),
      requiredDocuments: {
        create: [
          {
            documentType: 'FINANCIAL_STATEMENTS',
            status: 'APPROVED',
            documentUrl: 'https://example.com/financials.pdf',
            submissionDate: new Date(),
          },
          {
            documentType: 'TAX_RETURNS',
            status: 'APPROVED',
            documentUrl: 'https://example.com/tax.pdf',
            submissionDate: new Date(),
          },
        ],
      },
      financialStatements: {
        create: {
          statementType: 'ANNUAL',
          statementDate: new Date(),
          periodEnd: new Date('2023-12-31'),
          revenue: 500000000,
          ebitda: 75000000,
          netIncome: 45000000,
          totalAssets: 1000000000,
          totalLiabilities: 400000000,
          totalEquity: 600000000,
          auditStatus: 'AUDITED',
          auditor: 'Deloitte',
        },
      },
      covenants: {
        create: [
          {
            covenantType: 'FINANCIAL',
            description: 'Minimum Interest Coverage Ratio of 3.0x',
            threshold: 3.0,
            frequency: 'QUARTERLY',
            status: 'COMPLIANT',
          },
          {
            covenantType: 'FINANCIAL',
            description: 'Maximum Leverage Ratio of 4.0x',
            threshold: 4.0,
            frequency: 'QUARTERLY',
            status: 'COMPLIANT',
          },
        ],
      },
    },
  })

  // Create credit agreement
  const creditAgreement = await prisma.creditAgreement.create({
    data: {
      agreementName: 'Acme Corp Revolving Credit Facility',
      agreementNumber: 'ACF-2023-001',
      borrower: { connect: { id: acmeBorrower.id } },
      agent: { connect: { id: jpMorgan.id } },
      status: 'ACTIVE',
      effectiveDate: new Date('2023-01-01'),
      maturityDate: new Date('2028-01-01'),
      totalAmount: 250000000,
      currency: 'USD',
      description: 'Revolving credit facility for general corporate purposes',
      facilities: {
        create: {
          facilityName: 'Revolving Credit Facility',
          facilityType: 'REVOLVING',
          status: 'ACTIVE',
          commitmentAmount: 250000000,
          currency: 'USD',
          startDate: new Date('2023-01-01'),
          maturityDate: new Date('2028-01-01'),
          interestType: 'FLOATING',
          baseRate: 'SOFR',
          margin: 2.25,
          description: 'Senior secured revolving credit facility',
        },
      },
    },
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