# Paham Kades — Pemalang Village Head Candidate Matching

A web application to help Pemalang residents find, compare, and match with village head (Kepala Desa) candidates based on their preferences using TF-IDF similarity scoring.

## Features

- **Browse Candidates** — View all village head candidates across 50 villages in 14 districts of Pemalang
- **Match Check** — Fill in your ideal vision, select important missions, and set education/age preferences to get a ranked match result
- **Candidate Comparison** — Compare 2-3 candidates side-by-side (education, age, vision, missions)
- **Smart Matching** — TF-IDF cosine similarity for vision, Jaccard similarity for missions, weighted scoring (vision 35%, mission 30%, education 15%, age 20%)

## Tech Stack

### Frontend
- **Next.js 15** — React full-stack framework with App Router
- **React 19** — UI library
- **TypeScript** — Type-safe JavaScript
- **Tailwind CSS 4** — Utility-first CSS framework
- **shadcn/ui** — Component system (Button, Card, Badge, Progress, Select, etc.)

### Backend
- **Next.js API Routes** — Server-side endpoints within the same Next.js app
- **better-sqlite3** — SQLite database for seed data
- **TypeScript TF-IDF** — Pure TypeScript matching engine with no external AI dependencies

### Platform
- **EdgeOne Pages** — Serverless hosting (single Next.js deployment)

## Project Structure

```
pk-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Homepage
│   │   ├── globals.css                 # Indonesian theme (red & gold)
│   │   ├── api/
│   │   │   ├── kecamatan/route.ts      # GET /api/kecamatan
│   │   │   ├── desa/
│   │   │   │   ├── route.ts            # GET /api/desa
│   │   │   │   └── [id]/route.ts       # GET /api/desa/{id}
│   │   │   ├── paslon/
│   │   │   │   ├── [id]/route.ts       # GET /api/paslon/{id}
│   │   │   │   └── compare/route.ts    # GET /api/paslon/compare
│   │   │   └── cocokkan/route.ts       # POST /api/cocokkan
│   │   └── desa/
│   │       ├── page.tsx                # Village directory
│   │       └── [id]/
│   │           ├── page.tsx            # Village detail + candidates
│   │           ├── form/page.tsx       # Preference form
│   │           ├── hasil/page.tsx      # Match results
│   │           └── compare/page.tsx    # Candidate comparison
│   ├── components/
│   │   ├── layout/                     # Header & Footer
│   │   ├── ui/                         # Reusable UI components
│   │   ├── desa-card.tsx
│   │   └── paslon-card.tsx
│   ├── lib/
│   │   ├── types.ts                    # TypeScript interfaces
│   │   ├── api.ts                      # API client
│   │   ├── utils.ts                    # Utility functions
│   │   ├── data.ts                     # SQLite connector + queries
│   │   ├── tfidf.ts                    # TF-IDF matching engine
│   │   ├── summary.ts                  # Summary generator
│   │   └── matching.ts                 # Cocokkan matching logic
│   ├── data/
│   │   └── pahamkades.db               # SQLite database
│   └── scripts/
│       └── seed.ts                     # Database seeder
├── data/
│   └── seed-data.json                  # Seed data source
├── public/
│   └── favicon.svg                     # PK logo favicon
└── next.config.ts
```

## Quick Start

### Requirements
- Node.js 18+

### Install & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Re-seed Database

If you modify `data/seed-data.json`, rebuild the database:

```bash
npx tsx src/scripts/seed.ts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/kecamatan | List all districts |
| GET | /api/desa | List all villages (?kecamatan_id= filter) |
| GET | /api/desa/{id} | Village detail with candidates |
| GET | /api/paslon/{id} | Candidate detail |
| GET | /api/paslon/compare?ids=1,2,3 | Compare 2+ candidates |
| POST | /api/cocokkan | Submit preference form, get match ranking |

### Matching Algorithm Weights

| Criteria | Weight | Method |
|----------|--------|--------|
| Vision (Visi) | 35% | TF-IDF Cosine Similarity |
| Mission (Misi) | 30% | Jaccard Similarity |
| Education | 15% | Threshold scoring |
| Age | 20% | Range scoring |

## Customizing Data

Edit `data/seed-data.json` with real candidate information, then re-seed:

```bash
npx tsx src/scripts/seed.ts
```

## License

MIT
