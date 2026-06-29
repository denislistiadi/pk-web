function pilih<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const PREAMBLES = [
  "Dari hasil analisis,", "Berdasarkan preferensi Anda,",
  "Kalau dilihat dari data yang ada,", "Menurut perhitungan kecocokan,",
  "Dari semua calon yang ada,", "Secara keseluruhan,", "Bila dilihat dari kriterianya,",
]

export function buatSummary(params: {
  nama: string; nomor_urut: number
  skor_visi: number; skor_misi: number
  skor_pendidikan: number; skor_umur: number
  skor_total: number
  visi_calon: string; misi_calon: string[]
  pendidikan_calon: string; umur_calon: number
  misi_user_set: Set<string>
  pendidikan_min: string; umur_min: number; umur_max: number
  ranking: number; total_calon: number; selisih_atas: number | null
}): string {
  const {
    nama, skor_visi, skor_misi, skor_pendidikan, skor_umur, skor_total,
    misi_calon, misi_user_set, pendidikan_calon, umur_calon,
    pendidikan_min, umur_min, umur_max, ranking, total_calon, selisih_atas,
  } = params

  const nd = nama.split(",")[0]?.split(" ")[0] ?? nama.split(" ")[0]
  const parts: string[] = [pilih(PREAMBLES)]

  if (skor_visi >= 70) {
    parts.push(pilih([
      `visi ${nd} (${skor_visi.toFixed(0)}%) cukup sejalan dengan gambaran Anda.`,
      `visi calon ini mirip dengan harapan Anda - skor ${skor_visi.toFixed(0)}%.`,
      `kesamaan visi cukup tinggi (${skor_visi.toFixed(0)}%), ${nd} punya arah yang sama dengan Anda.`,
    ]))
  } else if (skor_visi >= 35) {
    parts.push(pilih([
      `visi ${nd} cukup dekat (${skor_visi.toFixed(0)}%), walau ada beberapa perbedaan.`,
      `skor visi ${skor_visi.toFixed(0)}% - ada titik temu, tapi belum sepenuhnya sejalan.`,
      `visi ${nd} punya kesamaan secukupnya dengan Anda (${skor_visi.toFixed(0)}%).`,
    ]))
  } else {
    parts.push(pilih([
      `visi ${nd} masih cukup berbeda dari harapan Anda (${skor_visi.toFixed(0)}%).`,
      `skor visinya ${skor_visi.toFixed(0)}% - arah pemikirannya belum terlalu cocok.`,
      `visi yang Anda tulis belum banyak nyambung dengan visi ${nd} (${skor_visi.toFixed(0)}%).`,
    ]))
  }

  const sama = misi_calon.filter(m => misi_user_set.has(m))
  if (sama.length > 0) {
    const acak = sama.sort(() => Math.random() - 0.5).slice(0, 2)
    if (acak.length === 1) {
      parts.push(pilih([
        `Misi '${acak[0].slice(0, 50)}...' juga jadi prioritas Anda.`,
        `Salah satu misi andalan Anda - '${acak[0].slice(0, 50)}...' - juga diusung ${nd}.`,
        `Ada kesamaan di misi: '${acak[0].slice(0, 50)}...'.`,
      ]))
    } else {
      parts.push(pilih([
        `Dua misi juga Anda prioritaskan: '${acak[0].slice(0, 40)}...' dan '${acak[1].slice(0, 40)}...'.`,
        `Beberapa misi cocok, misalnya '${acak[0].slice(0, 40)}...' dan '${acak[1].slice(0, 40)}...'.`,
        `Misi seperti '${acak[0].slice(0, 40)}...' dan '${acak[1].slice(0, 40)}...' sejalan dengan pilihan Anda.`,
      ]))
    }
  } else if (skor_misi >= 60) {
    parts.push(pilih([
      `Misi-misi ${nd} secara umum sejalan dengan prioritas Anda (${skor_misi.toFixed(0)}%).`,
      `Secara umum arah misi ${nd} cocok dengan Anda (${skor_misi.toFixed(0)}%).`,
    ]))
  } else if (skor_misi < 30) {
    parts.push(pilih([
      `Misi ${nd} belum banyak yang sesuai dengan prioritas Anda (${skor_misi.toFixed(0)}%).`,
      `Skor misi ${skor_misi.toFixed(0)}% - arah programnya masih berbeda dengan harapan Anda.`,
    ]))
  }

  if (skor_pendidikan >= 100) {
    parts.push(pilih([
      `Pendidikan ${nd} (${pendidikan_calon}) sudah di atas batas minimal yang Anda tentukan.`,
      `Dari sisi pendidikan, ${pendidikan_calon} - memenuhi syarat yang Anda cari.`,
      `Latar belakang pendidikan ${pendidikan_calon} sudah sesuai standar Anda.`,
    ]))
  } else if (skor_pendidikan >= 50) {
    parts.push(pilih([
      `Pendidikan ${pendidikan_calon} - lumayan mendekati batas minimal (${pendidikan_min}).`,
      `Meski belum mencapai ${pendidikan_min}, pendidikan ${nd} (${pendidikan_calon}) masih cukup.`,
    ]))
  } else {
    parts.push(pilih([
      `Pendidikan ${pendidikan_calon} mungkin masih kurang dari yang Anda harapkan (${pendidikan_min}).`,
      `Catatan: pendidikan ${nd} (${pendidikan_calon}) di bawah minimal (${pendidikan_min}) yang Anda tetapkan.`,
    ]))
  }

  if (skor_umur >= 100) {
    parts.push(pilih([
      `Usia ${umur_calon} tahun pas dengan range yang Anda cari (${umur_min}-${umur_max}).`,
      `Usia ${umur_calon} tahun - tepat dalam rentang usia ideal Anda.`,
      `Umur ${nd} (${umur_calon} tahun) masuk range yang Anda inginkan.`,
    ]))
  } else if (skor_umur >= 50) {
    parts.push(pilih([
      `Usia ${umur_calon} tahun - cukup dekat dengan rentang (${umur_min}-${umur_max}).`,
      `Umurnya ${umur_calon} tahun, sedikit di luar preferensi usia Anda.`,
    ]))
  } else {
    parts.push(pilih([
      `Usia ${umur_calon} tahun - cukup jauh dari rentang usia yang Anda inginkan (${umur_min}-${umur_max}).`,
      `Catatan usia: ${umur_calon} tahun - agak meleset dari range ideal Anda.`,
    ]))
  }

  if (ranking === 1) {
    if (total_calon > 1 && selisih_atas != null) {
      if (selisih_atas < 5) {
        parts.push(pilih([
          `Peringkat 1, tapi selisihnya tipis banget - beda ${selisih_atas.toFixed(0)}% aja.`,
          `Nomor satu! Tapi hati-hati, selisih dengan peringkat 2 cuma ${selisih_atas.toFixed(0)}%.`,
          `Paling cocok, walau persaingannya ketat (selisih ${selisih_atas.toFixed(0)}%).`,
        ]))
      } else if (selisih_atas >= 15) {
        parts.push(pilih([
          `Peringkat 1 dengan skor ${skor_total.toFixed(0)}% - unggul jauh dari yang lain (${selisih_atas.toFixed(0)}%).`,
          `Jelas paling unggul dengan selisih ${selisih_atas.toFixed(0)}% dari peringkat 2.`,
          `Dominasi penuh - skor ${skor_total.toFixed(0)}%, beda ${selisih_atas.toFixed(0)}% dari pesaing terdekat.`,
        ]))
      } else {
        parts.push(pilih([
          `Peringkat 1 dengan skor ${skor_total.toFixed(0)}%, unggul ${selisih_atas.toFixed(0)}% dari peringkat 2.`,
          `Keluar sebagai yang paling cocok (${skor_total.toFixed(0)}%), dengan selisih ${selisih_atas.toFixed(0)}%.`,
        ]))
      }
    } else {
      parts.push(pilih([
        `Satu-satunya calon - skor kecocokan ${skor_total.toFixed(0)}%.`,
        `Hanya ada satu calon, skor kecocokan ${skor_total.toFixed(0)}%.`,
      ]))
    }
  } else if (ranking === 2 && total_calon > 1) {
    parts.push(pilih([
      `Peringkat 2 dari ${total_calon} calon dengan skor ${skor_total.toFixed(0)}%.`,
      `Berada di posisi kedua (${skor_total.toFixed(0)}%), masih patut dipertimbangkan.`,
    ]))
  } else if (ranking >= 3) {
    parts.push(pilih([
      `Peringkat ke-${ranking} dari ${total_calon} calon (${skor_total.toFixed(0)}%).`,
      `Cukup sulit bersaing di peringkat ${ranking} dengan skor ${skor_total.toFixed(0)}%.`,
    ]))
  }

  if (ranking === 1) {
    const kurang = misi_calon.filter(m => !misi_user_set.has(m))
    if (kurang.length > 0 && skor_misi < 80) {
      parts.push(pilih([
        "Coba tambah atau kurangi pilihan misi, hasil bisa beda.",
        "Mau variasi? Ubah-ubah prioritas misi Anda.",
        "Atur ulang preferensi misi untuk lihat perubahan ranking.",
      ]))
    } else {
      parts.push(pilih([
        "Gunakan fitur compare untuk lihat perbandingan langsung.",
        "Coba bandingkan dengan calon lain di fitur Bandingkan.",
        "Lihat detail calon lain dengan fitur compare.",
      ]))
    }
  }

  const s = parts.join(" ")
  return s.charAt(0).toUpperCase() + s.slice(1)
}
