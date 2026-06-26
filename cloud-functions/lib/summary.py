import random

PREAMBLES = [
    "Dari hasil analisis,",
    "Berdasarkan preferensi Anda,",
    "Kalau dilihat dari data yang ada,",
    "Menurut perhitungan kecocokan,",
    "Dari semua calon yang ada,",
    "Secara keseluruhan,",
    "Bila dilihat dari kriterianya,",
]

def _pilih(daftar: list) -> str:
    return random.choice(daftar)


def buat_summary(
    nama: str,
    nomor_urut: int,
    skor_visi: float,
    skor_misi: float,
    skor_pendidikan: float,
    skor_umur: float,
    skor_total: float,
    visi_calon: str,
    misi_calon: list,
    pendidikan_calon: str,
    umur_calon: int,
    misi_user_set: set,
    all_misi_items: list,
    pendidikan_min: str,
    umur_min: int,
    umur_max: int,
    ranking: int,
    total_calon: int,
    selisih_atas: float = None,
) -> str:
    nama_depan = nama.split(",")[0].split()[0] if "," in nama else nama.split()[0]
    parts = []

    # --- PREAMBLE ---
    parts.append(_pilih(PREAMBLES))

    # --- VISI SECTION ---
    if skor_visi >= 70:
        parts.append(_pilih([
            f"visi {nama_depan} ({skor_visi:.0f}%) cukup sejalan dengan gambaran Anda.",
            f"visi calon ini mirip dengan harapan Anda — skor {skor_visi:.0f}%.",
            f"kesamaan visi cukup tinggi ({skor_visi:.0f}%), {nama_depan} punya arah yang sama dengan Anda.",
        ]))
    elif skor_visi >= 35:
        parts.append(_pilih([
            f"visi {nama_depan} cukup dekat ({skor_visi:.0f}%), walau ada beberapa perbedaan.",
            f"skor visi {skor_visi:.0f}% — ada titik temu, tapi belum sepenuhnya sejalan.",
            f"visi {nama_depan} punya kesamaan secukupnya dengan Anda ({skor_visi:.0f}%).",
        ]))
    else:
        parts.append(_pilih([
            f"visi {nama_depan} masih cukup berbeda dari harapan Anda ({skor_visi:.0f}%).",
            f"skor visinya {skor_visi:.0f}% — arah pemikirannya belum terlalu cocok.",
            f"visi yang Anda tulis belum banyak nyambung dengan visi {nama_depan} ({skor_visi:.0f}%).",
        ]))

    # --- MISI SECTION (dynamic — mention actual missions) ---
    misi_sama_list = [m for m in misi_calon if m in misi_user_set]

    if misi_sama_list:
        acak = random.sample(misi_sama_list, min(2, len(misi_sama_list)))
        if len(acak) == 1:
            parts.append(_pilih([
                f"Misi '{acak[0][:50]}…' juga jadi prioritas Anda.",
                f"Salah satu misi andalan Anda — '{acak[0][:50]}…' — juga diusung {nama_depan}.",
                f"Ada kesamaan di misi: '{acak[0][:50]}…'.",
            ]))
        else:
            parts.append(_pilih([
                f"Dua misi juga Anda prioritaskan: '{acak[0][:40]}…' dan '{acak[1][:40]}…'.",
                f"Beberapa misi cocok, misalnya '{acak[0][:40]}…' dan '{acak[1][:40]}…'.",
                f"Misi seperti '{acak[0][:40]}…' dan '{acak[1][:40]}…' sejalan dengan pilihan Anda.",
            ]))
    elif skor_misi >= 60:
        parts.append(_pilih([
            f"Misi-misi {nama_depan} secara umum sejalan dengan prioritas Anda ({skor_misi:.0f}%).",
            f"Secara umum arah misi {nama_depan} cocok dengan Anda ({skor_misi:.0f}%).",
        ]))
    elif skor_misi < 30:
        parts.append(_pilih([
            f"Misi {nama_depan} belum banyak yang sesuai dengan prioritas Anda ({skor_misi:.0f}%).",
            f"Skor misi {skor_misi:.0f}% — arah programnya masih berbeda dengan harapan Anda.",
        ]))

    # --- PENDIDIKAN SECTION ---
    if skor_pendidikan >= 100:
        parts.append(_pilih([
            f"Pendidikan {nama_depan} ({pendidikan_calon}) sudah di atas batas minimal yang Anda tentukan.",
            f"Dari sisi pendidikan, {pendidikan_calon} — memenuhi syarat yang Anda cari.",
            f"Latar belakang pendidikan {pendidikan_calon} sudah sesuai standar Anda.",
        ]))
    elif skor_pendidikan >= 50:
        parts.append(_pilih([
            f"Pendidikan {pendidikan_calon} — lumayan mendekati batas minimal ({pendidikan_min}).",
            f"Meski belum mencapai {pendidikan_min}, pendidikan {nama_depan} ({pendidikan_calon}) masih cukup.",
        ]))
    else:
        parts.append(_pilih([
            f"Pendidikan {pendidikan_calon} mungkin masih kurang dari yang Anda harapkan ({pendidikan_min}).",
            f"Catatan: pendidikan {nama_depan} ({pendidikan_calon}) di bawah minimal ({pendidikan_min}) yang Anda tetapkan.",
        ]))

    # --- USIA SECTION ---
    if skor_umur >= 100:
        parts.append(_pilih([
            f"Usia {umur_calon} tahun pas dengan range yang Anda cari ({umur_min}-{umur_max}).",
            f"Usia {umur_calon} tahun — tepat dalam rentang usia ideal Anda.",
            f"Umur {nama_depan} ({umur_calon} tahun) masuk range yang Anda inginkan.",
        ]))
    elif skor_umur >= 50:
        parts.append(_pilih([
            f"Usia {umur_calon} tahun — cukup dekat dengan rentang ({umur_min}-{umur_max}).",
            f"Umurnya {umur_calon} tahun, sedikit di luar preferensi usia Anda.",
        ]))
    else:
        parts.append(_pilih([
            f"Usia {umur_calon} tahun — cukup jauh dari rentang usia yang Anda inginkan ({umur_min}-{umur_max}).",
            f"Catatan usia: {umur_calon} tahun — agak meleset dari range ideal Anda.",
        ]))

    # --- OVERALL / RANKING ---
    if ranking == 1:
        if total_calon > 1 and selisih_atas is not None:
            if selisih_atas < 5:
                parts.append(_pilih([
                    f"Peringkat 1, tapi selisihnya tipis banget — beda {selisih_atas:.0f}% aja.",
                    f"Nomor satu! Tapi hati-hati, selisih dengan peringkat 2 cuma {selisih_atas:.0f}%.",
                    f"Paling cocok, walau persaingannya ketat (selisih {selisih_atas:.0f}%).",
                ]))
            elif selisih_atas >= 15:
                parts.append(_pilih([
                    f"Peringkat 1 dengan skor {skor_total:.0f}% — unggul jauh dari yang lain ({selisih_atas:.0f}%).",
                    f"Jelas paling unggul dengan selisih {selisih_atas:.0f}% dari peringkat 2.",
                    f"Dominasi penuh — skor {skor_total:.0f}%, beda {selisih_atas:.0f}% dari pesaing terdekat.",
                ]))
            else:
                parts.append(_pilih([
                    f"Peringkat 1 dengan skor {skor_total:.0f}%, unggul {selisih_atas:.0f}% dari peringkat 2.",
                    f"Keluar sebagai yang paling cocok ({skor_total:.0f}%), dengan selisih {selisih_atas:.0f}%.",
                ]))
        else:
            parts.append(_pilih([
                f"Satu-satunya calon — skor kecocokan {skor_total:.0f}%.",
                f"Hanya ada satu calon, skor kecocokan {skor_total:.0f}%.",
            ]))
    elif ranking == 2 and total_calon > 1:
        parts.append(_pilih([
            f"Peringkat 2 dari {total_calon} calon dengan skor {skor_total:.0f}%.",
            f"Berada di posisi kedua ({skor_total:.0f}%), masih patut dipertimbangkan.",
        ]))
    elif ranking >= 3:
        parts.append(_pilih([
            f"Peringkat ke-{ranking} dari {total_calon} calon ({skor_total:.0f}%).",
            f"Cukup sulit bersaing di peringkat {ranking} dengan skor {skor_total:.0f}%.",
        ]))

    # --- TIPS for top 1 ---
    if ranking == 1:
        misi_kurang = [m for m in misi_calon if m not in misi_user_set]
        if misi_kurang and skor_misi < 80:
            parts.append(_pilih([
                f"Coba tambah atau kurangi pilihan misi, hasil bisa beda.",
                f"Mau variasi? Ubah-ubah prioritas misi Anda.",
                f"Atur ulang preferensi misi untuk lihat perubahan ranking.",
            ]))
        else:
            parts.append(_pilih([
                f"Gunakan fitur compare untuk lihat perbandingan langsung.",
                f"Coba bandingkan dengan calon lain di fitur Bandingkan.",
                f"Lihat detail calon lain dengan fitur compare.",
            ]))

    kalimat = " ".join(parts)
    kalimat = kalimat[0].upper() + kalimat[1:]
    return kalimat
