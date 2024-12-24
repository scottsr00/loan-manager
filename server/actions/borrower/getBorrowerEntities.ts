'use server'

import { prisma } from '@/lib/prisma'

export async function getBorrowerEntities() {
  const entities = await prisma.entity.findMany({
    where: {
      borrower: null // Only get entities that aren't already borrowers
    },
    select: {
      id: true,
      legalName: true
    },
    orderBy: {
      legalName: 'asc'
    }
  })

  return entities
} 