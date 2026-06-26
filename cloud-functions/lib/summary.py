import random

TEMPLATES_KELEBIHAN = [
    "Visi {nama} skor {skor}% — paling nyamip dengan harapan Anda.",
    "Dari segi {kategori}, {nama} unggul banget: skor {skor}%.",
    "Skor {kategori} {nama} ({skor}%) jadi nilai jual utama.",
    "{nama} paling menonjol di {kategori}, skor {skor}%.",
    "{kategori.title()} {nama} (skor {skor}%) patut diacungi jempol.",
    "Kelebihan utama {nama} ada di {kategori} dengan skor {skor}%.",
    "Nilai {kategori} {nama} ({skor}%) termasuk yang terbaik.",
    "{nama} cocok banget dari sisi {kategori}: skor {skor}%.",
    "{kategori.title()} jadi senjata utama {nama} — skor {skor}%.",
    "Luar biasa, skor {kategori} {nama} tembus {skor}%.",
    "Di antara semua calon, {nama} paling unggul di {kategori} ({skor}%).",
    "Skor {kategori} {nama} ({skor}%) bikin dia beda dari yang lain.",
    "{nama} punya nilai plus di {kategori}, skor {skor}%.",
    "Kalau soal {kategori}, {nama} juaranya: skor {skor}%.",
    "Gak bisa dipungkiri, {kategori} {nama} jadi andalan ({skor}%).",
    "Dari {kategori}, {nama} dapat skor {skor}% — mantap.",
    "Satu hal yang bikin {nama} unggul: {kategori} skor {skor}%.",
    "{nama} bersinar di {kategori}, skor {skor}%.",
    "Skor {kategori} {nama} ({skor}%) bikin dia layak dipertimbangkan.",
    "Keunggulan {nama} terlihat jelas di {kategori}: skor {skor}%.",
]

TEMPLATES_KELEMAHAN = [
    "Catatan: skor {kategori} {nama} masih rendah ({skor}%).",
    "Kelemahan {nama} ada di {kategori}, skor cuma {skor}%.",
    "Sayangnya, {kategori} {nama} kurang memenuhi ({skor}%).",
    "Skor {kategori} {nama} ({skor}%) masih perlu diperbaiki.",
    "Perlu dicatat, {kategori} bukan point plus {nama} ({skor}%).",
    "{nama} kurang greget di {kategori}, skor {skor}%.",
    "Dari sisi {kategori}, {nama} dapat skor {skor}% — masih kurang.",
    "Evaluasi: {kategori} {nama} cuma {skor}%, di bawah rata-rata.",
    "{kategori.title()} jadi titik lemah {nama} dengan skor {skor}%.",
    "Yang perlu diwaspadai: skor {kategori} {nama} baru {skor}%.",
    "Skor {kategori} {nama} ({skor}%) belum sesuai harapan.",
    "{nama} masih perlu kerja keras di {kategori} ({skor}%).",
    "Untuk {kategori}, {nama} masih kurang skor ({skor}%).",
    "Hasil {kategori} {nama} belum maksimal: skor {skor}%.",
    "Skor {kategori} {nama} ({skor}%) masih bisa ditingkatkan.",
    "Catatan kecil: {kategori} {nama} skor {skor}%, perlu perhatian.",
    "Dari 4 aspek, {kategori} jadi nilai terendah {nama} ({skor}%).",
    "Yang bikin {nama} turun skor: {kategori} cuma {skor}%.",
    "Kekurangan {nama} paling terasa di {kategori} ({skor}%).",
    "Skor {kategori} {nama} ({skor}%) masih di bawah ekspektasi.",
]

TEMPLATES_PERINGKAT = [
    "Peringkat 1 unggul tipis {selisih}% dari peringkat 2.",
    "Dominasi penuh! Peringkat 1 unggul {selisih}% dari runner-up.",
    "Selisih {selisih}% — peringkat 1 dan 2 bersaing ketat.",
    "Peringkat 1 unggul cukup jauh, selisih {selisih}%.",
    "Kompetisi ketat: peringkat 1 hanya unggul {selisih}%.",
    "Peringkat 1 memimpin dengan keunggulan {selisih}%.",
    "Jarak peringkat 1 dan 2: {selisih}%.",
    "Peringkat 1 nyaman di puncak dengan selisih {selisih}%.",
    "Selisih tipis {selisih}%, peringkat 2 masih bisa mengejar.",
    "Peringkat 1 kokoh dengan selisih {selisih}% dari peringkat 2.",
    "Unggul {selisih}% — peringkat 1 layak jadi andalan.",
    "Peringkat 1 mempertahankan posisi dengan selisih {selisih}%.",
    "Hanya berselisih {selisih}%, hasil bisa berbeda lain waktu.",
    "Peringkat 1 memimpin {selisih}%, tapi peringkat 2 patut diperhitungkan.",
    "{selisih}% jadi jarak antara peringkat 1 dan 2.",
    "Peringkat 1 lebih cocok {selisih}% dibanding peringkat 2.",
    "Keunggulan {selisih}% bikin peringkat 1 tak tergoyahkan.",
    "Meski unggul {selisih}%, peringkat 1 tetap perlu diwaspadai.",
    "Peringkat 2 tertinggal {selisih}% dari peringkat 1.",
    "Pertarungan ketat — cuma beda {selisih}% antara peringkat 1 dan 2.",
]

TEMPLATES_TIP = [
    "Coba atur ulang range umur buat hasil yang beda.",
    "Mau coba lagi? Ubah prioritas misi pilihan Anda.",
    "Tips: naikkan pendidikan minimal lihat calon baru muncul.",
    "Coba isi visi yang lebih spesifik biar skor makin akurat.",
    "Ubah-ubah pilihan misi, lihat perubahan ranking-nya.",
    "Cek hasil lagi setelah ganti preferensi umur.",
    "Mau coba skenario lain? Ubah visi ideal Anda.",
    "Eksperimen dengan beda kombinasi misi dan lihat hasilnya.",
    "Pilih lebih banyak misi atau kurangi, ranking bisa berubah.",
    "Atur ulang prioritas — hasil bisa beda tiap percobaan.",
    "Coba bandingkan peringkat 1 dan 2 di halaman compare.",
    "Jangan puas sama satu hasil, coba kombinasi lain.",
    "Semakin detail visi Anda, semakin akurat hasilnya.",
    "Pendidikan minimal bisa bikin perbedaan besar — coba ubah.",
    "Coba rentang umur yang lebih sempit buat hasil presisi.",
    "Mainkan bobot preferensi Anda dan lihat perubahannya.",
    "Gunakan fitur compare buat lihat beda tiap calon.",
    "Ubah strategi: fokus ke 1-2 misi prioritas saja.",
    "Bandingkan hasil dengan pilih calon idola Anda langsung.",
    "Coba refresh halaman dan isi ulang — hasil mungkin beda.",
]

KATEGORI_MAP = {
    "skor_visi": "visi",
    "skor_misi": "visi misi",
    "skor_pendidikan": "pendidikan",
    "skor_umur": "umur",
}


def _kategori_label(key: str) -> str:
    return KATEGORI_MAP.get(key, key.replace("skor_", ""))


def buat_summary(results: list) -> list:
    summaries = []
    top_score = results[0].skor_total if results else 0

    for i, r in enumerate(results):
        parts = []

        # Sort scores to find strength & weakness
        scores = [
            ("skor_visi", r.skor_visi),
            ("skor_misi", r.skor_misi),
            ("skor_pendidikan", r.skor_pendidikan),
            ("skor_umur", r.skor_umur),
        ]
        scores_sorted = sorted(scores, key=lambda x: x[1], reverse=True)
        tertinggi = scores_sorted[0]
        terendah = scores_sorted[-1]

        # Strength
        kat_baik = _kategori_label(tertinggi[0])
        t = random.choice(TEMPLATES_KELEBIHAN).format(
            nama=r.nama.split(",")[0].split()[0] if "," in r.nama else r.nama.split()[0],
            skor=int(tertinggi[1]),
            kategori=kat_baik,
        )
        parts.append(t)

        # Weakness (if not perfect)
        if terendah[1] < 100:
            kat_buruk = _kategori_label(terendah[0])
            t = random.choice(TEMPLATES_KELEMAHAN).format(
                nama=r.nama.split(",")[0].split()[0] if "," in r.nama else r.nama.split()[0],
                skor=int(terendah[1]),
                kategori=kat_buruk,
            )
            parts.append(t)

        # Rank 1 comparison (only for rank 1)
        if i == 0 and len(results) > 1:
            selisih = r.skor_total - results[1].skor_total
            t = random.choice(TEMPLATES_PERINGKAT).format(selisih=f"{selisih:.0f}")
            parts.append(t)

        # Tip (only for rank 1, every 3rd request-ish)
        if i == 0:
            t = random.choice(TEMPLATES_TIP)
            parts.append(t)

        summaries.append(" ".join(parts))

    return summaries
