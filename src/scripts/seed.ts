/**
 * Seed script — upload seed data to Turso
 * Usage: npx tsx src/scripts/seed.ts
 *
 * Requires TURSO_DB_URL and TURSO_DB_AUTH_TOKEN env vars.
 */
import { createClient } from "@libsql/client"
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")

function loadEnv() {
  const envPath = join(ROOT, ".env")
  const envLocalPath = join(ROOT, ".env.local")
  for (const p of [envPath, envLocalPath]) {
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, "utf-8").split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx === -1) continue
      const k = trimmed.slice(0, eqIdx).trim()
      let v = trimmed.slice(eqIdx + 1).trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (!process.env[k]) process.env[k] = v
    }
  }
}
loadEnv()

const url = process.env.TURSO_DB_URL
const authToken = process.env.TURSO_DB_AUTH_TOKEN

if (!url || !authToken) {
  console.error("Missing TURSO_DB_URL or TURSO_DB_AUTH_TOKEN")
  console.error("Set them in .env.local or as environment variables")
  process.exit(1)
}

const SEED_PATH = join(ROOT, "data", "seed-data.json")
if (!existsSync(SEED_PATH)) {
  console.error(`Seed data not found at ${SEED_PATH}`)
  process.exit(1)
}

const client = createClient({ url, authToken })

async function seed() {
  console.log("Dropping existing tables...")
  await client.executeMultiple(`
    DROP TABLE IF EXISTS paslon;
    DROP TABLE IF EXISTS desa;
    DROP TABLE IF EXISTS kecamatan;
  `)

  console.log("Creating tables...")
  await client.executeMultiple(`
    CREATE TABLE kecamatan (
      id INTEGER PRIMARY KEY,
      nama TEXT NOT NULL
    );
    CREATE TABLE desa (
      id INTEGER PRIMARY KEY,
      nama TEXT NOT NULL,
      kecamatan_id INTEGER NOT NULL,
      FOREIGN KEY (kecamatan_id) REFERENCES kecamatan(id)
    );
    CREATE TABLE paslon (
      id INTEGER PRIMARY KEY,
      desa_id INTEGER NOT NULL,
      nomor_urut INTEGER NOT NULL,
      nama TEXT NOT NULL,
      visi TEXT NOT NULL,
      misi_json TEXT NOT NULL,
      pendidikan TEXT NOT NULL,
      umur INTEGER NOT NULL,
      foto_url TEXT,
      tf_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (desa_id) REFERENCES desa(id)
    );
  `)

  const seedData = JSON.parse(readFileSync(SEED_PATH, "utf-8"))

  console.log(`Inserting ${seedData.kecamatan.length} kecamatan...`)
  for (const k of seedData.kecamatan) {
    await client.execute({
      sql: "INSERT INTO kecamatan (id, nama) VALUES (?, ?)",
      args: [k.id, k.nama],
    })
  }

  console.log(`Inserting ${seedData.desa.length} desa...`)
  for (const d of seedData.desa) {
    await client.execute({
      sql: "INSERT INTO desa (id, nama, kecamatan_id) VALUES (?, ?, ?)",
      args: [d.id, d.nama, d.kecamatan_id],
    })
  }

  console.log(`Computing TF and inserting ${seedData.paslon.length} paslon...`)
  for (const p of seedData.paslon) {
    const tf = computeTf(p.visi + " " + p.misi.join(" "))
    await client.execute({
      sql: "INSERT INTO paslon (id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url, tf_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, JSON.stringify(p.misi), p.pendidikan, p.umur, p.foto_url ?? null, JSON.stringify(tf)],
    })
  }

  client.close()
  console.log(`Done: ${seedData.kecamatan.length} kec, ${seedData.desa.length} desa, ${seedData.paslon.length} paslon`)
}

function computeTf(text: string): Record<string, number> {
  const tokens = text.toLowerCase().match(/\w+/g) || []
  if (!tokens.length) return {}
  const cnt: Record<string, number> = {}
  for (const t of tokens) cnt[t] = (cnt[t] || 0) + 1
  const n = tokens.length
  const res: Record<string, number> = {}
  for (const [k, v] of Object.entries(cnt)) res[k] = v / n
  return res
}

seed().catch(err => {
  console.error("Seed failed:", err)
  process.exit(1)
})
