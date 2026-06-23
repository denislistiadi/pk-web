export interface Kecamatan {
  id: number
  nama: string
}

export interface Desa {
  id: number
  nama: string
  kecamatan_id: number
  kecamatan?: string
  paslon_count?: number
}

export interface Paslon {
  id: number
  desa_id: number
  nomor_urut: number
  nama: string
  visi: string
  misi: string[]
  pendidikan: string
  umur: number
  foto_url?: string
}

export interface CocokkanRequest {
  desa_id: number
  visi_user: string
  misi_user: number[]
  pendidikan_min: string
  umur_min: number
  umur_max: number
}

export interface CocokkanResult {
  paslon_id: number
  nama: string
  nomor_urut: number
  skor_visi: number
  skor_misi: number
  skor_pendidikan: number
  skor_umur: number
  skor_total: number
}

export interface CocokkanResponse {
  desa: string
  results: CocokkanResult[]
  user_input: {
    visi: string
    misi_count: number
    pendidikan_min: string
    umur_min: number
    umur_max: number
  }
}

export interface CompareResponse {
  desa: string
  paslon: Paslon[]
}
