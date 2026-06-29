import Database from "better-sqlite3"
import path from "path"

interface KecamatanRow { id: number; nama: string }
interface DesaRow { id: number; nama: string; kecamatan_id: number; kecamatan: string; paslon_count: number }
interface PaslonRow {
  id: number; desa_id: number; nomor_urut: number; nama: string
  visi: string; misi_json: string; pendidikan: string; umur: number
  foto_url: string | null; tf_json: string; desa_nama?: string
}

const DB_PATH = path.join(process.cwd(), "src", "data", "pahamkades.db")

let _db: Database.Database | null = null

function db(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true })
  }
  return _db
}

export function getKecamatan() {
  return db().prepare("SELECT id, nama FROM kecamatan ORDER BY nama").all() as KecamatanRow[]
}

export function getDesa(kecamatanId?: number) {
  if (kecamatanId != null) {
    return db().prepare(`
      SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan,
             (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) AS paslon_count
      FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id
      WHERE d.kecamatan_id = ? ORDER BY k.nama, d.nama
    `).all(kecamatanId) as DesaRow[]
  }
  return db().prepare(`
    SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan,
           (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) AS paslon_count
    FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id
    ORDER BY k.nama, d.nama
  `).all() as DesaRow[]
}

export function getDesaById(desaId: number) {
  const row = db().prepare(`
    SELECT d.id, d.nama, d.kecamatan_id, k.nama AS kecamatan
    FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id WHERE d.id = ?
  `).get(desaId) as { id: number; nama: string; kecamatan_id: number; kecamatan: string } | undefined
  if (!row) return null
  const paslon = db().prepare(`
    SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url
    FROM paslon WHERE desa_id = ? ORDER BY nomor_urut
  `).all(desaId) as PaslonRow[]
  return {
    id: row.id,
    nama: row.nama,
    kecamatan_id: row.kecamatan_id,
    kecamatan: row.kecamatan,
    paslon: paslon.map(p => ({
      id: p.id,
      desa_id: p.desa_id,
      nomor_urut: p.nomor_urut,
      nama: p.nama,
      visi: p.visi,
      misi: JSON.parse(p.misi_json) as string[],
      pendidikan: p.pendidikan,
      umur: p.umur,
      foto_url: p.foto_url ?? undefined,
    })),
  }
}

export function getPaslon(paslonId: number) {
  const row = db().prepare(`
    SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json,
           p.pendidikan, p.umur, p.foto_url, d.nama AS desa_nama
    FROM paslon p JOIN desa d ON d.id = p.desa_id WHERE p.id = ?
  `).get(paslonId) as PaslonRow | undefined
  if (!row) return null
  return {
    id: row.id,
    desa_id: row.desa_id,
    nomor_urut: row.nomor_urut,
    nama: row.nama,
    visi: row.visi,
    misi: JSON.parse(row.misi_json) as string[],
    pendidikan: row.pendidikan,
    umur: row.umur,
    foto_url: row.foto_url ?? undefined,
    desa_nama: row.desa_nama ?? "",
  }
}

export function getPaslonByIds(ids: number[]) {
  if (!ids.length) return []
  const ph = ids.map(() => "?").join(",")
  const rows = db().prepare(`
    SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json,
           p.pendidikan, p.umur, p.foto_url, d.nama AS desa_nama
    FROM paslon p JOIN desa d ON d.id = p.desa_id
    WHERE p.id IN (${ph}) ORDER BY p.nomor_urut
  `).all(...ids) as PaslonRow[]
  return rows.map(row => ({
    id: row.id,
    desa_id: row.desa_id,
    nomor_urut: row.nomor_urut,
    nama: row.nama,
    visi: row.visi,
    misi: JSON.parse(row.misi_json) as string[],
    pendidikan: row.pendidikan,
    umur: row.umur,
    foto_url: row.foto_url ?? undefined,
    desa_nama: row.desa_nama ?? "",
  }))
}

export interface PaslonWithTf {
  id: number; desa_id: number; nomor_urut: number; nama: string
  visi: string; misi: string[]; pendidikan: string; umur: number
  tf: Record<string, number>
}

export function getPaslonByDesaId(desaId: number): PaslonWithTf[] {
  const rows = db().prepare(`
    SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, tf_json
    FROM paslon WHERE desa_id = ? ORDER BY nomor_urut
  `).all(desaId) as PaslonRow[]
  return rows.map(r => ({
    id: r.id,
    desa_id: r.desa_id,
    nomor_urut: r.nomor_urut,
    nama: r.nama,
    visi: r.visi,
    misi: JSON.parse(r.misi_json) as string[],
    pendidikan: r.pendidikan,
    umur: r.umur,
    tf: JSON.parse(r.tf_json) as Record<string, number>,
  }))
}
