import { success, badRequest, internal } from "@/lib/response"
import { getDesa } from "@/lib/data"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const kecamatanId = searchParams.get("kecamatan_id")
    let kid: number | undefined
    if (kecamatanId) {
      kid = Number(kecamatanId)
      if (!Number.isInteger(kid) || kid < 1) {
        return badRequest("kecamatan_id harus berupa angka positif")
      }
    }
    const data = await getDesa(kid)
    return success(data)
  } catch (e) {
    console.error("GET /api/desa:", e)
    return internal()
  }
}
