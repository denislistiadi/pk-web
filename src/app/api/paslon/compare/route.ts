import { NextRequest, NextResponse } from "next/server"
import { getPaslonByIds } from "@/lib/data"

export async function GET(req: NextRequest) {
  const idsStr = req.nextUrl.searchParams.get("ids") || ""
  const ids = idsStr.split(",").map(Number).filter(n => !isNaN(n) && n > 0)
  if (ids.length < 2) {
    return NextResponse.json({ error: "Minimal 2 calon" }, { status: 400 })
  }
  const paslon = getPaslonByIds(ids)
  return NextResponse.json({ desa: paslon[0]?.desa_nama ?? "", paslon })
}
