import { computeTf, cosineSimilarity, jaccardSimilarity, skorPendidikan, skorUmur } from "./tfidf"
import { buatSummary } from "./summary"
import { getPaslonByDesaId } from "./data"

export interface CocokkanRequest {
  desa_id: number
  visi_user: string
  misi_user: number[]
  pendidikan_min: string
  umur_min: number
  umur_max: number
}

export interface CocokkanResult {
  paslon_id: number; nama: string; nomor_urut: number
  skor_visi: number; skor_misi: number
  skor_pendidikan: number; skor_umur: number
  skor_total: number; summary?: string
}

export function cocokkan(
  desaNama: string,
  req: CocokkanRequest
): {
  desa: string; results: CocokkanResult[];
  user_input: { visi: string; misi_count: number; pendidikan_min: string; umur_min: number; umur_max: number }
} {
  const { visi_user, misi_user, pendidikan_min, umur_min, umur_max } = req

  const paslon_list = getPaslonByDesaId(req.desa_id)
  if (!paslon_list.length) {
    return { desa: desaNama, results: [], user_input: { visi: visi_user, misi_count: misi_user.length, pendidikan_min, umur_min, umur_max } }
  }

  const all_misi: string[] = []
  for (const p of paslon_list) {
    for (const m of p.misi) {
      if (!all_misi.includes(m)) all_misi.push(m)
    }
  }
  const user_misi_set = new Set(misi_user.map(i => all_misi[i]).filter(Boolean))

  const user_tf = computeTf(visi_user)
  const all_tfs = [...paslon_list.map(p => p.tf), user_tf]
  const n = all_tfs.length
  const df: Record<string, number> = {}
  for (const tf of all_tfs) {
    for (const w in tf) df[w] = (df[w] || 0) + 1
  }
  const idf: Record<string, number> = {}
  for (const [w, c] of Object.entries(df)) idf[w] = Math.log(n / (1 + c)) + 1

  const uv: Record<string, number> = {}
  for (const [w, v] of Object.entries(user_tf)) uv[w] = v * (idf[w] || 0.01)

  const results: CocokkanResult[] = []
  for (const p of paslon_list) {
    const pv: Record<string, number> = {}
    for (const [w, v] of Object.entries(p.tf)) pv[w] = v * (idf[w] || 0.01)
    const sv = cosineSimilarity(uv, pv) * 100
    const sm = jaccardSimilarity(user_misi_set, new Set(p.misi)) * 100
    const sp = skorPendidikan(p.pendidikan, pendidikan_min)
    const su = skorUmur(p.umur, umur_min, umur_max)
    results.push({
      paslon_id: p.id, nama: p.nama, nomor_urut: p.nomor_urut,
      skor_visi: Number(sv.toFixed(1)), skor_misi: Number(sm.toFixed(1)),
      skor_pendidikan: Number(sp.toFixed(1)), skor_umur: Number(su.toFixed(1)),
      skor_total: Number((sv * 0.35 + sm * 0.30 + sp * 0.15 + su * 0.20).toFixed(1)),
    })
  }
  results.sort((a, b) => b.skor_total - a.skor_total)

  const skor_list = results.map(r => r.skor_total)
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const p = paslon_list.find(x => x.id === r.paslon_id)!
    let selisih: number | null = null
    if (i === 0 && skor_list.length > 1) selisih = skor_list[0] - skor_list[1]
    else if (i > 0) selisih = skor_list[i - 1] - r.skor_total
    r.summary = buatSummary({
      nama: r.nama, nomor_urut: r.nomor_urut,
      skor_visi: r.skor_visi, skor_misi: r.skor_misi,
      skor_pendidikan: r.skor_pendidikan, skor_umur: r.skor_umur,
      skor_total: r.skor_total,
      visi_calon: p.visi, misi_calon: p.misi,
      pendidikan_calon: p.pendidikan, umur_calon: p.umur,
      misi_user_set: user_misi_set,
      pendidikan_min, umur_min, umur_max,
      ranking: i + 1, total_calon: results.length, selisih_atas: selisih,
    })
  }

  return {
    desa: desaNama,
    results,
    user_input: {
      visi: visi_user,
      misi_count: misi_user.length,
      pendidikan_min,
      umur_min,
      umur_max,
    },
  }
}
