import { createClient } from "@libsql/client"
import type { Row } from "@libsql/client"

let _client: ReturnType<typeof createClient> | null = null

function db() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DB_URL!,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    })
  }
  return _client
}

function row(r: Row) {
  return r as Record<string, unknown>
}

export async function getKecamatan() {
  const rs = await db().execute("SELECT id, nama FROM kecamatan ORDER BY nama")
  return rs.rows.map(r => ({
    id: Number(r.id),
    nama: String(r.nama),
  }))
}

export async function getDesa(kecamatanId?: number) {
  if (kecamatanId != null) {
    const rs = await db().execute({
      sql: `SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan,
               (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) AS paslon_count
            FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id
            WHERE d.kecamatan_id = ? ORDER BY k.nama, d.nama`,
      args: [kecamatanId],
    })
    return rs.rows.map(r => ({
      id: Number(r.id),
      nama: String(r.nama),
      kecamatan_id: Number(row(r).kecamatan_id),
      kecamatan: String(r.kecamatan),
      paslon_count: Number(row(r).paslon_count),
    }))
  }
  const rs = await db().execute(`SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan,
    (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) AS paslon_count
    FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id ORDER BY k.nama, d.nama`)
  return rs.rows.map(r => ({
    id: Number(r.id),
    nama: String(r.nama),
    kecamatan_id: Number(row(r).kecamatan_id),
    kecamatan: String(r.kecamatan),
    paslon_count: Number(row(r).paslon_count),
  }))
}

export async function getDesaById(desaId: number) {
  const rs = await db().execute({
    sql: `SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan
          FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id WHERE d.id = ?`,
    args: [desaId],
  })
  if (!rs.rows.length) return null
  const d = row(rs.rows[0])
  const prs = await db().execute({
    sql: "SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url FROM paslon WHERE desa_id = ? ORDER BY nomor_urut",
    args: [desaId],
  })
  return {
    id: Number(d.id),
    nama: String(d.nama),
    kecamatan_id: Number(d.kecamatan_id),
    kecamatan: String(d.kecamatan),
    paslon: prs.rows.map(r => ({
      id: Number(r.id),
      desa_id: Number(row(r).desa_id),
      nomor_urut: Number(row(r).nomor_urut),
      nama: String(r.nama),
      visi: String(r.visi),
      misi: JSON.parse(String(r.misi_json)) as string[],
      pendidikan: String(r.pendidikan),
      umur: Number(row(r).umur),
      foto_url: String(row(r).foto_url ?? "") || undefined,
    })),
  }
}

export async function getPaslon(paslonId: number) {
  const rs = await db().execute({
    sql: `SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json,
               p.pendidikan, p.umur, p.foto_url, d.nama AS desa_nama
          FROM paslon p JOIN desa d ON d.id = p.desa_id WHERE p.id = ?`,
    args: [paslonId],
  })
  if (!rs.rows.length) return null
  const r = rs.rows[0]
  return {
    id: Number(r.id),
    desa_id: Number(row(r).desa_id),
    nomor_urut: Number(row(r).nomor_urut),
    nama: String(r.nama),
    visi: String(r.visi),
    misi: JSON.parse(String(row(r).misi_json)) as string[],
    pendidikan: String(r.pendidikan),
    umur: Number(row(r).umur),
    foto_url: String(row(r).foto_url ?? "") || undefined,
    desa_nama: String(r.desa_nama),
  }
}

export async function getPaslonByIds(ids: number[]) {
  if (!ids.length) return []
  const ph = ids.map(() => "?").join(",")
  const rs = await db().execute({
    sql: `SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json,
                 p.pendidikan, p.umur, p.foto_url, d.nama AS desa_nama
          FROM paslon p JOIN desa d ON d.id = p.desa_id
          WHERE p.id IN (${ph}) ORDER BY p.nomor_urut`,
    args: ids,
  })
  return rs.rows.map(r => ({
    id: Number(r.id),
    desa_id: Number(row(r).desa_id),
    nomor_urut: Number(row(r).nomor_urut),
    nama: String(r.nama),
    visi: String(r.visi),
    misi: JSON.parse(String(row(r).misi_json)) as string[],
    pendidikan: String(r.pendidikan),
    umur: Number(row(r).umur),
    foto_url: String(row(r).foto_url ?? "") || undefined,
    desa_nama: String(r.desa_nama),
  }))
}

export interface PaslonWithTf {
  id: number; desa_id: number; nomor_urut: number; nama: string
  visi: string; misi: string[]; pendidikan: string; umur: number
  tf: Record<string, number>
}

export async function getPaslonByDesaId(desaId: number): Promise<PaslonWithTf[]> {
  const rs = await db().execute({
    sql: "SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, tf_json FROM paslon WHERE desa_id = ? ORDER BY nomor_urut",
    args: [desaId],
  })
  return rs.rows.map(r => ({
    id: Number(r.id),
    desa_id: Number(row(r).desa_id),
    nomor_urut: Number(row(r).nomor_urut),
    nama: String(r.nama),
    visi: String(r.visi),
    misi: JSON.parse(String(row(r).misi_json)) as string[],
    pendidikan: String(r.pendidikan),
    umur: Number(row(r).umur),
    tf: JSON.parse(String(row(r).tf_json)) as Record<string, number>,
  }))
}
