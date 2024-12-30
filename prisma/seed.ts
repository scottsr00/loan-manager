const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function generateCompanyName(index: number, type: string): string {
  const prefixes = ['Global', 'Advanced', 'Premier', 'Elite', 'Strategic', 'Dynamic', 'Innovative', 'Pacific', 'Atlantic', 'United']
  const suffixes = ['Solutions', 'Partners', 'Group', 'Corporation', 'Associates', 'International', 'Ventures', 'Holdings', 'Capital', 'Enterprises']
  
  const prefix = prefixes[index % prefixes.length]
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length]
  return `${prefix} ${type} ${suffix}`
}

function generateAddress(isPrimary: boolean = false) {
  const types = ['LEGAL', 'MAILING', 'PHYSICAL']
  const cities = ['New York', 'London', 'Tokyo', 'Singapore', 'Hong Kong', 'Dubai', 'Sydney', 'Toronto']
  const states = ['NY', 'CA', 'TX', 'FL', 'IL', null]
  const countries = ['USA', 'UK', 'Japan', 'Singapore', 'China', 'UAE', 'Australia', 'Canada']

  const cityIndex = Math.floor(Math.random() * cities.length)

  return {
    type: types[Math.floor(Math.random() * types.length)],
    street1: `${Math.floor(Math.random() * 999) + 1} Main St`,
    street2: Math.random() > 0.7 ? `Suite ${Math.floor(Math.random() * 100) + 1}` : null,
    city: cities[cityIndex],
    state: states[cityIndex],
    postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: countries[cityIndex],
    isPrimary,
  }
}

function generateContact(isPrimary: boolean = false) {
  const types = ['PRIMARY', 'BILLING', 'LEGAL', 'TECHNICAL']
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Emily']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  const titles = ['CEO', 'CFO', 'CTO', 'Director', 'Manager', null]

  return {
    type: types[Math.floor(Math.random() * types.length)],
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    email: Math.random() > 0.2 ? `contact${Math.floor(Math.random() * 100)}@example.com` : null,
    phone: Math.random() > 0.2 ? `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}` : null,
    isPrimary,
  }
}

async function main() {
  // First, clear existing data
  await prisma.trade.deleteMany()
  await prisma.counterpartyContact.deleteMany()
  await prisma.counterpartyAddress.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.counterpartyType.deleteMany()
  await prisma.facilityPosition.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.creditAgreement.deleteMany()
  await prisma.lender.deleteMany()
  await prisma.borrower.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.address.deleteMany()
  await prisma.entity.deleteMany()

  // Create counterparty types
  const counterpartyTypes = [
    { name: 'Bank', description: 'Financial institution' },
    { name: 'Insurance', description: 'Insurance provider' },
    { name: 'Investment', description: 'Investment management company' },
    { name: 'Corporate', description: 'Non-financial corporation' },
    { name: 'Government', description: 'Government entity' },
    { name: 'Non-Profit', description: 'Non-profit organization' },
  ]

  const createdTypes = []
  for (const type of counterpartyTypes) {
    const created = await prisma.counterpartyType.create({
      data: type
    })
    createdTypes.push(created)
  }

  // Create 100 counterparties with addresses and contacts
  for (let i = 0; i < 100; i++) {
    const typeIndex = i % createdTypes.length
    const type = createdTypes[typeIndex]
    const status = i % 5 === 0 ? 'INACTIVE' : i % 7 === 0 ? 'PENDING' : 'ACTIVE'

    await prisma.counterparty.create({
      data: {
        name: generateCompanyName(i, type.name),
        typeId: type.id,
        status,
        addresses: {
          create: [
            generateAddress(true), // Primary address
            ...(Math.random() > 0.5 ? [generateAddress()] : []), // 50% chance of second address
          ],
        },
        contacts: {
          create: [
            generateContact(true), // Primary contact
            ...(Math.random() > 0.5 ? [generateContact()] : []), // 50% chance of second contact
          ],
        },
      },
    })
  }

  // Create servicing roles
  const roles = [
    {
      name: 'Admin',
      description: 'Full system access',
      permissions: JSON.stringify(['MANAGE_TEAM', 'MANAGE_ROLES', 'MANAGE_ASSIGNMENTS', 'VIEW_ALL'])
    },
    {
      name: 'Manager',
      description: 'Team and assignment management',
      permissions: JSON.stringify(['MANAGE_ASSIGNMENTS', 'VIEW_ALL'])
    },
    {
      name: 'Agent',
      description: 'Regular team member',
      permissions: JSON.stringify(['VIEW_ASSIGNMENTS'])
    }
  ]

  for (const role of roles) {
    await prisma.servicingRole.upsert({
      where: { name: role.name },
      update: role,
      create: role
    })
  }

  // Create borrower
  const borrower = await prisma.borrower.create({
    data: {
      name: 'Test Company Inc.',
      taxId: 'TAX123',
      countryOfIncorporation: 'US',
      industrySegment: 'Technology',
      businessType: 'Corporation',
      creditRating: 'BBB',
      ratingAgency: 'S&P',
      riskRating: 'Medium',
      onboardingStatus: 'COMPLETED',
      kycStatus: 'COMPLETED'
    }
  })

  const lenderEntity = await prisma.entity.create({
    data: {
      legalName: 'Bank of Test',
      dba: 'Test Bank',
      registrationNumber: 'BANK123',
      taxId: 'BANK456',
      countryOfIncorporation: 'US',
      status: 'ACTIVE',
      isAgent: true,
      addresses: {
        create: [generateAddress(true)]
      },
      contacts: {
        create: [generateContact(true)]
      }
    }
  })

  const lender = await prisma.lender.create({
    data: {
      entityId: lenderEntity.id,
      status: 'ACTIVE'
    }
  })

  // Create credit agreement with facilities and positions
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
    }
  })

  // Get the created facilities
  const facilities = await prisma.facility.findMany({
    where: {
      creditAgreementId: creditAgreement.id
    }
  })

  // Create loans for each facility
  for (const facility of facilities) {
    const loanAmount = facility.facilityType === 'TERM_LOAN' ? 3000000 : 2000000
    
    const loan = await prisma.loan.create({
      data: {
        facilityId: facility.id,
        amount: loanAmount,
        outstandingAmount: loanAmount,
        currency: 'USD',
        status: 'ACTIVE',
        interestPeriod: '1M',
        drawDate: new Date(),
        baseRate: 4.5,
        effectiveRate: 7.0,
      }
    })

    // Create a drawdown transaction
    await prisma.transactionHistory.create({
      data: {
        creditAgreementId: creditAgreement.id,
        loanId: loan.id,
        activityType: 'DRAWDOWN',
        amount: loanAmount,
        currency: 'USD',
        status: 'COMPLETED',
        description: `Initial drawdown for ${facility.facilityName}`,
        effectiveDate: new Date(),
        processedBy: 'SYSTEM'
      }
    })
  }

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