"""
Paham Kades — EdgeOne Pages entry point (Handler class mode).
EdgeOne Pages detects `class handler(BaseHTTPRequestHandler)` as entry flag.
"""
import json, os, sys, math, re, random, time, traceback
from collections import Counter
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from index import (
    get_kecamatan, get_desa, get_desa_by_id,
    get_paslon, get_paslon_by_ids,
    buat_summary, compute_tf, cosine_similarity,
    skor_pendidikan, skor_umur, jaccard_similarity,
    _KEC, _DESA, _DESA_BY_ID, _PASLON, _PASLON_BY_ID, _PASLON_BY_DESA_ID, _DATA_LOADED,
)

LOG = lambda msg: print(f"[{time.strftime('%H:%M:%S')}] {msg}", file=sys.stderr, flush=True)


class handler(BaseHTTPRequestHandler):
    def _respond(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        qs = parse_qs(parsed.query)
        t0 = time.time()

        try:
            if path == "/ping":
                return self._respond({
                    "ok": True, "data_loaded": _DATA_LOADED,
                    "paslon_count": len(_PASLON),
                    "time": f"{(time.time()-t0)*1000:.0f}ms",
                })

            if path == "/kecamatan":
                data = get_kecamatan()
                LOG(f"GET /kecamatan -> {len(data)}r ({(time.time()-t0)*1000:.0f}ms)")
                return self._respond(data)

            if path == "/desa":
                kid = int(qs["kecamatan_id"][0]) if "kecamatan_id" in qs else None
                data = get_desa(kid)
                LOG(f"GET /desa -> {len(data)}r ({(time.time()-t0)*1000:.0f}ms)")
                return self._respond(data)

            if path.startswith("/desa/"):
                parts = path.split("/")
                if len(parts) == 3 and parts[2].isdigit():
                    data = get_desa_by_id(int(parts[2]))
                    if not data:
                        return self._respond({"error": "Desa tidak ditemukan"}, 404)
                    LOG(f"GET /desa/{parts[2]} ({(time.time()-t0)*1000:.0f}ms)")
                    return self._respond(data)

            if path == "/paslon/compare":
                ids_str = qs.get("ids", [""])[0]
                id_list = [int(x) for x in ids_str.split(",") if x.strip()]
                paslon_list = get_paslon_by_ids(id_list)
                if len(paslon_list) < 2:
                    return self._respond({"error": "Minimal 2 calon"}, 400)
                LOG(f"GET /paslon/compare -> {len(paslon_list)}p ({(time.time()-t0)*1000:.0f}ms)")
                return self._respond({"desa": paslon_list[0].get("desa_nama", ""), "paslon": paslon_list})

            if path.startswith("/paslon/"):
                parts = path.split("/")
                if len(parts) == 3 and parts[2].isdigit():
                    data = get_paslon(int(parts[2]))
                    if not data:
                        return self._respond({"error": "Calon tidak ditemukan"}, 404)
                    LOG(f"GET /paslon/{parts[2]} ({(time.time()-t0)*1000:.0f}ms)")
                    return self._respond(data)

            return self._respond({"error": "Not Found"}, 404)

        except Exception as e:
            LOG(f"ERROR: {traceback.format_exc()}")
            return self._respond({"error": str(e)}, 500)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        t0 = time.time()

        try:
            if path != "/cocokkan":
                return self._respond({"error": "Not Found"}, 404)

            length = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(length)) if length else {}

            desa_id = int(req.get("desa_id", 0))
            visi_user = (req.get("visi_user") or "").strip()
            misi_idx = req.get("misi_user") or []
            pendidikan_min = req.get("pendidikan_min") or "SD"
            umur_min = int(req.get("umur_min", 25))
            umur_max = int(req.get("umur_max", 60))

            if not visi_user:
                return self._respond({"error": "Visi wajib diisi"}, 400)

            t1 = time.time()
            d = _DESA_BY_ID.get(desa_id)
            if not d:
                return self._respond({"error": "Desa tidak ditemukan"}, 404)
            desa_nama = d["nama"]
            paslon_list = _PASLON_BY_DESA_ID.get(desa_id, [])
            if not paslon_list:
                return self._respond({"error": "Tidak ada calon"}, 400)

            LOG(f"  Memory fetch: {len(paslon_list)}p ({(time.time()-t1)*1000:.0f}ms)")
            t2 = time.time()

            all_misi = []
            for p in paslon_list:
                for m in p["misi"]:
                    if m not in all_misi:
                        all_misi.append(m)
            user_misi_set = {all_misi[i] for i in misi_idx if i < len(all_misi)}
            LOG(f"  Misi: ({(time.time()-t2)*1000:.0f}ms)")

            t3 = time.time()
            user_tf = compute_tf(visi_user)
            all_tfs = [p["tf"] for p in paslon_list] + [user_tf]
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
            for p in paslon_list:
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
                p = next(x for x in paslon_list if x["id"] == r["paslon_id"])
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
            LOG(f"POST /cocokkan done ({(time.time()-t0)*1000:.0f}ms)")

            return self._respond({
                "desa": desa_nama, "results": results,
                "user_input": {
                    "visi": visi_user, "misi_count": len(misi_idx),
                    "pendidikan_min": pendidikan_min, "umur_min": umur_min, "umur_max": umur_max,
                },
            })

        except Exception as e:
            LOG(f"ERROR: {traceback.format_exc()}")
            return self._respond({"error": str(e)}, 500)


