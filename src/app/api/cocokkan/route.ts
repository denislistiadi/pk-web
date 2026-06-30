import { success, badRequest, notFound, internal } from "@/lib/response"
import { cocokkan } from "@/lib/matching"
import { getDesaById } from "@/lib/data"

const PENDIDIKAN_VALID = ["SD", "SMP", "SMA/SMK", "D1/D3", "S1/D4", "S2", "S3"]

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return badRequest("Request body harus berupa JSON")
    }

    const desaId = Number(body.desa_id)
    if (!Number.isInteger(desaId) || desaId < 1) {
      return badRequest("desa_id harus berupa angka positif")
    }

    const visiUser = (body.visi_user ?? "").trim()
    if (!visiUser) {
      return badRequest("Visi wajib diisi")
    }
    if (visiUser.length < 10) {
      return badRequest("Visi minimal 10 karakter")
    }
    if (visiUser.length > 500) {
      return badRequest("Visi maksimal 500 karakter")
    }

    const desa = await getDesaById(desaId)
    if (!desa) {
      return notFound("Desa tidak ditemukan")
    }

    const pendidikanMin = body.pendidikan_min ?? "SD"
    if (!PENDIDIKAN_VALID.includes(pendidikanMin)) {
      return badRequest("Pendidikan minimal tidak valid", {
        valid: PENDIDIKAN_VALID,
      })
    }

    const umurMin = Number(body.umur_min ?? 25)
    const umurMax = Number(body.umur_max ?? 60)
    if (!Number.isInteger(umurMin) || umurMin < 17 || umurMin > 100) {
      return badRequest("umur_min harus antara 17-100")
    }
    if (!Number.isInteger(umurMax) || umurMax < 17 || umurMax > 100) {
      return badRequest("umur_max harus antara 17-100")
    }
    if (umurMin > umurMax) {
      return badRequest("umur_min tidak boleh lebih besar dari umur_max")
    }

    const misiUser: number[] = Array.isArray(body.misi_user) ? body.misi_user : []
    if (!misiUser.every((i) => typeof i === "number" && Number.isInteger(i) && i >= 0)) {
      return badRequest("misi_user harus berisi index angka")
    }
    if (misiUser.length > 10) {
      return badRequest("Maksimal 10 pilihan misi")
    }

    const result = await cocokkan(desa.nama, {
      desa_id: desaId,
      visi_user: visiUser,
      misi_user: misiUser,
      pendidikan_min: pendidikanMin,
      umur_min: umurMin,
      umur_max: umurMax,
    })

    return success(result)
  } catch (e) {
    console.error("POST /api/cocokkan:", e)
    return internal()
  }
}
