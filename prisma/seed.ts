import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data in correct dependency order
  await prisma.tradeComment.deleteMany()
  await prisma.tradeHistoricalBalance.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.servicingAssignment.deleteMany()
  await prisma.servicingTeamMember.deleteMany()
  await prisma.servicingRole.deleteMany()
  await prisma.servicingActivity.deleteMany()
  await prisma.repaymentSchedule.deleteMany()
  await prisma.loanPosition.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.facilityPosition.deleteMany()
  await prisma.facilitySublimit.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.creditAgreement.deleteMany()
  await prisma.lender.deleteMany()
  await prisma.borrowerAuditLog.deleteMany()
  await prisma.borrowerRequiredDocument.deleteMany()
  await prisma.borrowerCovenant.deleteMany()
  await prisma.borrowerFinancialStatement.deleteMany()
  await prisma.borrower.deleteMany()
  await prisma.entityAddress.deleteMany()
  await prisma.entityContact.deleteMany()
  await prisma.entity.deleteMany()
  await prisma.counterpartyAddress.deleteMany()
  await prisma.counterpartyContact.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.counterpartyType.deleteMany()
  await prisma.entityType.deleteMany()

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
      commitmentAmount: 50000000,
      availableAmount: 50000000,
      startDate: new Date(),
      maturityDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
      interestType: 'FLOATING',
      baseRate: 'SOFR',
      margin: 2.5,
      status: 'ACTIVE'
    }
  })

  // Create servicing activities
  const now = new Date()
  await prisma.servicingActivity.createMany({
    data: [
      {
        facilityId: facility.id,
        activityType: 'INTEREST_PAYMENT',
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        amount: 125000, // Example interest amount
        description: 'Monthly interest payment',
        status: 'PENDING'
      },
      {
        facilityId: facility.id,
        activityType: 'PRINCIPAL_PAYMENT',
        dueDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        amount: 1250000, // Example principal payment
        description: 'Quarterly principal amortization',
        status: 'PENDING'
      },
      {
        facilityId: facility.id,
        activityType: 'INTEREST_PAYMENT',
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        amount: 125000,
        description: 'Monthly interest payment',
        status: 'COMPLETED',
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
        completedBy: 'system'
      }
    ]
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

  // Create additional trades
  const tradeDates = [
    new Date('2023-12-01'),
    new Date('2023-12-05'),
    new Date('2023-12-08'),
    new Date('2023-12-12'),
    new Date('2023-12-15'),
    new Date('2023-12-18'),
    new Date('2023-12-21'),
    new Date('2023-12-26'),
    new Date('2023-12-28'),
    new Date('2024-01-02')
  ]

  // Create trades
  const additionalTrades = await Promise.all(
    tradeDates.map(async (tradeDate) => {
      const trade = await prisma.trade.create({
        data: {
          facilityId: facility.id,
          counterpartyId: counterparty.id,
          tradeDate,
          settlementDate: new Date(tradeDate.getTime() + 2 * 24 * 60 * 60 * 1000), // T+2 settlement
          status: 'COMPLETED',
          amount: Math.floor(Math.random() * 1000000) + 500000, // Random amount between 500k and 1.5M
          price: 95 + Math.random() * 10 // Random price between 95 and 105
        }
      })

      // Add trade comment
      await prisma.tradeComment.create({
        data: {
          tradeId: trade.id,
          comment: `Trade executed at ${trade.price.toFixed(2)}`,
          createdAt: tradeDate
        }
      })

      // Add historical balance
      await prisma.tradeHistoricalBalance.create({
        data: {
          tradeId: trade.id,
          date: trade.settlementDate,
          balance: trade.amount,
          createdAt: trade.settlementDate
        }
      })

      return trade
    })
  )

  console.log(`Created ${additionalTrades.length} additional trades`)

  // Create servicing roles
  const roles = await Promise.all([
    prisma.servicingRole.create({
      data: {
        name: 'Loan Administrator',
        description: 'Manages loan servicing activities and team assignments',
        permissions: JSON.stringify(['MANAGE_TEAM', 'MANAGE_ACTIVITIES', 'MANAGE_ASSIGNMENTS'])
      }
    }),
    prisma.servicingRole.create({
      data: {
        name: 'Portfolio Manager',
        description: 'Oversees loan portfolio and risk management',
        permissions: JSON.stringify(['VIEW_PORTFOLIO', 'MANAGE_ACTIVITIES'])
      }
    }),
    prisma.servicingRole.create({
      data: {
        name: 'Servicing Specialist',
        description: 'Handles day-to-day servicing activities',
        permissions: JSON.stringify(['VIEW_ACTIVITIES', 'UPDATE_ACTIVITIES'])
      }
    })
  ])

  // Create team members
  const teamMembers = await Promise.all([
    prisma.servicingTeamMember.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        roleId: roles[0].id, // Loan Administrator
        status: 'ACTIVE'
      }
    }),
    prisma.servicingTeamMember.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        roleId: roles[1].id, // Portfolio Manager
        status: 'ACTIVE'
      }
    }),
    prisma.servicingTeamMember.create({
      data: {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        roleId: roles[2].id, // Servicing Specialist
        status: 'ACTIVE'
      }
    })
  ])

  // Get all facilities for assignments
  const allFacilities = await prisma.facility.findMany({
    take: 2
  })

  if (allFacilities.length >= 2) {
    // Create servicing assignments
    await Promise.all([
      prisma.servicingAssignment.create({
        data: {
          teamMemberId: teamMembers[0].id,
          facilityId: allFacilities[0].id,
          assignmentType: 'PRIMARY_AGENT',
          startDate: new Date(),
          status: 'ACTIVE'
        }
      }),
      prisma.servicingAssignment.create({
        data: {
          teamMemberId: teamMembers[1].id,
          facilityId: allFacilities[0].id,
          assignmentType: 'BACKUP_AGENT',
          startDate: new Date(),
          status: 'ACTIVE'
        }
      }),
      prisma.servicingAssignment.create({
        data: {
          teamMemberId: teamMembers[2].id,
          facilityId: allFacilities[1].id,
          assignmentType: 'PRIMARY_AGENT',
          startDate: new Date(),
          status: 'ACTIVE'
        }
      })
    ])
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 