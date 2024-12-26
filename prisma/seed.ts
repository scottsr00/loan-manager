import { PrismaClient } from '@prisma/client'

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