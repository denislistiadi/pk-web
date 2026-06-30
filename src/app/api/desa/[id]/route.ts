import { success, notFound, badRequest, internal } from "@/lib/response"
import { getDesaById } from "@/lib/data"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const desaId = Number(id)
    if (!Number.isInteger(desaId) || desaId < 1) {
      return badRequest("ID desa harus berupa angka positif")
    }
    const data = await getDesaById(desaId)
    if (!data) return notFound("Desa tidak ditemukan")
    return success(data)
  } catch (e) {
    console.error("GET /api/desa/[id]:", e)
    return internal()
  }
}
