import { success, badRequest, internal } from "@/lib/response"
import { getPaslonByIds } from "@/lib/data"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const idsStr = searchParams.get("ids") || ""
    const ids = idsStr
      .split(",")
      .map(Number)
      .filter(n => !isNaN(n) && n > 0)

    if (ids.length < 2) {
      return badRequest("Minimal 2 ID calon diperlukan (contoh: ?ids=12,13)")
    }
    if (ids.length > 5) {
      return badRequest("Maksimal 5 calon dapat dibandingkan")
    }

    const paslon = await getPaslonByIds(ids)
    if (paslon.length < 2) {
      return badRequest("Calon yang dipilih tidak ditemukan")
    }

    return success({
      desa: paslon[0].desa_nama,
      paslon,
    })
  } catch (e) {
    console.error("GET /api/paslon/compare:", e)
    return internal()
  }
}
