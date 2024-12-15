import { NextResponse } from 'next/server'
import { getEntities } from '@/app/actions/getEntities'

export async function GET() {
  try {
    const result = await getEntities()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in entities API route:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }
} 