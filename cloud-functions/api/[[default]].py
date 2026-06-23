"""
Paham Kades — Cek Kecocokan Calon Kepala Desa
Kabupaten Pemalang
"""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "lib"))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List

from database import get_kecamatan, get_desa, get_desa_by_id, get_paslon, get_paslon_by_ids
from models import (
    CocokkanRequest, CocokkanResponse, CocokkanResult,
    CompareResponse, DesaOut, DesaDetailOut, PaslonOut, KecamatanOut,
)
from tfidf import (
    compute_idf, compute_tfidf, cosine_similarity,
    jaccard_similarity, skor_pendidikan, skor_umur,
)

app = FastAPI(
    title="Paham Kades API",
    description="API untuk mencari, membandingkan, dan mencocokkan calon kepala desa",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/kecamatan", response_model=List[KecamatanOut])
async def list_kecamatan():
    return get_kecamatan()

@app.get("/api/desa", response_model=List[DesaOut])
async def list_desa(kecamatan_id: Optional[int] = Query(None)):
    return get_desa(kecamatan_id)

@app.get("/api/desa/{desa_id}", response_model=DesaDetailOut)
async def detail_desa(desa_id: int):
    desa = get_desa_by_id(desa_id)
    if not desa:
        raise HTTPException(404, "Desa tidak ditemukan")
    return desa

@app.get("/api/paslon/compare", response_model=CompareResponse)
async def compare_paslon(ids: str = Query(..., description="Comma-separated paslon IDs")):
    id_list = [int(x.strip()) for x in ids.split(",") if x.strip()]
    paslon_list = get_paslon_by_ids(id_list)
    if len(paslon_list) < 2:
        raise HTTPException(400, "Minimal 2 calon untuk perbandingan")
    desa_nama = paslon_list[0].get("desa_nama", "")
    paslon_out = []
    for p in paslon_list:
        paslon_out.append({
            "id": p["id"],
            "desa_id": p["desa_id"],
            "nomor_urut": p["nomor_urut"],
            "nama": p["nama"],
            "visi": p["visi"],
            "misi": p["misi"],
            "pendidikan": p["pendidikan"],
            "umur": p["umur"],
            "foto_url": p.get("foto_url"),
        })
    return CompareResponse(desa=desa_nama, paslon=paslon_out)

@app.get("/api/paslon/{paslon_id}", response_model=PaslonOut)
async def detail_paslon(paslon_id: int):
    paslon = get_paslon(paslon_id)
    if not paslon:
        raise HTTPException(404, "Calon tidak ditemukan")
    return paslon

@app.post("/api/cocokkan", response_model=CocokkanResponse)
async def cocokkan(req: CocokkanRequest):
    desa = get_desa_by_id(req.desa_id)
    if not desa:
        raise HTTPException(404, "Desa tidak ditemukan")
    paslon = desa["paslon"]
    if not paslon:
        raise HTTPException(400, "Tidak ada calon di desa ini")

    # TF-IDF for visi
    visi_texts = [p["visi"] + " " + " ".join(p["misi"]) for p in paslon]
    idf = compute_idf(visi_texts + [req.visi_user])
    user_vec = compute_tfidf(req.visi_user, idf)

    # All misi items across all candidates
    all_misi_items = []
    for p in paslon:
        for m in p["misi"]:
            if m not in all_misi_items:
                all_misi_items.append(m)

    user_misi_set = {all_misi_items[i] for i in req.misi_user if i < len(all_misi_items)}

    results = []
    for p in paslon:
        # Visi score
        p_vec = compute_tfidf(p["visi"] + " " + " ".join(p["misi"]), idf)
        skor_v = cosine_similarity(user_vec, p_vec) * 100

        # Misi score (Jaccard)
        p_misi_set = set(p["misi"])
        skor_m = jaccard_similarity(user_misi_set, p_misi_set) * 100

        # Pendidikan score
        skor_p = skor_pendidikan(p["pendidikan"], req.pendidikan_min)

        # Umur score
        skor_u = skor_umur(p["umur"], req.umur_min, req.umur_max)

        # Total weighted
        total = skor_v * 0.35 + skor_m * 0.30 + skor_p * 0.15 + skor_u * 0.20

        results.append(CocokkanResult(
            paslon_id=p["id"],
            nama=p["nama"],
            nomor_urut=p["nomor_urut"],
            skor_visi=round(skor_v, 1),
            skor_misi=round(skor_m, 1),
            skor_pendidikan=round(skor_p, 1),
            skor_umur=round(skor_u, 1),
            skor_total=round(total, 1),
        ))

    results.sort(key=lambda r: r.skor_total, reverse=True)

    return CocokkanResponse(
        desa=desa["nama"],
        results=results,
        user_input={
            "visi": req.visi_user,
            "misi_count": len(req.misi_user),
            "pendidikan_min": req.pendidikan_min,
            "umur_min": req.umur_min,
            "umur_max": req.umur_max,
        },
    )

@app.exception_handler(404)
async def not_found(request, exc):
    return JSONResponse(status_code=404, content={"error": "Not Found"})

@app.exception_handler(500)
async def server_error(request, exc):
    return JSONResponse(status_code=500, content={"error": "Internal Server Error"})
