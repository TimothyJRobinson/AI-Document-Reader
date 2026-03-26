import sqlite3
import os
import uuid
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "documents.db")
FAISS_INDEX_DIR = os.getenv("FAISS_INDEX_DIR", "faiss_indexes")

def init_db():
    os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id          TEXT PRIMARY KEY,
            filename    TEXT NOT NULL,
            upload_time TEXT NOT NULL,
            index_path  TEXT NOT NULL,
            session_id  TEXT NOT NULL,
            file_size   INTEGER,
            status      TEXT DEFAULT 'ready'
        )
    """)
    conn.commit()
    conn.close()

def create_document(filename: str, index_path: str, session_id: str, file_size: int = None) -> dict:
    document_id = str(uuid.uuid4())
    upload_time = datetime.utcnow().isoformat()

    conn = _get_conn()
    conn.execute(
        """
        INSERT INTO documents (id, filename, upload_time, index_path, session_id, file_size, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ready')
        """,
        (document_id, filename, upload_time, index_path, session_id, file_size)
    )
    conn.commit()
    conn.close()

    return {
        "id": document_id,
        "filename": filename,
        "upload_time": upload_time,
        "index_path": index_path,
        "session_id": session_id,
        "file_size": file_size,
        "status": "ready"
    }

def get_document_by_id(document_id: str, session_id: str) -> dict | None:
    conn = _get_conn()
    row = conn.execute(
        "SELECT * FROM documents WHERE id = ? AND session_id = ?",
        (document_id, session_id)
    ).fetchone()
    conn.close()

    return _row_to_dict(row) if row else None

def get_documents(session_id: str) -> list[dict]:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM documents WHERE session_id = ? ORDER BY upload_time DESC",
        (session_id,)
    ).fetchall()
    conn.close()

    docs = [_row_to_dict(row) for row in rows]

    for doc in docs:
        doc.pop("index_path", None)

    return docs

def delete_document(document_id: str, session_id: str) -> bool:
    doc = get_document_by_id(document_id, session_id)

    if not doc:
        return False

    _cleanup_index_file(doc["index_path"])

    conn = _get_conn()
    conn.execute(
        "DELETE FROM documents WHERE id = ? AND session_id = ?",
        (document_id, session_id)
    )
    conn.commit()
    conn.close()

    return True

def check_db_health() -> bool:
    try:
        conn = _get_conn()
        conn.execute("SELECT 1 FROM documents LIMIT 1")
        conn.close()
        return True
    except Exception:
        return False

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _row_to_dict(row: sqlite3.Row) -> dict:
    return dict(row)


def _cleanup_index_file(index_path: str):
    for path in [index_path, index_path.replace(".faiss", ".pkl")]:
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError as e:
            print(f"[storage] Warning: could not delete {path}: {e}")