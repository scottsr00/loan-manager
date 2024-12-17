import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data in reverse order of dependencies
  await prisma.tradeHistoricalBalance.deleteMany()
  await prisma.tradeComment.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.loanPosition.deleteMany()
  await prisma.repaymentSchedule.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.facilityPosition.deleteMany()
  await prisma.facilitySublimit.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.creditAgreement.deleteMany()
  await prisma.counterpartyContact.deleteMany()
  await prisma.counterpartyAddress.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.counterpartyType.deleteMany()
  await prisma.borrowerAuditLog.deleteMany()
  await prisma.borrowerRequiredDocument.deleteMany()
  await prisma.borrowerCovenant.deleteMany()
  await prisma.borrowerFinancialStatement.deleteMany()
  await prisma.borrower.deleteMany()
  await prisma.entityContact.deleteMany()
  await prisma.entityAddress.deleteMany()
  await prisma.entity.deleteMany()
  await prisma.entityType.deleteMany()
  await prisma.lender.deleteMany()

  // Create entity types
  const corporateType = await prisma.entityType.create({
    data: {
      name: 'CORPORATE',
      description: 'Corporate entities'
    }
  })

  // Create a sample entity
  const entity = await prisma.entity.create({
    data: {
      legalName: 'Sample Corporation',
      dba: 'SampleCorp',
      registrationNumber: 'REG123456',
      taxId: 'TAX987654',
      entityTypeId: corporateType.id,
      status: 'ACTIVE',
      incorporationDate: new Date('2010-01-01'),
      website: 'https://samplecorp.com',
      description: 'A sample corporation for testing',
      addresses: {
        create: [
          {
            type: 'LEGAL',
            street1: '123 Corporate Drive',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'PRIMARY',
            firstName: 'John',
            lastName: 'Doe',
            title: 'CEO',
            email: 'john.doe@samplecorp.com',
            phone: '+1-212-555-0100',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Create a borrower
  const borrower = await prisma.borrower.create({
    data: {
      entityId: entity.id,
      industrySegment: 'TECHNOLOGY',
      businessType: 'CORPORATE',
      status: 'ACTIVE',
      riskRating: 'BBB',
      creditRating: 'BBB+',
      ratingAgency: 'S&P',
      onboardingStatus: 'COMPLETED',
      kycStatus: 'COMPLETED',
      amlStatus: 'CLEARED',
      sanctionsStatus: 'CLEARED'
    }
  })

  // Create a financial statement
  await prisma.borrowerFinancialStatement.create({
    data: {
      borrowerId: borrower.id,
      statementType: 'ANNUAL',
      statementDate: new Date('2023-12-31'),
      fiscalYear: 2023,
      fiscalPeriod: 'ANNUAL',
      revenue: 100000000,
      ebitda: 15000000,
      netIncome: 10000000,
      totalAssets: 200000000,
      totalLiabilities: 100000000,
      currentAssets: 50000000,
      currentLiabilities: 25000000,
      cashFlow: 20000000,
      workingCapital: 25000000,
      status: 'VERIFIED'
    }
  })

  // Create a covenant
  await prisma.borrowerCovenant.create({
    data: {
      borrowerId: borrower.id,
      covenantType: 'FINANCIAL',
      name: 'Debt Service Coverage Ratio',
      description: 'Minimum DSCR of 1.2x',
      threshold: 1.2,
      frequency: 'QUARTERLY',
      startDate: new Date(),
      status: 'ACTIVE'
    }
  })

  // Create required documents
  await prisma.borrowerRequiredDocument.create({
    data: {
      borrowerId: borrower.id,
      documentType: 'FINANCIAL_STATEMENT',
      name: 'Annual Audited Financial Statements',
      description: 'Audited financial statements for fiscal year',
      frequency: 'ANNUAL',
      status: 'PENDING',
      dueDate: new Date('2024-03-31')
    }
  })

  // Create audit log
  await prisma.borrowerAuditLog.create({
    data: {
      borrowerId: borrower.id,
      action: 'CREATED',
      description: 'Borrower profile created',
      performedBy: 'SYSTEM',
      changes: JSON.stringify({ action: 'CREATE', details: 'Initial setup' })
    }
  })

  // Create a lender
  const lender = await prisma.lender.create({
    data: {
      name: 'Sample Bank',
      type: 'BANK',
      status: 'ACTIVE'
    }
  })

  // Create a credit agreement
  const creditAgreement = await prisma.creditAgreement.create({
    data: {
      agreementName: 'Sample Credit Facility',
      agreementNumber: 'CF-2023-001',
      borrowerId: borrower.id,
      lenderId: lender.id,
      status: 'ACTIVE',
      amount: 50000000,
      startDate: new Date(),
      maturityDate: new Date('2028-12-31'),
      interestRate: 5.5
    }
  })

  // Create a facility
  const facility = await prisma.facility.create({
    data: {
      facilityName: 'Term Loan A',
      facilityType: 'TERM_LOAN',
      creditAgreementId: creditAgreement.id,
      commitmentAmount: 30000000,
      availableAmount: 30000000,
      startDate: new Date(),
      maturityDate: new Date('2028-12-31'),
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 2.5,
      status: 'ACTIVE'
    }
  })

  // Create facility position
  await prisma.facilityPosition.create({
    data: {
      facilityId: facility.id,
      lenderId: lender.id,
      commitment: 30000000,
      share: 100,
      status: 'ACTIVE'
    }
  })

  // Create facility sublimit
  await prisma.facilitySublimit.create({
    data: {
      facilityId: facility.id,
      type: 'CURRENCY',
      amount: 10000000,
      currency: 'EUR',
      description: 'Euro sublimit'
    }
  })

  // Create a loan
  const loan = await prisma.loan.create({
    data: {
      facilityId: facility.id,
      drawdownNumber: 1,
      amount: 10000000,
      outstandingAmount: 10000000,
      status: 'ACTIVE',
      drawdownDate: new Date(),
      maturityDate: new Date('2024-12-31'),
      interestRate: 8.0,
      interestAccrued: 0
    }
  })

  // Create loan position
  await prisma.loanPosition.create({
    data: {
      loanId: loan.id,
      lenderId: lender.id,
      amount: 10000000,
      share: 100,
      status: 'ACTIVE'
    }
  })

  // Create repayment schedule
  await prisma.repaymentSchedule.create({
    data: {
      loanId: loan.id,
      paymentNumber: 1,
      dueDate: new Date('2024-03-31'),
      principalAmount: 2500000,
      interestAmount: 200000,
      status: 'PENDING'
    }
  })

  // Create counterparty type
  const counterpartyType = await prisma.counterpartyType.create({
    data: {
      name: 'BANK',
      description: 'Banking institutions'
    }
  })

  // Create a counterparty
  const counterparty = await prisma.counterparty.create({
    data: {
      legalName: 'Trading Bank Ltd',
      typeId: counterpartyType.id,
      status: 'ACTIVE'
    }
  })

  // Create a trade
  const trade = await prisma.trade.create({
    data: {
      facilityId: facility.id,
      counterpartyId: counterparty.id,
      tradeDate: new Date(),
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      amount: 5000000,
      price: 98.5
    }
  })

  // Create trade comment
  await prisma.tradeComment.create({
    data: {
      tradeId: trade.id,
      comment: 'Initial trade setup completed'
    }
  })

  // Create trade historical balance
  await prisma.tradeHistoricalBalance.create({
    data: {
      tradeId: trade.id,
      date: new Date(),
      balance: 5000000
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 