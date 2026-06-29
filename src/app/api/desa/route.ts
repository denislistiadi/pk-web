import { NextRequest, NextResponse } from "next/server"
import { getDesa } from "@/lib/data"

export async function GET(req: NextRequest) {
  const kecamatanId = req.nextUrl.searchParams.get("kecamatan_id")
  const kid = kecamatanId ? Number(kecamatanId) : undefined
  const data = getDesa(kid)
  return NextResponse.json(data)
}
