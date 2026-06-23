import sqlite3, json, os

DB_PATH = os.path.join(os.path.dirname(__file__), "pahamkades.db")
SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seed-data.json")

def seed():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
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
            FOREIGN KEY (desa_id) REFERENCES desa(id)
        );
    """)

    with open(SEED_PATH, encoding="utf-8") as f:
        data = json.load(f)

    for k in data["kecamatan"]:
        cur.execute("INSERT INTO kecamatan (id, nama) VALUES (?, ?)", (k["id"], k["nama"]))
    for d in data["desa"]:
        cur.execute("INSERT INTO desa (id, nama, kecamatan_id) VALUES (?, ?, ?)", (d["id"], d["nama"], d["kecamatan_id"]))
    for p in data["paslon"]:
        cur.execute(
            "INSERT INTO paslon (id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (p["id"], p["desa_id"], p["nomor_urut"], p["nama"], p["visi"], json.dumps(p["misi"]), p["pendidikan"], p["umur"], p.get("foto_url")),
        )

    conn.commit()
    conn.close()
    print(f"Seeded: {len(data['kecamatan'])} kecamatan, {len(data['desa'])} desa, {len(data['paslon'])} paslon")

if __name__ == "__main__":
    seed()
