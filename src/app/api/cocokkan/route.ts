import { NextRequest, NextResponse } from "next/server"
import { cocokkan } from "@/lib/matching"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { desa_id, visi_user, misi_user, pendidikan_min, umur_min, umur_max } = body

  if (!visi_user?.trim()) {
    return NextResponse.json({ error: "Visi wajib diisi" }, { status: 400 })
  }

  try {
    const result = cocokkan({
      desa_id: Number(desa_id),
      visi_user: visi_user.trim(),
      misi_user: misi_user ?? [],
      pendidikan_min: pendidikan_min ?? "SD",
      umur_min: Number(umur_min ?? 25),
      umur_max: Number(umur_max ?? 60),
    })
    return NextResponse.json(result)
  } catch (e: unknown) {
    const err = e as Error & { status?: number }
    return NextResponse.json(
      { error: err.message },
      { status: err.status ?? 500 }
    )
  }
}
