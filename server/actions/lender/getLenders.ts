'use server'

import { prisma } from '@/lib/prisma'

export async function getLenders() {
  const lenders = await prisma.lender.findMany({
    select: {
      id: true,
      legalName: true
    },
    orderBy: {
      legalName: 'asc'
    }
  })

  return lenders
} 