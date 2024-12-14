import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.borrower.delete({
      where: {
        id: params.id,
      },
    })
    return NextResponse.json({ message: "Borrower deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete borrower" },
      { status: 500 }
    )
  }
} 