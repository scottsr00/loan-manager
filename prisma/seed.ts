import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.counterpartyDocument.deleteMany()
  await prisma.counterpartyContact.deleteMany()
  await prisma.counterpartyAddress.deleteMany()
  await prisma.counterparty.deleteMany()
  await prisma.counterpartyType.deleteMany()
  await prisma.entityRelationship.deleteMany()
  await prisma.entityDocument.deleteMany()
  await prisma.entityContact.deleteMany()
  await prisma.entityAddress.deleteMany()
  await prisma.entity.deleteMany()
  await prisma.entityType.deleteMany()

  // Create Entity Types
  const corporationType = await prisma.entityType.create({
    data: {
      name: 'Corporation',
      description: 'A legal entity that is separate and distinct from its owners'
    }
  })

  const llcType = await prisma.entityType.create({
    data: {
      name: 'LLC',
      description: 'Limited Liability Company - hybrid business structure'
    }
  })

  const partnershipType = await prisma.entityType.create({
    data: {
      name: 'Partnership',
      description: 'Business owned by two or more individuals'
    }
  })

  // Create Parent Company
  const acmeCorp = await prisma.entity.create({
    data: {
      legalName: 'Acme Corporation',
      dba: 'Acme Corp',
      registrationNumber: 'REG123456789',
      taxId: '12-3456789',
      entityTypeId: corporationType.id,
      status: 'ACTIVE',
      incorporationDate: new Date('2010-01-01'),
      fiscalYearEnd: '12-31',
      website: 'https://www.acmecorp.com',
      description: 'Global technology and innovation company',
      addresses: {
        create: [
          {
            type: 'REGISTERED',
            street1: '123 Main Street',
            street2: 'Suite 100',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'OFFICER',
            firstName: 'John',
            lastName: 'Smith',
            title: 'Chief Executive Officer',
            email: 'john.smith@acmecorp.com',
            phone: '+1-415-555-0100',
            mobile: '+1-415-555-0101',
            isPrimary: true
          }
        ]
      },
      documents: {
        create: [
          {
            type: 'INCORPORATION',
            title: 'Certificate of Incorporation',
            description: 'Official incorporation documents',
            fileUrl: 'https://storage.example.com/docs/acme_inc.pdf',
            fileType: 'application/pdf',
            validFrom: new Date('2010-01-01')
          }
        ]
      }
    }
  })

  // Create Subsidiary
  const acmeTech = await prisma.entity.create({
    data: {
      legalName: 'Acme Technology Solutions LLC',
      dba: 'Acme Tech',
      registrationNumber: 'REG987654321',
      taxId: '98-7654321',
      entityTypeId: llcType.id,
      status: 'ACTIVE',
      incorporationDate: new Date('2015-06-15'),
      fiscalYearEnd: '12-31',
      website: 'https://tech.acmecorp.com',
      description: 'Technology solutions provider',
      addresses: {
        create: [
          {
            type: 'PHYSICAL',
            street1: '456 Tech Boulevard',
            city: 'Austin',
            state: 'TX',
            postalCode: '78701',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'DIRECTOR',
            firstName: 'Sarah',
            lastName: 'Johnson',
            title: 'Managing Director',
            email: 'sarah.johnson@acmetech.com',
            phone: '+1-512-555-0200',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Create Partnership Entity
  const acmeVentures = await prisma.entity.create({
    data: {
      legalName: 'Acme Ventures LP',
      registrationNumber: 'REG456789123',
      taxId: '45-6789123',
      entityTypeId: partnershipType.id,
      status: 'ACTIVE',
      incorporationDate: new Date('2018-03-01'),
      fiscalYearEnd: '12-31',
      description: 'Investment arm of Acme Corporation',
      addresses: {
        create: [
          {
            type: 'REGISTERED',
            street1: '789 Venture Way',
            city: 'Boston',
            state: 'MA',
            postalCode: '02110',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'LEGAL_REPRESENTATIVE',
            firstName: 'Michael',
            lastName: 'Chen',
            title: 'General Partner',
            email: 'michael.chen@acmeventures.com',
            phone: '+1-617-555-0300',
            isPrimary: true
          }
        ]
      }
    }
  })

  // Create Entity Relationships
  await prisma.entityRelationship.createMany({
    data: [
      {
        fromEntityId: acmeCorp.id,
        toEntityId: acmeTech.id,
        type: 'SUBSIDIARY',
        ownership: 100,
        startDate: new Date('2015-06-15'),
        description: 'Wholly owned technology subsidiary'
      },
      {
        fromEntityId: acmeCorp.id,
        toEntityId: acmeVentures.id,
        type: 'SUBSIDIARY',
        ownership: 100,
        startDate: new Date('2018-03-01'),
        description: 'Investment subsidiary'
      }
    ]
  })

  // Create Counterparty Types
  const bankType = await prisma.counterpartyType.create({
    data: {
      name: 'Bank',
      description: 'Financial institution that accepts deposits and offers banking services'
    }
  })

  const brokerDealerType = await prisma.counterpartyType.create({
    data: {
      name: 'Broker-Dealer',
      description: 'Entity that trades securities for its own account or on behalf of its customers'
    }
  })

  const investmentManagerType = await prisma.counterpartyType.create({
    data: {
      name: 'Investment Manager',
      description: 'Entity that manages investment portfolios on behalf of clients'
    }
  })

  // Create Sample Counterparties
  const jpMorgan = await prisma.counterparty.create({
    data: {
      legalName: 'JPMorgan Chase Bank, N.A.',
      parentName: 'JPMorgan Chase & Co.',
      ultParentName: 'JPMorgan Chase & Co.',
      counterpartyTypeId: bankType.id,
      kycStatus: 'APPROVED',
      onboardingStatus: 'COMPLETED',
      registrationNumber: 'CHARTER-2137',
      taxId: '13-4994650',
      incorporationDate: new Date('1824-01-01'),
      website: 'https://www.jpmorgan.com',
      description: 'Global financial services firm and banking institution',
      addresses: {
        create: [
          {
            type: 'REGISTERED',
            street1: '383 Madison Avenue',
            city: 'New York',
            state: 'NY',
            postalCode: '10179',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'OFFICER',
            firstName: 'James',
            lastName: 'Dimon',
            title: 'Chief Executive Officer',
            email: 'jamie.dimon@jpmorgan.com',
            phone: '+1-212-555-1234',
            isPrimary: true
          }
        ]
      },
      documents: {
        create: [
          {
            type: 'KYC',
            title: 'KYC Documentation',
            description: 'Complete KYC package including ownership structure',
            fileUrl: 'https://storage.example.com/docs/jpm_kyc.pdf',
            fileType: 'application/pdf',
            validFrom: new Date('2023-01-01')
          }
        ]
      }
    }
  })

  const blackRock = await prisma.counterparty.create({
    data: {
      legalName: 'BlackRock Financial Management, Inc.',
      parentName: 'BlackRock, Inc.',
      ultParentName: 'BlackRock, Inc.',
      counterpartyTypeId: investmentManagerType.id,
      kycStatus: 'APPROVED',
      onboardingStatus: 'COMPLETED',
      registrationNumber: 'SEC-801-48433',
      taxId: '13-3806691',
      incorporationDate: new Date('1988-01-01'),
      website: 'https://www.blackrock.com',
      description: 'Global investment management corporation',
      addresses: {
        create: [
          {
            type: 'REGISTERED',
            street1: '55 East 52nd Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10055',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'OFFICER',
            firstName: 'Laurence',
            lastName: 'Fink',
            title: 'Chief Executive Officer',
            email: 'larry.fink@blackrock.com',
            phone: '+1-212-555-5678',
            isPrimary: true
          }
        ]
      }
    }
  })

  const goldmanSachs = await prisma.counterparty.create({
    data: {
      legalName: 'Goldman Sachs & Co. LLC',
      parentName: 'The Goldman Sachs Group, Inc.',
      ultParentName: 'The Goldman Sachs Group, Inc.',
      counterpartyTypeId: brokerDealerType.id,
      kycStatus: 'IN_PROGRESS',
      onboardingStatus: 'IN_PROGRESS',
      registrationNumber: 'SEC-801-15106',
      taxId: '13-5108880',
      incorporationDate: new Date('1869-01-01'),
      website: 'https://www.goldmansachs.com',
      description: 'Global investment banking, securities, and investment management firm',
      addresses: {
        create: [
          {
            type: 'REGISTERED',
            street1: '200 West Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10282',
            country: 'USA',
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            type: 'OFFICER',
            firstName: 'David',
            lastName: 'Solomon',
            title: 'Chief Executive Officer',
            email: 'david.solomon@gs.com',
            phone: '+1-212-555-9012',
            isPrimary: true
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