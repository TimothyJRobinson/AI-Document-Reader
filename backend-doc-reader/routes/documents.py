from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from services.storage import (
    get_documents,
    delete_document,
    check_db_health,
)

router = APIRouter()

@router.get("/health")
def health_check():
    db_ok = check_db_health()

    if not db_ok:
        raise HTTPException(status_code=503, detail="Database unavailable")

    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "db": "connected"
    }

@router.get("/documents")
def list_documents(request: Request):
    session_id = _require_session(request)
    docs = get_documents(session_id)
    return {"documents": docs}

@router.delete("/documents/{document_id}")
def remove_document(document_id: str, request: Request):
    session_id = _require_session(request)

    deleted = delete_document(document_id, session_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Document '{document_id}' not found or does not belong to this session."
        )

    return {
        "success": True,
        "deleted_id": document_id
    }

def _require_session(request: Request) -> str:
    session_id = request.cookies.get("session_id")

    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="No session found. Please refresh and try again."
        )

    return session_id