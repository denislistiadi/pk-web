"""
Paham Kades — Cek Kecocokan Calon Kepala Desa Kabupaten Pemalang.
Single-file WSGI + SCF handler (zero deps — stdlib only).
"""
import json, os, math, re, random, sqlite3, time, traceback
from collections import Counter
from urllib.parse import parse_qs

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pahamkades.db")

LOG = lambda msg: print(f"[{time.strftime('%H:%M:%S')}] {msg}", file=sys.stderr, flush=True)


# ═══════════════════════════════════════════════════════
# TF-IDF
# ═══════════════════════════════════════════════════════

def tokenize(text):
    return re.findall(r'\w+', text.lower())

def compute_tf(text):
    tokens = tokenize(text)
    n = len(tokens)
    if not n:
        return {}
    cnt = Counter(tokens)
    return {w: c / n for w, c in cnt.items()}

def cosine_similarity(a, b):
    keys = set(a) | set(b)
    dot = sum(a.get(k, 0) * b.get(k, 0) for k in keys)
    na = sum(v * v for v in a.values()) ** 0.5
    nb = sum(v * v for v in b.values()) ** 0.5
    return dot / (na * nb) if na and nb else 0.0

def jaccard_similarity(a, b):
    u, i = a | b, a & b
    return len(i) / len(u) if u else 0.0

def skor_pendidikan(calon, minimal):
    TINGKAT = ["SD", "SMP", "SMA/SMK", "D1/D3", "S1/D4", "S2", "S3"]
    try:
        ci, mi = TINGKAT.index(calon), TINGKAT.index(minimal)
    except ValueError:
        return 0.0
    return 100.0 if ci >= mi else max(0.0, 100.0 - (mi - ci) * 25.0)

def skor_umur(umur, min_u, max_u):
    if min_u <= umur <= max_u:
        return 100.0
    if umur < min_u:
        return max(0.0, 100.0 - (min_u - umur) * 10.0)
    return max(0.0, 100.0 - (umur - max_u) * 10.0)


# ═══════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════

_PREAMBLES = [
    "Dari hasil analisis,", "Berdasarkan preferensi Anda,",
    "Kalau dilihat dari data yang ada,", "Menurut perhitungan kecocokan,",
    "Dari semua calon yang ada,", "Secara keseluruhan,", "Bila dilihat dari kriterianya,",
]

def _pilih(d):
    return random.choice(d)

def buat_summary(nama, nomor_urut, skor_visi, skor_misi, skor_pendidikan, skor_umur,
                  skor_total, visi_calon, misi_calon, pendidikan_calon, umur_calon,
                  misi_user_set, all_misi_items, pendidikan_min, umur_min, umur_max,
                  ranking, total_calon, selisih_atas=None):
    nama_depan = nama.split(",")[0].split()[0] if "," in nama else nama.split()[0]
    parts = [_pilih(_PREAMBLES)]
    nd = nama_depan

    # Visi
    if skor_visi >= 70:
        parts.append(_pilih([
            f"visi {nd} ({skor_visi:.0f}%) cukup sejalan dengan gambaran Anda.",
            f"visi calon ini mirip dengan harapan Anda — skor {skor_visi:.0f}%.",
            f"kesamaan visi cukup tinggi ({skor_visi:.0f}%), {nd} punya arah yang sama dengan Anda.",
        ]))
    elif skor_visi >= 35:
        parts.append(_pilih([
            f"visi {nd} cukup dekat ({skor_visi:.0f}%), walau ada beberapa perbedaan.",
            f"skor visi {skor_visi:.0f}% — ada titik temu, tapi belum sepenuhnya sejalan.",
            f"visi {nd} punya kesamaan secukupnya dengan Anda ({skor_visi:.0f}%).",
        ]))
    else:
        parts.append(_pilih([
            f"visi {nd} masih cukup berbeda dari harapan Anda ({skor_visi:.0f}%).",
            f"skor visinya {skor_visi:.0f}% — arah pemikirannya belum terlalu cocok.",
            f"visi yang Anda tulis belum banyak nyambung dengan visi {nd} ({skor_visi:.0f}%).",
        ]))

    # Misi
    sama = [m for m in misi_calon if m in misi_user_set]
    if sama:
        acak = random.sample(sama, min(2, len(sama)))
        if len(acak) == 1:
            parts.append(_pilih([
                f"Misi '{acak[0][:50]}...' juga jadi prioritas Anda.",
                f"Salah satu misi andalan Anda — '{acak[0][:50]}...' — juga diusung {nd}.",
                f"Ada kesamaan di misi: '{acak[0][:50]}...'.",
            ]))
        else:
            parts.append(_pilih([
                f"Dua misi juga Anda prioritaskan: '{acak[0][:40]}...' dan '{acak[1][:40]}...'.",
                f"Beberapa misi cocok, misalnya '{acak[0][:40]}...' dan '{acak[1][:40]}...'.",
                f"Misi seperti '{acak[0][:40]}...' dan '{acak[1][:40]}...' sejalan dengan pilihan Anda.",
            ]))
    elif skor_misi >= 60:
        parts.append(_pilih([
            f"Misi-misi {nd} secara umum sejalan dengan prioritas Anda ({skor_misi:.0f}%).",
            f"Secara umum arah misi {nd} cocok dengan Anda ({skor_misi:.0f}%).",
        ]))
    elif skor_misi < 30:
        parts.append(_pilih([
            f"Misi {nd} belum banyak yang sesuai dengan prioritas Anda ({skor_misi:.0f}%).",
            f"Skor misi {skor_misi:.0f}% — arah programnya masih berbeda dengan harapan Anda.",
        ]))

    # Pendidikan
    if skor_pendidikan >= 100:
        parts.append(_pilih([
            f"Pendidikan {nd} ({pendidikan_calon}) sudah di atas batas minimal yang Anda tentukan.",
            f"Dari sisi pendidikan, {pendidikan_calon} — memenuhi syarat yang Anda cari.",
            f"Latar belakang pendidikan {pendidikan_calon} sudah sesuai standar Anda.",
        ]))
    elif skor_pendidikan >= 50:
        parts.append(_pilih([
            f"Pendidikan {pendidikan_calon} — lumayan mendekati batas minimal ({pendidikan_min}).",
            f"Meski belum mencapai {pendidikan_min}, pendidikan {nd} ({pendidikan_calon}) masih cukup.",
        ]))
    else:
        parts.append(_pilih([
            f"Pendidikan {pendidikan_calon} mungkin masih kurang dari yang Anda harapkan ({pendidikan_min}).",
            f"Catatan: pendidikan {nd} ({pendidikan_calon}) di bawah minimal ({pendidikan_min}) yang Anda tetapkan.",
        ]))

    # Usia
    if skor_umur >= 100:
        parts.append(_pilih([
            f"Usia {umur_calon} tahun pas dengan range yang Anda cari ({umur_min}-{umur_max}).",
            f"Usia {umur_calon} tahun — tepat dalam rentang usia ideal Anda.",
            f"Umur {nd} ({umur_calon} tahun) masuk range yang Anda inginkan.",
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

    # Ranking
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

    # Tips
    if ranking == 1:
        kurang = [m for m in misi_calon if m not in misi_user_set]
        if kurang and skor_misi < 80:
            parts.append(_pilih([
                "Coba tambah atau kurangi pilihan misi, hasil bisa beda.",
                "Mau variasi? Ubah-ubah prioritas misi Anda.",
                "Atur ulang preferensi misi untuk lihat perubahan ranking.",
            ]))
        else:
            parts.append(_pilih([
                "Gunakan fitur compare untuk lihat perbandingan langsung.",
                "Coba bandingkan dengan calon lain di fitur Bandingkan.",
                "Lihat detail calon lain dengan fitur compare.",
            ]))

    s = " ".join(parts)
    return s[0].upper() + s[1:]


# ═══════════════════════════════════════════════════════
# Database
# ═══════════════════════════════════════════════════════

def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=OFF")
    conn.row_factory = sqlite3.Row
    return conn

def get_kecamatan():
    conn = _get_conn()
    rows = conn.execute("SELECT id, nama FROM kecamatan ORDER BY nama").fetchall()
    conn.close()
    return [{"id": r["id"], "nama": r["nama"]} for r in rows]

def get_desa(kecamatan_id=None):
    conn = _get_conn()
    q = """
        SELECT d.id, d.nama, d.kecamatan_id, k.nama as kecamatan,
               (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) as paslon_count
        FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id
    """
    p = []
    if kecamatan_id is not None:
        q += " WHERE d.kecamatan_id = ?"
        p.append(kecamatan_id)
    q += " ORDER BY k.nama, d.nama"
    rows = conn.execute(q, p).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_desa_by_id(desa_id):
    conn = _get_conn()
    row = conn.execute("""
        SELECT d.id, d.nama, d.kecamatan_id, k.nama as kecamatan
        FROM desa d JOIN kecamatan k ON k.id = d.kecamatan_id WHERE d.id = ?
    """, (desa_id,)).fetchone()
    if not row:
        conn.close()
        return None
    paslon = conn.execute("""
        SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url
        FROM paslon WHERE desa_id = ? ORDER BY nomor_urut
    """, (desa_id,)).fetchall()
    conn.close()
    d = dict(row)
    pl = []
    for p in paslon:
        p = dict(p)
        p["misi"] = json.loads(p.pop("misi_json"))
        p.pop("tf_json", None)
        pl.append(p)
    d["paslon"] = pl
    return d

def get_paslon(paslon_id):
    conn = _get_conn()
    row = conn.execute("""
        SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json, p.pendidikan, p.umur, p.foto_url,
               d.nama as desa_nama
        FROM paslon p JOIN desa d ON d.id = p.desa_id WHERE p.id = ?
    """, (paslon_id,)).fetchone()
    conn.close()
    if not row:
        return None
    p = dict(row)
    p["misi"] = json.loads(p.pop("misi_json"))
    p.pop("tf_json", None)
    return p

def get_paslon_by_ids(ids):
    if not ids:
        return []
    ph = ",".join("?" * len(ids))
    conn = _get_conn()
    rows = conn.execute(f"""
        SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json, p.pendidikan, p.umur, p.foto_url,
               d.nama as desa_nama
        FROM paslon p JOIN desa d ON d.id = p.desa_id WHERE p.id IN ({ph}) ORDER BY p.nomor_urut
    """, ids).fetchall()
    conn.close()
    res = []
    for r in rows:
        p = dict(r)
        p["misi"] = json.loads(p.pop("misi_json"))
        p.pop("tf_json", None)
        res.append(p)
    return res


# ═══════════════════════════════════════════════════════
# WSGI App
# ═══════════════════════════════════════════════════════

def _json_res(sr, data, status="200 OK"):
    body = json.dumps(data, ensure_ascii=False, default=str).encode("utf-8")
    sr(status, [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Content-Length", str(len(body))),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
    ])
    return [body]

def _read_body(environ):
    length = int(environ.get("CONTENT_LENGTH", 0))
    if not length:
        return {}
    return json.loads(environ["wsgi.input"].read(length))

def app(environ, start_response):
    method = environ["REQUEST_METHOD"]
    path = environ["PATH_INFO"].rstrip("/") or "/"
    t0 = time.time()

    try:
        if method == "OPTIONS":
            start_response("204 No Content", [
                ("Access-Control-Allow-Origin", "*"),
                ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
                ("Access-Control-Allow-Headers", "Content-Type"),
                ("Access-Control-Max-Age", "86400"),
            ])
            return [b""]

        # GET /api/ping — health check
        if method == "GET" and path == "/api/ping":
            return _json_res(start_response, {
                "ok": True, "db": os.path.exists(DB_PATH),
                "time": f"{(time.time()-t0)*1000:.0f}ms"
            })

        # GET /api/kecamatan
        if method == "GET" and path == "/api/kecamatan":
            data = get_kecamatan()
            LOG(f"GET /api/kecamatan -> {len(data)}r ({(time.time()-t0)*1000:.0f}ms)")
            return _json_res(start_response, data)

        # GET /api/desa?kecamatan_id=X
        if method == "GET" and path == "/api/desa":
            qs = parse_qs(environ.get("QUERY_STRING", ""))
            kid = int(qs["kecamatan_id"][0]) if "kecamatan_id" in qs else None
            data = get_desa(kid)
            LOG(f"GET /api/desa -> {len(data)}r ({(time.time()-t0)*1000:.0f}ms)")
            return _json_res(start_response, data)

        # GET /api/desa/{id}
        if method == "GET" and path.startswith("/api/desa/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                data = get_desa_by_id(int(parts[3]))
                if not data:
                    return _json_res(start_response, {"error": "Desa tidak ditemukan"}, "404 Not Found")
                LOG(f"GET /api/desa/{parts[3]} ({(time.time()-t0)*1000:.0f}ms)")
                return _json_res(start_response, data)

        # GET /api/paslon/compare?ids=1,2,3
        if method == "GET" and path == "/api/paslon/compare":
            qs = parse_qs(environ.get("QUERY_STRING", ""))
            ids_str = qs.get("ids", [""])[0]
            id_list = [int(x) for x in ids_str.split(",") if x.strip()]
            paslon_list = get_paslon_by_ids(id_list)
            if len(paslon_list) < 2:
                return _json_res(start_response, {"error": "Minimal 2 calon"}, "400 Bad Request")
            LOG(f"GET /api/paslon/compare -> {len(paslon_list)}p ({(time.time()-t0)*1000:.0f}ms)")
            return _json_res(start_response, {"desa": paslon_list[0].get("desa_nama", ""), "paslon": paslon_list})

        # GET /api/paslon/{id}
        if method == "GET" and path.startswith("/api/paslon/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                data = get_paslon(int(parts[3]))
                if not data:
                    return _json_res(start_response, {"error": "Calon tidak ditemukan"}, "404 Not Found")
                LOG(f"GET /api/paslon/{parts[3]} ({(time.time()-t0)*1000:.0f}ms)")
                return _json_res(start_response, data)

        # POST /api/cocokkan
        if method == "POST" and path == "/api/cocokkan":
            req = _read_body(environ)
            desa_id = int(req.get("desa_id", 0))
            visi_user = (req.get("visi_user") or "").strip()
            misi_idx = req.get("misi_user") or []
            pendidikan_min = req.get("pendidikan_min") or "SD"
            umur_min = int(req.get("umur_min", 25))
            umur_max = int(req.get("umur_max", 60))
            if not visi_user:
                return _json_res(start_response, {"error": "Visi wajib diisi"}, "400 Bad Request")

            t1 = time.time()
            conn = _get_conn()
            row = conn.execute("SELECT nama FROM desa WHERE id = ?", (desa_id,)).fetchone()
            if not row:
                conn.close()
                return _json_res(start_response, {"error": "Desa tidak ditemukan"}, "404 Not Found")
            desa_nama = row["nama"]
            rows = conn.execute("""
                SELECT id, nomor_urut, nama, visi, misi_json, pendidikan, umur, tf_json
                FROM paslon WHERE desa_id = ? ORDER BY nomor_urut
            """, (desa_id,)).fetchall()
            conn.close()
            if not rows:
                return _json_res(start_response, {"error": "Tidak ada calon"}, "400 Bad Request")

            paslon = []
            for r in rows:
                p = dict(r)
                p["misi"] = json.loads(p.pop("misi_json"))
                p["tf"] = json.loads(p.pop("tf_json"))
                paslon.append(p)
            LOG(f"  DB: {len(paslon)}p ({(time.time()-t1)*1000:.0f}ms)")
            t2 = time.time()

            all_misi = []
            for p in paslon:
                for m in p["misi"]:
                    if m not in all_misi:
                        all_misi.append(m)
            user_misi_set = {all_misi[i] for i in misi_idx if i < len(all_misi)}
            LOG(f"  Misi: ({(time.time()-t2)*1000:.0f}ms)")

            t3 = time.time()
            user_tf = compute_tf(visi_user)
            all_tfs = [p["tf"] for p in paslon] + [user_tf]
            n = len(all_tfs)
            df = {}
            for tf in all_tfs:
                for w in tf:
                    df[w] = df.get(w, 0) + 1
            idf = {w: math.log(n / (1 + c)) + 1 for w, c in df.items()}
            uv = {w: v * idf.get(w, 0.01) for w, v in user_tf.items()}
            LOG(f"  IDF: ({(time.time()-t3)*1000:.0f}ms)")

            t4 = time.time()
            results = []
            for p in paslon:
                pv = {w: v * idf.get(w, 0.01) for w, v in p["tf"].items()}
                sv = cosine_similarity(uv, pv) * 100
                sm = jaccard_similarity(user_misi_set, set(p["misi"])) * 100
                sp = skor_pendidikan(p["pendidikan"], pendidikan_min)
                su = skor_umur(p["umur"], umur_min, umur_max)
                results.append({
                    "paslon_id": p["id"], "nama": p["nama"], "nomor_urut": p["nomor_urut"],
                    "skor_visi": round(sv, 1), "skor_misi": round(sm, 1),
                    "skor_pendidikan": round(sp, 1), "skor_umur": round(su, 1),
                    "skor_total": round(sv * 0.35 + sm * 0.30 + sp * 0.15 + su * 0.20, 1),
                })
            results.sort(key=lambda r: r["skor_total"], reverse=True)
            LOG(f"  Score: {len(results)}p ({(time.time()-t4)*1000:.0f}ms)")

            t5 = time.time()
            skor_list = [r["skor_total"] for r in results]
            for i, r in enumerate(results):
                p = next(x for x in paslon if x["id"] == r["paslon_id"])
                selisih = None
                if i == 0 and len(skor_list) > 1:
                    selisih = skor_list[0] - skor_list[1]
                elif i > 0:
                    selisih = skor_list[i - 1] - r["skor_total"]
                r["summary"] = buat_summary(
                    nama=r["nama"], nomor_urut=r["nomor_urut"],
                    skor_visi=r["skor_visi"], skor_misi=r["skor_misi"],
                    skor_pendidikan=r["skor_pendidikan"], skor_umur=r["skor_umur"],
                    skor_total=r["skor_total"],
                    visi_calon=p["visi"], misi_calon=p["misi"],
                    pendidikan_calon=p["pendidikan"], umur_calon=p["umur"],
                    misi_user_set=user_misi_set, all_misi_items=all_misi,
                    pendidikan_min=pendidikan_min, umur_min=umur_min, umur_max=umur_max,
                    ranking=i + 1, total_calon=len(results), selisih_atas=selisih,
                )
            LOG(f"  Summary: ({(time.time()-t5)*1000:.0f}ms)")
            LOG(f"POST /api/cocokkan done ({(time.time()-t0)*1000:.0f}ms)")

            return _json_res(start_response, {
                "desa": desa_nama, "results": results,
                "user_input": {
                    "visi": visi_user, "misi_count": len(misi_idx),
                    "pendidikan_min": pendidikan_min, "umur_min": umur_min, "umur_max": umur_max,
                },
            })

        return _json_res(start_response, {"error": "Not Found"}, "404 Not Found")

    except Exception as e:
        LOG(f"ERROR: {traceback.format_exc()}")
        return _json_res(start_response, {"error": str(e)}, "500 Internal Server Error")


# ═══════════════════════════════════════════════════════
# SCF-compatible handler (for Tencent Cloud SCF)
# ═══════════════════════════════════════════════════════

import sys

def main_handler(event, context):
    """SCF event-compatible entry point for Tencent Cloud."""
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    headers = event.get("headers", {})
    query = event.get("queryString", event.get("queryStringParameters", "") or "")
    body_str = event.get("body", "")

    if event.get("isBase64Encoded"):
        import base64
        body_str = base64.b64decode(body_str).decode("utf-8")

    qs = query if isinstance(query, str) else ""
    if not isinstance(qs, str):
        qs = ""

    environ = {
        "REQUEST_METHOD": method,
        "PATH_INFO": path,
        "QUERY_STRING": qs,
        "CONTENT_TYPE": headers.get("content-type", headers.get("Content-Type", "")),
        "CONTENT_LENGTH": str(len(body_str)),
        "wsgi.input": __import__("io").StringIO(body_str),
        "SERVER_PROTOCOL": "HTTP/1.1",
        "SERVER_NAME": "scf",
        "SERVER_PORT": "80",
    }

    response_status = "200 OK"
    response_headers = []

    def start_response(status, headers):
        nonlocal response_status, response_headers
        response_status = status
        response_headers = headers

    body_parts = app(environ, start_response)
    body = b"".join(body_parts)

    return {
        "isBase64Encoded": False,
        "statusCode": int(response_status.split()[0]),
        "headers": {k: v for k, v in response_headers},
        "body": body.decode("utf-8"),
    }
