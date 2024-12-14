import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const borrowers = await db.borrower.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(borrowers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch borrowers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const borrower = await db.borrower.create({
      data: {
        name: body.name,
        taxId: body.taxId,
        jurisdiction: body.jurisdiction,
        industry: body.industry,
      },
    })
    return NextResponse.json(borrower)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create borrower" }, { status: 500 })
  }
} 