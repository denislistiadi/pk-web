"""Export SQLite database → data.json (for zero-I/O runtime)."""
import sqlite3, json, os

DB_PATH = os.path.join(os.path.dirname(__file__), "pahamkades.db")
OUT_PATH = os.path.join(os.path.dirname(__file__), "data.json")

def export():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    kec = [dict(r) for r in conn.execute("SELECT id, nama FROM kecamatan ORDER BY nama")]
    desa = [dict(r) for r in conn.execute("SELECT id, nama, kecamatan_id FROM desa ORDER BY id")]

    paslon = []
    for r in conn.execute("SELECT * FROM paslon ORDER BY id"):
        p = dict(r)
        p["misi"] = json.loads(p.pop("misi_json"))
        p["tf"] = json.loads(p.pop("tf_json"))
        p.pop("foto_url", None)
        paslon.append(p)

    conn.close()

    data = {"kecamatan": kec, "desa": desa, "paslon": paslon}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(kec)} kec, {len(desa)} desa, {len(paslon)} paslon -> {OUT_PATH}")

if __name__ == "__main__":
    export()
