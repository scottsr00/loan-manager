import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.borrower.delete({
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