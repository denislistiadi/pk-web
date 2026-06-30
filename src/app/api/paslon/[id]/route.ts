import { success, notFound, badRequest, internal } from "@/lib/response"
import { getPaslon } from "@/lib/data"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const paslonId = Number(id)
    if (!Number.isInteger(paslonId) || paslonId < 1) {
      return badRequest("ID calon harus berupa angka positif")
    }
    const data = await getPaslon(paslonId)
    if (!data) return notFound("Calon tidak ditemukan")
    return success(data)
  } catch (e) {
    console.error("GET /api/paslon/[id]:", e)
    return internal()
  }
}
