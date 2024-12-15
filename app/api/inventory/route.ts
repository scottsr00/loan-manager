/* import { NextResponse } from 'next/server';
import { getInventory } from '@/app/actions/getInventory';

export async function GET() {
  try {
    const positions = await getInventory();
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json(
      { error: 'Error fetching inventory' },
      { status: 500 }
    );
  }
}  */