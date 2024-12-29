import { PrismaClient } from '@prisma/client'

// This is needed to prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaClient = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient
}

export function getDatabaseProvider(): string {
  const provider = process.env.DATABASE_PROVIDER
  if (!provider) {
    throw new Error('DATABASE_PROVIDER environment variable is not set')
  }
  
  const supportedProviders = ['sqlite', 'postgresql', 'mysql', 'sqlserver']
  if (!supportedProviders.includes(provider)) {
    throw new Error(`Unsupported database provider: ${provider}. Must be one of: ${supportedProviders.join(', ')}`)
  }
  
  return provider
}

export const prisma = prismaClient 