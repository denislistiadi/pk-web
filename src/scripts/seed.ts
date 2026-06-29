/**
 * Seed script — rebuild SQLite database from data/seed-data.json
 * Usage: npx tsx src/scripts/seed.ts
 */
import Database from "better-sqlite3"
import { readFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { computeTf } from "../lib/tfidf"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")
const DB_PATH = join(ROOT, "src", "data", "pahamkades.db")
const SEED_PATH = join(ROOT, "data", "seed-data.json")

if (!existsSync(SEED_PATH)) {
  console.error(`Seed data not found at ${SEED_PATH}`)
  process.exit(1)
}

mkdirSync(dirname(DB_PATH), { recursive: true })
const db = new Database(DB_PATH)

db.exec(`
  DROP TABLE IF EXISTS paslon;
  DROP TABLE IF EXISTS desa;
  DROP TABLE IF EXISTS kecamatan;

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

const insertKec = db.prepare("INSERT INTO kecamatan (id, nama) VALUES (?, ?)")
const insertDesa = db.prepare("INSERT INTO desa (id, nama, kecamatan_id) VALUES (?, ?, ?)")
const insertPaslon = db.prepare(
  "INSERT INTO paslon (id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url, tf_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
)

const tx = db.transaction(() => {
  for (const k of seedData.kecamatan) insertKec.run(k.id, k.nama)
  for (const d of seedData.desa) insertDesa.run(d.id, d.nama, d.kecamatan_id)
  for (const p of seedData.paslon) {
    const tf = computeTf(p.visi + " " + p.misi.join(" "))
    insertPaslon.run(p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, JSON.stringify(p.misi), p.pendidikan, p.umur, p.foto_url ?? null, JSON.stringify(tf))
  }
})

tx()
db.close()

console.log(`Seeded: ${seedData.kecamatan.length} kecamatan, ${seedData.desa.length} desa, ${seedData.paslon.length} paslon`)
