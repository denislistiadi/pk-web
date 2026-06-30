import type {
  Kecamatan, Desa, Paslon,
  CocokkanRequest, CocokkanResponse, CompareResponse,
} from "./types"

const BASE = "/api"

class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const err = body?.error
    const message = err?.message ?? `HTTP ${res.status}`
    const code = err?.code ?? "UNKNOWN_ERROR"
    throw new ApiError(code, message, res.status)
  }

  return body?.data as T
}

export function getKecamatan(): Promise<Kecamatan[]> {
  return fetchJson<Kecamatan[]>(`${BASE}/kecamatan`)
}

export function getDesa(kecamatan_id?: number): Promise<Desa[]> {
  const params = kecamatan_id ? `?kecamatan_id=${kecamatan_id}` : ""
  return fetchJson<Desa[]>(`${BASE}/desa${params}`)
}

export function getDesaById(id: number): Promise<Desa & { paslon: Paslon[] }> {
  return fetchJson(`${BASE}/desa/${id}`)
}

export function getPaslon(id: number): Promise<Paslon> {
  return fetchJson<Paslon>(`${BASE}/paslon/${id}`)
}

export function comparePaslon(ids: number[]): Promise<CompareResponse> {
  return fetchJson<CompareResponse>(`${BASE}/paslon/compare?ids=${ids.join(",")}`)
}

export function cocokkan(req: CocokkanRequest): Promise<CocokkanResponse> {
  return fetchJson<CocokkanResponse>(`${BASE}/cocokkan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })
}

export { ApiError }
