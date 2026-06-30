import { success, internal } from "@/lib/response"
import { getKecamatan } from "@/lib/data"

export async function GET() {
  try {
    const data = getKecamatan()
    return success(data)
  } catch (e) {
    console.error("GET /api/kecamatan:", e)
    return internal()
  }
}
