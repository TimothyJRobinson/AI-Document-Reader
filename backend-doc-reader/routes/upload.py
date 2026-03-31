from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ingestion import ingest_document
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
            detail=f"Unsupported file type. Supported types: PDF, DOCX, TXT"
        )

    document_id = str(uuid.uuid4())
    ext = SUPPORTED_TYPES[file.content_type]
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}{ext}")

    # Save uploaded file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        ingest_document(file_path, document_id, ext)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    return {
        "document_id": document_id,
        "filename": file.filename,
        "message": "Document uploaded and indexed successfully"
    }
from flask import Blueprint, request, jsonify
from services.ingestion import ingest_document
import uuid, os

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Use PDF, DOCX, or TXT."}), 400

    document_id = str(uuid.uuid4())

    try:
        ingest_document(file, document_id)
        return jsonify({"document_id": document_id, "message": "Document processed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
from fastapi import APIRouter

router = APIRouter()
