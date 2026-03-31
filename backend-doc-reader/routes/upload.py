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