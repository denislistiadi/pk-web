# Paham Kades — Context Summary

## Project
Paham Kades: Web app untuk mengecek kecocokan calon kepala desa se-Kabupaten Pemalang.
Pengunjung isi form preferensi → sistem matching TF-IDF → ranking calon paling cocok.
Juga ada fitur compare 2-3 calon side-by-side.

## Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui components
- Backend: FastAPI, Pydantic, SQLite, pure Python TF-IDF (no scikit-learn/numpy)
- Platform: EdgeOne Pages (serverless cloud function + static site)
- Database: SQLite file (pahamkades.db), 14 kecamatan, 50 desa, 133 paslon

## Routes (6 pages)
| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage with features & how-to |
| `/desa` | `src/app/desa/page.tsx` | Desa list + search + filter kecamatan |
| `/desa/[id]` | `src/app/desa/[id]/page.tsx` | Detail desa + daftar paslon + action buttons |
| `/desa/[id]/form` | `src/app/desa/[id]/form/page.tsx` | Form: visi, misi checklist, pendidikan min, umur range |
| `/desa/[id]/hasil` | `src/app/desa/[id]/hasil/page.tsx` | Ranking hasil kecocokan (data dari sessionStorage) |
| `/desa/[id]/compare` | `src/app/desa/[id]/compare/page.tsx` | Pilih 2-3 paslon, bandingkan side-by-side |

## Backend Endpoints (FastAPI)
| Method | Path | Description |
|---|---|---|
| GET | `/api/kecamatan` | List kecamatan |
| GET | `/api/desa?kecamatan_id=` | List desa with filter |
| GET | `/api/desa/{id}` | Detail desa + paslon array |
| GET | `/api/paslon/{id}` | Detail paslon |
| GET | `/api/paslon/compare?ids=1,2,3` | Compare 2+ paslon |
| POST | `/api/cocokkan` | Submit form, return match ranking |

## Matching Engine (cloud-functions/lib/tfidf.py)
- **TF-IDF** pure Python (tokenize, TF, IDF, cosine similarity)
- **Bobot**: Visi 35%, Misi 30% (Jaccard), Pendidikan 15% (threshold), Umur 20% (range)
- Skor 0-100%, sorted descending

## Key Files
- `data/seed-data.json` — data mentah (edit untuk data riil, lalu `python seed.py`)
- `cloud-functions/seed.py` — seeder database
- `cloud-functions/run_api.py` — helper untuk menjalankan FastAPI dev server
- `next.config.ts` — rewrite `/api/*` → localhost:8088 (untuk dev)
- `src/lib/api.ts` — frontend API client
- `src/lib/types.ts` — TypeScript interfaces

## Known Issues / Todo
- [ ] Belum ada loading skeleton (hanya teks "Memuat data...")
- [ ] Belum ada error handling untuk network failure
- [ ] Belum responsive optimal untuk mobile
- [ ] Data masih fiktif, user perlu isi data riil di seed-data.json
- [ ] Tidak ada fitur auth/login
- [ ] Tidak ada testing

## Cara Run
```bash
# Terminal 1 (backend)
cd cloud-functions && python run_api.py

# Terminal 2 (frontend)
npm run dev
```

## Git
Branch: `main` (12 commits ahead of origin).
Belum pernah push. Origin masih punya template FastAPI asli.
