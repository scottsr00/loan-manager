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

  // Create trades
  const startDate = new Date('2023-12-01')
  const endDate = new Date('2024-01-31')
  const dateRange = endDate.getTime() - startDate.getTime()

  const trades = await Promise.all(
    Array.from({ length: 1000 }, async (_, i) => {
      // Generate trade date between start and end dates
      const tradeDate = new Date(startDate.getTime() + Math.random() * dateRange)
      
      // Settlement date is T+2
      const settlementDate = new Date(tradeDate)
      settlementDate.setDate(tradeDate.getDate() + 2)

      // Generate amount between $500k and $5M with more realistic distribution
      const amount = Math.floor((500000 + Math.random() * 4500000) * 100) / 100

      // Generate price between 95 and 105 with decimal points
      const price = 95 + (Math.random() * 10)
      const roundedPrice = Math.round(price * 100) / 100

      const trade = await prisma.trade.create({
        data: {
          tradeDate,
          settlementDate,
          amount,
          price: roundedPrice,
          status: Math.random() > 0.1 ? 'SETTLED' : 'PENDING', // 90% settled, 10% pending
          counterpartyId: counterparty.id,
          facilityId: facility.id,
          comments: {
            create: {
              comment: `Trade ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} at ${roundedPrice}%`,
              createdAt: tradeDate
            }
          },
          historicalBalances: {
            create: {
              balance: amount,
              date: settlementDate,
              createdAt: settlementDate
            }
          }
        }
      })

      // Log progress every 100 trades
      if ((i + 1) % 100 === 0) {
        console.log(`Created ${i + 1} trades`)
      }

      return trade
    })
  )

  console.log(`Created ${trades.length} trades`)

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

  // Create some sample transaction history records
  console.log('Creating sample transaction history...')
  
  const facilities = await prisma.facility.findMany({
    include: {
      creditAgreement: true,
      loans: {
        take: 1
      }
    }
  })

  for (const facility of facilities) {
    // Sample paydown transaction
    await prisma.transactionHistory.create({
      data: {
        eventType: 'PAYDOWN',
        facilityId: facility.id,
        creditAgreementId: facility.creditAgreementId,
        loanId: facility.loans[0]?.id,
        balanceChange: -50000,
        description: 'Scheduled principal payment',
        effectiveDate: new Date(),
        processedBy: 'System'
      }
    })

    // Sample rate reset transaction
    await prisma.transactionHistory.create({
      data: {
        eventType: 'RATE_RESET',
        facilityId: facility.id,
        creditAgreementId: facility.creditAgreementId,
        description: 'Quarterly rate reset - SOFR + 2.50%',
        effectiveDate: new Date(),
        processedBy: 'System'
      }
    })

    // Sample commitment change transaction
    await prisma.transactionHistory.create({
      data: {
        eventType: 'COMMITMENT_CHANGE',
        facilityId: facility.id,
        creditAgreementId: facility.creditAgreementId,
        balanceChange: 1000000,
        description: 'Facility commitment increase',
        effectiveDate: new Date(),
        processedBy: 'System'
      }
    })
  }

  console.log('Seeding completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 