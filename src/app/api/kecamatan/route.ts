import { NextResponse } from "next/server"
import { getKecamatan } from "@/lib/data"

export async function GET() {
  const data = getKecamatan()
  return NextResponse.json(data)
}
