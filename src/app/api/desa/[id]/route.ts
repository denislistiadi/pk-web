import { NextRequest, NextResponse } from "next/server"
import { getDesaById } from "@/lib/data"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = getDesaById(Number(id))
  if (!data) return NextResponse.json({ error: "Desa tidak ditemukan" }, { status: 404 })
  return NextResponse.json(data)
}
