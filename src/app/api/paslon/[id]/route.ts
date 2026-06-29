import { NextRequest, NextResponse } from "next/server"
import { getPaslon } from "@/lib/data"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = getPaslon(Number(id))
  if (!data) return NextResponse.json({ error: "Calon tidak ditemukan" }, { status: 404 })
  return NextResponse.json(data)
}
