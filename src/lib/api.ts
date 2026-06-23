import type {
  Kecamatan, Desa, Paslon,
  CocokkanRequest, CocokkanResponse, CompareResponse,
} from "./types"

const BASE = "/api"

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
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
