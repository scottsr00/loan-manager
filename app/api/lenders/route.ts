import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/client'

export async function GET() {
  try {
    const lenders = await prisma.lender.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        entity: {
          select: {
            legalName: true
          }
        }
      }
    })

    return NextResponse.json(lenders)
  } catch (error) {
    console.error('Error fetching lenders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lenders' },
      { status: 500 }
    )
  }
} 