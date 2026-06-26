"""
Paham Kades — Cek Kecocokan Calon Kepala Desa Kabupaten Pemalang.
WSGI API (zero external dependencies — stdlib only).
"""
import json, os, sys, math, sqlite3, time, traceback
from urllib.parse import parse_qs

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "lib"))
from database import get_kecamatan, get_desa, get_desa_by_id, get_paslon, get_paslon_by_ids
from tfidf import compute_tf, cosine_similarity, jaccard_similarity, skor_pendidikan, skor_umur
from summary import buat_summary

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pahamkades.db")
LOG = lambda msg: print(f"[{time.strftime('%H:%M:%S')}] {msg}", file=sys.stderr, flush=True)

def json_res(start_response, data, status="200 OK"):
    body = json.dumps(data, ensure_ascii=False, default=str).encode("utf-8")
    headers = [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Content-Length", str(len(body))),
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
    ]
    start_response(status, headers)
    return [body]

def read_body(environ):
    length = int(environ.get("CONTENT_LENGTH", 0))
    if not length:
        return {}
    return json.loads(environ["wsgi.input"].read(length))

def get_query(environ):
    return parse_qs(environ.get("QUERY_STRING", ""))

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

        # ── GET /api/kecamatan ──
        if method == "GET" and path == "/api/kecamatan":
            data = get_kecamatan()
            LOG(f"GET /api/kecamatan -> {len(data)} rows ({(time.time()-t0)*1000:.0f}ms)")
            return json_res(start_response, data)

        # ── GET /api/desa?kecamatan_id=X ──
        if method == "GET" and path == "/api/desa":
            qs = get_query(environ)
            kid = int(qs["kecamatan_id"][0]) if "kecamatan_id" in qs else None
            data = get_desa(kid)
            LOG(f"GET /api/desa -> {len(data)} rows ({(time.time()-t0)*1000:.0f}ms)")
            return json_res(start_response, data)

        # ── GET /api/desa/{id} ──
        if method == "GET" and path.startswith("/api/desa/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                desa = get_desa_by_id(int(parts[3]))
                if not desa:
                    return json_res(start_response, {"error": "Desa tidak ditemukan"}, "404 Not Found")
                LOG(f"GET /api/desa/{parts[3]} -> {len(desa.get('paslon',[]))} paslon ({(time.time()-t0)*1000:.0f}ms)")
                return json_res(start_response, desa)

        # ── GET /api/paslon/compare?ids=1,2,3 ──
        if method == "GET" and path == "/api/paslon/compare":
            qs = get_query(environ)
            ids_str = qs.get("ids", [""])[0]
            id_list = [int(x) for x in ids_str.split(",") if x.strip()]
            paslon_list = get_paslon_by_ids(id_list)
            if len(paslon_list) < 2:
                return json_res(start_response, {"error": "Minimal 2 calon untuk perbandingan"}, "400 Bad Request")
            LOG(f"GET /api/paslon/compare -> {len(paslon_list)} paslon ({(time.time()-t0)*1000:.0f}ms)")
            return json_res(start_response, {"desa": paslon_list[0].get("desa_nama", ""), "paslon": paslon_list})

        # ── GET /api/paslon/{id} ──
        if method == "GET" and path.startswith("/api/paslon/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3].isdigit():
                p = get_paslon(int(parts[3]))
                if not p:
                    return json_res(start_response, {"error": "Calon tidak ditemukan"}, "404 Not Found")
                LOG(f"GET /api/paslon/{parts[3]} ({(time.time()-t0)*1000:.0f}ms)")
                return json_res(start_response, p)

        # ── POST /api/cocokkan ──
        if method == "POST" and path == "/api/cocokkan":
            t1 = time.time()
            req = read_body(environ)

            desa_id = int(req.get("desa_id", 0))
            visi_user = (req.get("visi_user") or "").strip()
            misi_idx = req.get("misi_user") or []
            pendidikan_min = req.get("pendidikan_min") or "SD"
            umur_min = int(req.get("umur_min", 25))
            umur_max = int(req.get("umur_max", 60))

            if not visi_user:
                return json_res(start_response, {"error": "Visi wajib diisi"}, "400 Bad Request")

            # ── Fetch paslon from DB (with pre-computed TF vectors) ──
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT nama FROM desa WHERE id = ?", (desa_id,)).fetchone()
            if not row:
                conn.close()
                return json_res(start_response, {"error": "Desa tidak ditemukan"}, "404 Not Found")
            desa_nama = row["nama"]

            rows = conn.execute("""
                SELECT id, nomor_urut, nama, visi, misi_json, pendidikan, umur, tf_json
                FROM paslon WHERE desa_id = ? ORDER BY nomor_urut
            """, (desa_id,)).fetchall()
            conn.close()

            if not rows:
                return json_res(start_response, {"error": "Tidak ada calon di desa ini"}, "400 Bad Request")

            paslon = []
            for r in rows:
                p = dict(r)
                p["misi"] = json.loads(p.pop("misi_json"))
                p["tf"] = json.loads(p.pop("tf_json"))
                paslon.append(p)

            LOG(f"  DB fetch: {len(paslon)} paslon ({(time.time()-t1)*1000:.0f}ms)")

            # ── Build misi mappings ──
            t2 = time.time()
            all_misi = []
            for p in paslon:
                for m in p["misi"]:
                    if m not in all_misi:
                        all_misi.append(m)
            user_misi_set = {all_misi[i] for i in misi_idx if i < len(all_misi)}
            LOG(f"  Misi build: {(time.time()-t2)*1000:.0f}ms")

            # ── TF-IDF ──
            t3 = time.time()
            user_tf = compute_tf(visi_user)

            all_tfs = [p["tf"] for p in paslon] + [user_tf]
            n = len(all_tfs)
            doc_freq = {}
            for tf in all_tfs:
                for w in tf:
                    doc_freq[w] = doc_freq.get(w, 0) + 1
            idf = {w: math.log(n / (1 + df)) + 1 for w, df in doc_freq.items()}
            user_vec = {w: v * idf.get(w, 0.01) for w, v in user_tf.items()}
            LOG(f"  IDF + user TF-IDF: {(time.time()-t3)*1000:.0f}ms")

            # ── Score each candidate ──
            t4 = time.time()
            results = []
            for p in paslon:
                p_vec = {w: v * idf.get(w, 0.01) for w, v in p["tf"].items()}
                skor_v = cosine_similarity(user_vec, p_vec) * 100
                skor_m = jaccard_similarity(user_misi_set, set(p["misi"])) * 100
                skor_p = skor_pendidikan(p["pendidikan"], pendidikan_min)
                skor_u = skor_umur(p["umur"], umur_min, umur_max)
                total = skor_v * 0.35 + skor_m * 0.30 + skor_p * 0.15 + skor_u * 0.20

                results.append({
                    "paslon_id": p["id"],
                    "nama": p["nama"],
                    "nomor_urut": p["nomor_urut"],
                    "skor_visi": round(skor_v, 1),
                    "skor_misi": round(skor_m, 1),
                    "skor_pendidikan": round(skor_p, 1),
                    "skor_umur": round(skor_u, 1),
                    "skor_total": round(total, 1),
                })

            results.sort(key=lambda r: r["skor_total"], reverse=True)
            LOG(f"  Scoring {len(results)} paslon: {(time.time()-t4)*1000:.0f}ms")

            # ── Summaries ──
            t5 = time.time()
            skor_list = [r["skor_total"] for r in results]
            for i, r in enumerate(results):
                p = next(x for x in paslon if x["id"] == r["paslon_id"])
                if i == 0 and len(skor_list) > 1:
                    selisih = skor_list[0] - skor_list[1]
                elif i > 0:
                    selisih = skor_list[i - 1] - r["skor_total"]
                else:
                    selisih = None

                r["summary"] = buat_summary(
                    nama=r["nama"], nomor_urut=r["nomor_urut"],
                    skor_visi=r["skor_visi"], skor_misi=r["skor_misi"],
                    skor_pendidikan=r["skor_pendidikan"], skor_umur=r["skor_umur"],
                    skor_total=r["skor_total"],
                    visi_calon=p["visi"], misi_calon=p["misi"],
                    pendidikan_calon=p["pendidikan"], umur_calon=p["umur"],
                    misi_user_set=user_misi_set, all_misi_items=all_misi,
                    pendidikan_min=pendidikan_min,
                    umur_min=umur_min, umur_max=umur_max,
                    ranking=i + 1, total_calon=len(results),
                    selisih_atas=selisih,
                )
            LOG(f"  Summaries: {(time.time()-t5)*1000:.0f}ms")

            LOG(f"POST /api/cocokkan -> {len(results)} results, total {(time.time()-t0)*1000:.0f}ms")
            return json_res(start_response, {
                "desa": desa_nama,
                "results": results,
                "user_input": {
                    "visi": visi_user,
                    "misi_count": len(misi_idx),
                    "pendidikan_min": pendidikan_min,
                    "umur_min": umur_min,
                    "umur_max": umur_max,
                },
            })

        return json_res(start_response, {"error": "Not Found"}, "404 Not Found")

    except Exception as e:
        LOG(f"ERROR: {traceback.format_exc()}")
        return json_res(start_response, {"error": str(e)}, "500 Internal Server Error")
