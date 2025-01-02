'use server'

import { prisma } from '@/lib/prisma'
import { type Lender } from '@prisma/client'

interface LenderWithEntity extends Lender {
  entity: {
    id: string
    legalName: string
    dba: string | null
  }
}

export async function getLenders() {
  try {
    const lenders = await prisma.lender.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        entity: true
      },
      orderBy: {
        entity: {
          legalName: 'asc'
        }
      }
    })

    return lenders
  } catch (error) {
    console.error('Error in getLenders:', error)
    return []
  }
} 