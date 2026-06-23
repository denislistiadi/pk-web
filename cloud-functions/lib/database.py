import sqlite3, json, os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pahamkades.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_kecamatan():
    conn = get_db()
    rows = conn.execute("SELECT id, nama FROM kecamatan ORDER BY nama").fetchall()
    conn.close()
    return [{"id": r["id"], "nama": r["nama"]} for r in rows]

def get_desa(kecamatan_id=None):
    conn = get_db()
    query = """
        SELECT d.id, d.nama, d.kecamatan_id, k.nama as kecamatan,
               (SELECT COUNT(*) FROM paslon WHERE desa_id = d.id) as paslon_count
        FROM desa d
        JOIN kecamatan k ON k.id = d.kecamatan_id
    """
    params = []
    if kecamatan_id:
        query += " WHERE d.kecamatan_id = ?"
        params.append(kecamatan_id)
    query += " ORDER BY k.nama, d.nama"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_desa_by_id(desa_id):
    conn = get_db()
    row = conn.execute("""
        SELECT d.id, d.nama, d.kecamatan_id, k.nama as kecamatan
        FROM desa d
        JOIN kecamatan k ON k.id = d.kecamatan_id
        WHERE d.id = ?
    """, (desa_id,)).fetchone()
    if not row:
        conn.close()
        return None
    paslon_rows = conn.execute("""
        SELECT id, desa_id, nomor_urut, nama, visi, misi_json, pendidikan, umur, foto_url
        FROM paslon WHERE desa_id = ?
        ORDER BY nomor_urut
    """, (desa_id,)).fetchall()
    conn.close()
    desa = dict(row)
    paslon_list = []
    for p in paslon_rows:
        p = dict(p)
        p["misi"] = json.loads(p["misi_json"])
        del p["misi_json"]
        paslon_list.append(p)
    desa["paslon"] = paslon_list
    return desa

def get_paslon(paslon_id):
    conn = get_db()
    row = conn.execute("""
        SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json, p.pendidikan, p.umur, p.foto_url,
               d.nama as desa_nama
        FROM paslon p
        JOIN desa d ON d.id = p.desa_id
        WHERE p.id = ?
    """, (paslon_id,)).fetchone()
    conn.close()
    if not row:
        return None
    p = dict(row)
    p["misi"] = json.loads(p["misi_json"])
    del p["misi_json"]
    return p

def get_paslon_by_ids(ids):
    if not ids:
        return []
    placeholders = ",".join("?" * len(ids))
    conn = get_db()
    rows = conn.execute(f"""
        SELECT p.id, p.desa_id, p.nomor_urut, p.nama, p.visi, p.misi_json, p.pendidikan, p.umur, p.foto_url,
               d.nama as desa_nama
        FROM paslon p
        JOIN desa d ON d.id = p.desa_id
        WHERE p.id IN ({placeholders})
        ORDER BY p.nomor_urut
    """, ids).fetchall()
    conn.close()
    result = []
    for p in rows:
        p = dict(p)
        p["misi"] = json.loads(p["misi_json"])
        del p["misi_json"]
        result.append(p)
    return result
