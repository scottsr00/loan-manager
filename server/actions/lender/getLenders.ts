'use server'

import { prisma } from '@/lib/prisma'
import { type Lender } from '@prisma/client'

interface LenderWithEntity extends Lender {
  entity: {
    id: string
    legalName: string
  }
}

export async function getLenders() {
  const lenders = await prisma.lender.findMany({
    include: {
      entity: {
        select: {
          id: true,
          legalName: true
        }
      }
    },
    orderBy: {
      entity: {
        legalName: 'asc'
      }
    }
  })

  return lenders.map((lender: LenderWithEntity) => ({
    id: lender.id,
    legalName: lender.entity.legalName
  }))
} 