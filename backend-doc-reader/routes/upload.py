from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ingestion import ingest_document_from_path
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SUPPORTED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt"
}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Supported types: PDF, DOCX, TXT"
        )

    document_id = str(uuid.uuid4())
    ext = SUPPORTED_TYPES[file.content_type]
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}{ext}")

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        ingest_document_from_path(file_path, document_id, ext)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    return {
        "document_id": document_id,
        "filename": file.filename,
        "message": "Document uploaded and indexed successfully"
    }